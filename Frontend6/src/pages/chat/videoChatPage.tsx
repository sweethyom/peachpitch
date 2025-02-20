import React, { useEffect, useRef, useState } from 'react';
import styles from './styles/video.module.scss';

import leaveBtn from '@/assets/icons/leave.png';
// import sstBtn from '@/assets/icons/chat_stt.png';
import UserVideoComponent from "@components/chat/mask/UserVideoComponent.tsx";
import Drawer from '@/components/chat/DrawerVideo';
import RoomLeaveModal from '@/components/modal/RoomLeave';
import KeywordModal from '@/components/modal/KeywordVideo';
import RedAlert from '@/components/alert/redAlert';
import "regenerator-runtime/runtime";

import { Client } from "@stomp/stompjs";
import { OpenVidu, Session, Publisher, Subscriber } from "openvidu-browser";
// import axios from "axios";

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import FeedbackModal from "@components/modal/Feedback.tsx";
import { useNavigate } from "react-router-dom";

import MatchingWait from "@/assets/images/chat_matching.png"
import MatchingEnd from "@/assets/images/chat_end.png"
import axios from "axios";

enum SessionEndType {
    MANUAL = "MANUAL",
    AUTO = "AUTO",
    ERROR = "ERROR"
}
enum MessageType {
    REQUEST = "REQUEST",
    TERMINATE = "TERMINATE"
}

const VideoChatPage: React.FC = () => {
    const navigate = useNavigate();

    // stt
    const [_history, setHistory] = useState<string[]>([]);
    const [previousTranscript, setPreviousTranscript] = useState<string>(""); // 이전 문장 저장
    const [isRestarting, setIsRestarting] = useState(false); // 자동 재시작 여부
    const {
        transcript,
        listening,
        resetTranscript,
    } = useSpeechRecognition();

    // ✅ 문장이 완성되었는지 확인하는 정규식
    const sentenceEndRegex = /.*(했다|어요|습니다)[.!?]?$/;

    /* 대화 나가기 모달창 */
    const [isLeaveOpen, setIsLeaveOpen] = useState<boolean>(false);
    //const toggleLeave = () => setIsLeaveOpen((prev) => !prev);

    /* 키워드 모달창 - 매칭 후에 뜨도록 초기 상태 false로 변경 */
    const [isKeywordOpen, setIsKeywordOpen] = useState<boolean>(false);

    /* 키워드 상태 */
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    /* alert 창 */
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>(""); //alert 재사용을 위한 메세지

    /* 지금까지의 대화 내역 */
    const [chatHistory, setChatHistory] = useState<{ role: string; message: string }[]>([]);

    /* 힌트 */
    const [selectedKeywords, setSelectedKeywords] = useState<string[] | null>(null); // 사용자들이 고른 키워드
    const [hints, setHints] = useState<{ hint: string }[][]>([]);

    /* 웹소켓 연결 시도 */
    const [isConnecting, setIsConnecting] = useState(true);

    /* stomp client */
    const [stompClient, setStompClient] = useState<Client | null>(null);

    /* openvidu session */
    const [session, setSession] = useState<Session | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    /* stomp publisher */
    const [publisher, setPublisher] = useState<Publisher | null>(null);

    /* stomp subscribers */
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

    /* openvidu token */
    const [token, setToken] = useState<string | null>(null);

    /* matching 상태 */
    const [isMatching, setIsMatching] = useState<boolean>(false);

    const [userJwt, setUserJwt] = useState<string>("");
    const [historyId, setHistoryId] = useState<number | null>(null);
    const [showTimeAlert, setShowTimeAlert] = useState<boolean>(false); // 시간 측정

    /* 세션 종료 여부 플래그 (중복 요청 방지) */
    const [isSessionClosed, setIsSessionClosed] = useState(false);

    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false); // 10초 후 경고창

    const [_sessionEndType, setSessionEndType] = useState<SessionEndType | null>(null);
    const [matchedUserEmail, setMatchedUserEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    const [selectedMask, setSelectedMask] = useState<string | null>("mask1")
    const userIdRef = useRef<number | null>(null);
    useEffect(() => {
        // userId가 바뀔 때마다 ref 업데이트
        userIdRef.current = userId;
    }, [userId]);

    // 음성인식 있을 때만 자동 재시작
    useEffect(() => {
        if (!listening && !isRestarting && session) {
            setIsRestarting(true);
            const timer = setTimeout(() => {
                try {
                    // mediaStream이 있는 경우에만 STT 재시작
                    if (publisher?.stream) {
                        const mediaStream = publisher.stream.getMediaStream();
                        if (mediaStream && mediaStream.getAudioTracks().length > 0) {
                            const audioTrack = mediaStream.getAudioTracks()[0];
                            const audioStream = new MediaStream([audioTrack]);
                            SpeechRecognition.startListening({
                                stream: audioStream,
                                continuous: true,
                                language: "ko-KR"
                            } as any);
                        }
                    }
                } catch (error) {
                    console.error('STT 재시작 실패:', error);
                }
                setIsRestarting(false);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [listening, isRestarting, session, publisher]);

    /* 채팅 보내기 전 createdAt 변환 */
    const formatDateToBackend = (date: Date): string => {
        return date.toISOString().replace('Z', '').padEnd(26, '0');
    };

    // STT 기록 저장 및 redis 전송(문장이 완성되었을 때만)
    useEffect(() => {
        if (transcript && transcript !== previousTranscript) {
            // ✅ 문장이 완성된 경우 저장 (길이 60자 이상 OR 종결어미 OR 마침표 포함)
            if (transcript.length > 100 || sentenceEndRegex.test(transcript)) {
                setHistory((prevHistory) => [...prevHistory, transcript]); // 기존 기록에 추가
                const saveTranscript = async () => {
                    try {
                        const createdAt: string = formatDateToBackend(new Date()); // Date → string 변환
                        console.log(createdAt)
                        const response = await axios.post(
                            'https://peachpitch.site/api/chat/video/save/temp',
                            {
                                historyId: historyId,
                                message: transcript,
                                userId: userId,
                                createdAt: createdAt
                            },
                            {
                                headers: {
                                    access: userJwt
                                },
                            }
                        );
                        console.log(response);
                    } catch (error) {
                        console.error("Error saving transcript:", error);
                    }
                };
                saveTranscript();
                setPreviousTranscript(transcript); // 이전 문장 업데이트
                resetTranscript(); // 저장 후 초기화
            }
        }
    }, [transcript, previousTranscript]);

    useEffect(() => {
        if (selectedKeyword) {  // null이 아닐 때만 추가
            setSelectedKeywords(prev => prev ? [...prev, selectedKeyword] : [selectedKeyword]);
            setHints((prev) => [...(prev || [])]);
        }
    }, [selectedKeyword]);

    useEffect(() => {
        if (isCompleted && token) {
            //console.log("선택된 키워드(전부 다 선택)" + selectedKeyword)
            setIsKeywordOpen(false);
            initializeOpenViduSession();
        }
    }, [isCompleted, token]);

    const initializeOpenViduSession = () => {
        if (!token) return;

        console.log("📡 OpenVidu 세션 시작");
        const ov = new OpenVidu();
        const newSession: Session = ov.initSession();

        // 새 스트림이 생길 때
        newSession.on("streamCreated", (event: any) => {
            console.log("📡 새 구독자 추가");
            const subscriber: Subscriber = newSession.subscribe(event.stream, undefined);
            setSubscribers((prev) => [...prev, subscriber]);
        });

        newSession.on("streamDestroyed", (event: any) => {
            console.log("❌ 상대방 스트림 종료:", event);
            // 해당 subscriber를 목록에서 제거
            setSubscribers((prevSubscribers) => {
                return prevSubscribers.filter(
                    (sub) => sub.stream.streamId !== event.stream.streamId
                );
            });

            // 상대방이 나갔을 때의 처리
            if (!isSessionClosed) {
                setSessionEndType(SessionEndType.MANUAL);
                setIsSessionClosed(true);
            }
        });

        // 세션이 완전히 끊어졌을 때
        newSession.on("sessionDisconnected", (event: any) => {
            console.log("❌ 세션 연결 종료됨:", event);
            setSession(null);
            setPublisher(null);
            setSubscribers([]);
            setToken(null);
            setStompClient(null);
            setSessionId(null);
            setIsMatching(false);
            setIsKeywordOpen(false);
            setSelectedKeyword(null);
        });

        newSession
            .connect(token)
            .then(async () => {
                console.log("✅ OpenVidu 연결 성공");
                setSessionId(newSession.sessionId);

                // 30초 후 경고창 표시
                setTimeout(() => {
                    setShowTimeAlert(true);
                }, 30000);

                try {
                    // 로컬 비디오/오디오 스트림
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true,
                    });

                    const newPublisher: Publisher = ov.initPublisher(undefined, {
                        videoSource: stream.getVideoTracks()[0],
                        audioSource: stream.getAudioTracks()[0],
                        publishAudio: true,
                        publishVideo: true,
                        resolution: "640x480",
                        frameRate: 30,
                        insertMode: "APPEND",
                        mirror: false,
                    });


                    // stt 권한 가져감
                    /*
                    const devices = await ov.getDevices();
                    console.log("Devices:", devices.map(device => ({
                        kind: device.kind,
                        label: device.label,
                        deviceId: device.deviceId
                    })));

                    const videoDevices = devices.filter(device => device.kind === 'videoinput');
                    console.log("Video Devices:", videoDevices.map(device => ({
                        label: device.label,
                        deviceId: device.deviceId
                    })));
                     */

                    // newPublisher.on('streamCreated') 대신 다음 이벤트들을 사용
                    newPublisher.on('accessAllowed', () => {
                        console.log("미디어 접근 허용됨");
                    });

                    newPublisher.on('streamCreated', () => {
                        console.log("publisher 초기화");
                        if (newPublisher?.stream) {
                            console.log("publisher stream")
                            const mediaStream = newPublisher.stream.getMediaStream();
                            if (mediaStream && mediaStream.getAudioTracks().length > 0) {
                                const audioTrack = mediaStream.getAudioTracks()[0];
                                const audioStream = new MediaStream([audioTrack]);
                                try {
                                    //SpeechRecognition.stopListening();
                                    SpeechRecognition.startListening({
                                        stream: audioStream,  // 전체 스트림 사용
                                        continuous: true // true 하면 로컬에서는 충돌

                                    } as any);
                                    console.log("speech recognition")
                                } catch (error) {
                                    console.error('STT 초기화 실패:', error);
                                    // STT 실패해도 화상회의는 계속 진행되도록
                                }
                            } else console.log("mediastream 없음");
                        } else console.log("publisher stream 없음")
                    })

                    console.log("📡 로컬 비디오 퍼블리싱 시작");
                    await newSession.publish(newPublisher);
                    setPublisher(newPublisher);

                } catch (error) {
                    console.error("❌ 카메라 또는 마이크 사용 불가:", error);
                }
            })
            .catch((error) => console.error("❌ OpenVidu 연결 실패:", error));

        setSession(newSession);
        setIsMatching(false);
    };

    // STOMP client setup
    useEffect(() => {
        setIsConnecting(true);
        const userJwtFromStorage = localStorage.getItem("accessToken");
        setUserJwt(userJwtFromStorage || "");

        const stompClient = new Client({
            brokerURL: "wss://peachpitch.site/api/ws",
            heartbeatIncoming: 0,  // 4초마다 서버로부터 heart-beat 수신
            heartbeatOutgoing: 0,   // 4초마다 서버로 heart-beat 전송
            connectHeaders: {
                access: `${userJwt}`,
            },
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnecting(false);
                console.log("✅ STOMP 연결됨");
                // 매칭 메시지 구독
                stompClient.subscribe("/user/sub/call", (message) => {
                    //console.log("📩 받은 메시지:", message.body);
                    const response = JSON.parse(message.body);

                    if (response.status === "waiting") {
                        console.log("🔄 매칭 대기 중...");
                    } else if (response.status === "equal") {
                        setAlertMessage("자신과 1:1 스몰토크를 할 수 없습니다.");
                        setShowAlert(true);
                        stompClient.deactivate();
                        // 3초 후 메인으로 이동
                        setTimeout(() => {
                            navigate("/main");
                        }, 1000);
                    } else if (response.status === "matched") {
                        if (token || session) return;
                        console.log("🎉 매칭 완료! 토큰:", response.token);
                        setToken(response.token);
                        setUserId(response.userId);
                        setHistoryId(response.historyId);
                        setMatchedUserEmail(response.matchedUserEmail);
                        setIsKeywordOpen(true);
                    } else if (response.status === "auto") {
                        // 자동 종료
                        console.log("자동 종료");
                        setSessionEndType(SessionEndType.AUTO);
                        setIsFeedbackOpen(true);
                        stompClient.deactivate();
                    } else if (response.status === "manual" || response.status === "disconnected") {
                        // 강제 종료
                        console.log("누군가 나감");
                        setAlertMessage("상대방이 대화방을 나갔습니다.");
                        setShowAlert(true);
                        stompClient.deactivate();
                        // 3초 후 메인으로 이동
                        setTimeout(() => {
                            navigate("/main");
                        }, 1000);
                    }
                    else if (response.status === "chat") {
                        // 채팅 저장
                        if (Number(response.userId) === userIdRef.current) {
                            // 내자신이 말함
                            setChatHistory((prev) => [...prev, { role: "user", message: response.content }]);
                        }
                        else {
                            //다른 사람이 말함
                            setChatHistory((prev) => [...prev, { role: "other", message: response.content }]);
                        }
                    }
                });
                if (!isMatching) {
                    console.log("🔍 매칭 시도 중...");
                    setIsMatching(true);
                    // 매칭 요청
                    stompClient.publish({
                        destination: "/pub/chat",
                        body: JSON.stringify({
                            type: "REQUEST",
                        }),
                    });
                }
            },
            onDisconnect: () => {
                console.log("❌ STOMP 연결 종료됨")
                setIsMatching(false);
                setSession(null);
                setStompClient(null);
            },
            onStompError: (frame) => {
                console.error("STOMP 에러:", frame);
                setAlertMessage("STOMP 에러");
                setShowAlert(true);
                stompClient.deactivate();
            },
            onWebSocketError: (event) => {
                console.error("WebSocket 에러:", event);
                if (!isConnecting) {
                    setAlertMessage("WebSocket 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                    setShowAlert(true);
                }
                stompClient.deactivate();
            }
        });

        stompClient.activate();
        setStompClient(stompClient);

        return () => {
            // 언마운트 시 STOMP 연결 해제
            stompClient.deactivate();
        };
    }, [userJwt]);

    // 의도적으로 세션 종료
    const leaveSession = async (): Promise<void> => {
        // 이미 종료된 상태라면 무시
        if (!session || isSessionClosed) return;

        setIsSessionClosed(true); // 중복 호출 방지

        console.log("📴 사용자가 수동으로 세션 종료");
        session.disconnect();
        if (stompClient) {
            const terminationMessage = {
                type: MessageType.TERMINATE,
                sessionId: sessionId,
                historyId: historyId,
                matchedUserEmail: matchedUserEmail,
                sessionEndType: SessionEndType.MANUAL,
            };
            stompClient.publish({
                destination: "/pub/chat",
                body: JSON.stringify(terminationMessage),
            });
        } else {
            console.error("STOMP client가 연결되어 있지 않습니다.");
        }
        navigate("/main");
    };

    // 자동 종료 처리
    useEffect(() => {
        if (!session || !token) return;

        const autoEndTimeout = setTimeout(async () => {
            if (!isSessionClosed) {
                setIsSessionClosed(true);
                const currentSessionId = sessionId;
                console.log("⏰ 20초 타임아웃으로 자동 종료");
                session.disconnect();

                if (stompClient) {
                    const terminationMessage = {
                        type: MessageType.TERMINATE,
                        sessionId: currentSessionId,
                        historyId: historyId,
                        matchedUserEmail: matchedUserEmail,
                        sessionEndType: SessionEndType.AUTO,
                    };
                    stompClient.publish({
                        destination: "/pub/chat",
                        body: JSON.stringify(terminationMessage),
                    });
                } else {
                    console.error("STOMP client가 연결되어 있지 않습니다 (자동 종료).");
                }
            }
        }, 50000);

        return () => clearTimeout(autoEndTimeout);
    }, [session, token, isSessionClosed, sessionId]);

    useEffect(() => {
        // 컴포넌트가 언마운트될 때 실행되는 cleanup 함수
        return () => {
            // 오디오 스트림 정리
            if (publisher?.stream) {
                const mediaStream = publisher.stream.getMediaStream();
                if (mediaStream) {
                    mediaStream.getAudioTracks().forEach((track) => {
                        track.stop();
                    });
                }
            }

            // STT 정리
            SpeechRecognition.stopListening();
            resetTranscript();

            // // OpenVidu 세션 정리
            // if (session) {
            //     session.disconnect();
            // }
            //
            // // STOMP 연결 정리
            // if (stompClient) {
            //     stompClient.deactivate();
            // }
        };
    }, [publisher]);

    return (
        <div className={styles.page}>
            {/* 설정 메뉴바 */}
            <div className={styles.menu}>
                <Drawer
                    selectedKeywords={selectedKeywords ?? []}
                    // hints={hints ? hints : null}
                    hints={Array.isArray(hints) ? hints.map(group =>
                        Array.isArray(group)
                            ? group.map(hint => (typeof hint === "string" ? { hint } : hint))
                            : [{ hint: group }]
                    ) : null}
                    chatHistory={chatHistory}
                    historyId={historyId}
                    setSelectedMask={setSelectedMask}
                />
            </div>

            <div className={styles.chat}>
                {/* 채팅 헤더 부분 */}

                {session ? (
                    <>
                        <div className={styles.chat__header}>
                            <p className={styles.chat__header__title}>1:1 매칭 스몰토크(오픈비듀)</p>
                            <div>
                            </div>
                            {/* 대화 나가기 아이콘 */}
                            <img
                                src={leaveBtn}
                                onClick={leaveSession}
                                // onClick={toggleLeave}
                                className={styles.chat__header__img}
                                alt="leave button"
                            />
                        </div>

                        <div className={styles.keywords__wrap}>
                            {selectedKeywords && selectedKeywords.map((keyword, index) => (
                                <span key={index} className={index === 0 ? styles.keywords__keyword1 : styles.keywords__keyword2}>
                                    {keyword}
                                </span>
                            ))}
                        </div>

                        {/* <button >세션 종료</button> */}
                        <div id="video-container">
                            <div className={styles.chat__other}>
                                {/* 상대방 캠 */}
                                {subscribers.map((sub) => (
                                    <div
                                        key={sub.stream.connection.connectionId}
                                        className={styles.chat__other__video}>
                                        <span>{sub.stream.connection.data}</span>
                                        <UserVideoComponent streamManager={sub} selectedMask={selectedMask} isLocalUser={false} />
                                    </div>
                                ))}
                                <div className={styles.chat__other__bubble}>
                                    <div className={styles.bubble__left}>
                                        이거는 상대방 말 풍선
                                    </div>
                                </div>
                            </div>

                            <div className={styles.chat__user}>
                                <div className={styles.chat__user__bubble}>
                                    <div className={styles.bubble__right}>
                                        이거는 상대방 말 풍선
                                    </div>
                                </div>
                                {/* 사용자 캠 */}
                                {publisher && (
                                    <div className={styles.chat__user__video}>
                                        <UserVideoComponent streamManager={publisher} selectedMask={selectedMask} isLocalUser={true} />
                                    </div>
                                )}

                            </div>

                            <div className={styles.chat__input}>
                                {/* <p>🎤 Microphone: {listening ? 'on' : 'off'}</p>
                                <button onClick={() => SpeechRecognition.startListening({ continuous: true, language: "ko-KR" })}>
                                    Start
                                </button>
                                <button onClick={() => SpeechRecognition.stopListening()}>Stop</button>
                                <button onClick={resetTranscript}>Reset</button>
                                <h3>📝 실시간 STT</h3> */}
                                <p>{transcript}</p>
{/* 
                                <h3>📜 이전 대화 기록</h3>
                                <div id="history">
                                    {history.map((item, index) => (
                                        <p key={index}>🗣 {item}</p>
                                    ))}
                                </div> */}

                                {/* <img src={sstBtn} className={styles.chat__input__img} alt="sst button" /> */}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {isMatching ? (
                            <div className={styles.wait}>
                                <div className={styles.wait__wrap}>
                                    <img src={MatchingWait} className={styles.wait__img} />
                                    <p className={styles.wait__red}>[주의] 화면을 벗어나면 매칭이 취소됩니다.</p>
                                </div>
                            </div>

                        ) : (
                            <div className={styles.wait}>
                                <div className={styles.wait__wrap}>
                                    <img src={MatchingEnd} className={styles.wait__img} />
                                </div>
                            </div>
                        )}

                    </>
                )}

            </div>

            {/* 키워드 모달 */}
            <KeywordModal
                isOpen={isKeywordOpen}
                setSelectedKeyword={setSelectedKeyword}
                setHints={setHints}
                setIsCompleted={setIsCompleted}
                historyId={historyId ?? 0}
            />

            {/* 키워드 선택안했을 경우 뜨는 alert창 */}
            {showAlert && (
                <div style={{ zIndex: 9999 }}>
                    <RedAlert
                        message={alertMessage}
                        onClose={() => setShowAlert(false)}
                    />
                </div>
            )}

            {showTimeAlert && (
                <div style={{ zIndex: 9999 }}>
                    <RedAlert
                        message="10초가 경과되었습니다!"
                        onClose={() => setShowTimeAlert(false)}
                    />
                </div>
            )}

            {/* 대화 나가기 모달 */}
            <RoomLeaveModal isOpen={isLeaveOpen} onClose={() => setIsLeaveOpen(false)} stopTTS={() => {
            }} />

            {/* 피드백 모달 */}
            <FeedbackModal isOpen={isFeedbackOpen} historyId={historyId} />
        </div>
    );
};

export default VideoChatPage;