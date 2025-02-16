import React, { useEffect, useState } from 'react';
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
import axios from "axios";
import FeedbackModal from "@components/modal/Feedback.tsx";
import { useNavigate } from "react-router-dom";

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

    /* 대화 나가기 모달창 */
    const [isLeaveOpen, setIsLeaveOpen] = useState<boolean>(false);
    const toggleLeave = () => setIsLeaveOpen((prev) => !prev);

    /* 키워드 모달창 - 매칭 후에 뜨도록 초기 상태 false로 변경 */
    const [isKeywordOpen, setIsKeywordOpen] = useState<boolean>(false);

    /* 키워드 상태 */
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    /* alert 창 */
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>(""); //alert 재사용을 위한 메세지

    const [chatHistory, setChatHistory] = useState<{ role: string; message: string }[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[] | null>(); // 사용자들이 고른 키워드
    // const [hints, setHints] = useState<string[] | null>([]); // 키워드에 따른 힌트
    const [hints, setHints] = useState<{ hint: string }[][]>([]);

    const [isConnecting, setIsConnecting] = useState(true); // 웹소켓 연결 시도 중

    /* stomp client */
    // const [client, setClient] = useState<Client | null>(null);
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
    // const [isClose, setIsClose] = useState<boolean>(false);

    const [userJwt, setUserJwt] = useState<string>("");
    const [historyId, setHistoryId] = useState<number | null>(null);
    const [showTimeAlert, setShowTimeAlert] = useState<boolean>(false); // 시간 측정

    /* 세션 종료 여부 플래그 (중복 요청 방지) */
    const [isSessionClosed, setIsSessionClosed] = useState(false);

    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false); // 10초 후 경고창

    const [sessionEndType, setSessionEndType] = useState<SessionEndType | null>(null);
    const [matchedUserEmail, setMatchedUserEmail] = useState<string | null>(null);

    const [selectedMask, setSelectedMask] = useState<string | null>("mask1")
    useEffect(() => {
        if (selectedKeyword) {  // null이 아닐 때만 추가
            setSelectedKeywords(prev => prev ? [...prev, selectedKeyword] : [selectedKeyword]);
            // 힌트 배열도 새 참조로 만들어 리렌더 유도 (필요 시 로직 추가)
            // setHints(prev => [...prev]); // 새로운 배열 참조 생성
            setHints((prev) => [...(prev || [])])
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
        if (token) {
            console.log("📡 OpenVidu 세션 시작");
            const ov = new OpenVidu();
            const newSession: Session = ov.initSession();

            // Add stream creation handler
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

                    // 세션 종료 처리
                    /*newSession.disconnect();
                    closeSession(sessionId)
                        .then(() => {
                            setAlertMessage("상대방이 대화방을 나갔습니다.");
                            setShowAlert(true);
                            // 3초 후 메인으로 이동
                            setTimeout(() => {
                                navigate("/main");
                            }, 1000);
                        })
                        .catch((error) => {
                            console.error("세션 종료 처리 중 오류:", error);
                        });
    
                     */
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

                    // 1분 남으면
                    setTimeout(() => {
                        setShowTimeAlert(true);
                    }, 10000);
                    // }, 9 * 60 * 1000);

                    // 10분 지나면 keyword modal
                    // setTimeout(() => {
                    //     setIsFeedbackOpen(true);
                    //     newSession.disconnect();
                    //     closeSession(newSession.sessionId);
                    //     //leaveSession()
                    //     }, 20000);
                    // }, 10 * 60 * 1000);

                    try {
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

                        console.log("📡 로컬 비디오 퍼블리싱 시작");
                        newSession.publish(newPublisher);
                        setPublisher(newPublisher);
                    } catch (error) {
                        console.error("❌ 카메라 또는 마이크 사용 불가:", error);
                    }
                })
                .catch((error) => console.error("❌ OpenVidu 연결 실패:", error));

            setSession(newSession);
            setIsMatching(false);
        }
    };

    // STOMP client setup useEffect remains the same
    useEffect(() => {
        setIsConnecting(true);
        const userJwtFromStorage = localStorage.getItem("accessToken");
        setUserJwt(userJwtFromStorage || "");

        const stompClient = new Client({
            brokerURL: "ws://localhost:8080/api/ws",
            connectHeaders: {
                access: `${userJwt}`,
            },
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnecting(false);
                console.log("✅ STOMP 연결됨");

                // 매칭 메시지 구독
                stompClient.subscribe("/user/sub/call", (message) => {
                    console.log("📩 받은 메시지:", message.body);
                    const response = JSON.parse(message.body);
                    if (response.status === "waiting") {
                        console.log("🔄 매칭 대기 중...");
                    }
                    else if (response.status === "equal") {
                        setAlertMessage("자신과 1:1 스몰토크를 할 수 없습니다.");
                        setShowAlert(true);
                        stompClient.deactivate();
                        // 3초 후 메인으로 이동
                        setTimeout(() => {
                            navigate("/main");
                        }, 1000);
                    }
                    else if (response.status === "matched") {
                        console.log("🎉 매칭 완료! 토큰:", response.token);
                        setToken(response.token);
                        setHistoryId(response.historyId);
                        setMatchedUserEmail(response.matchedUserEmail);
                        setIsKeywordOpen(true);
                    }
                    else if (response.status === "auto") {
                        // 자동 종료
                        console.log("자동 종료");
                        setSessionEndType(SessionEndType.AUTO);
                        setIsFeedbackOpen(true);
                        stompClient.deactivate();
                    }
                    else if (response.status === "manual" || response.status === "disconnected") {
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
                });
                console.log("🔍 매칭 시도 중...");
                setIsMatching(true);
                // 매칭 요청
                stompClient.publish({
                    destination: "/pub/chat",
                    body: JSON.stringify({
                        type: "REQUEST",
                    }),
                });
            },
            onDisconnect: () => console.log("❌ STOMP 연결 종료됨"),
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
        // setClient(stompClient);
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
        }, 20000);

        return () => clearTimeout(autoEndTimeout);
    }, [session, token, isSessionClosed, sessionId]);


    // const closeSession = async (sessionId: string) => {
    //     try {
    //         const response = await axios.post('/api/chat/video/close', {
    //             historyId: historyId,
    //             sessionId: sessionId
    //         });
    //         console.log('세션이 성공적으로 종료되었습니다.');
    //         return response.data;
    //     } catch (error) {
    //         console.error('세션 종료 중 오류 발생:', error);
    //         throw error;
    //     }
    // }

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
                            {/* 대화 나가기 아이콘 */}
                            <img
                                src={leaveBtn}
                                onClick={leaveSession}
                                // onClick={toggleLeave}
                                className={styles.chat__header__img}
                                alt="leave button"
                            />
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
                                <p className={styles.chat__input__content}>
                                    여기에 stt
                                </p>

                                {/* <img src={sstBtn} className={styles.chat__input__img} alt="sst button" /> */}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {isMatching ? "매칭 중입니다. 잠시만 기다려 주세요..." : "끝났어"}

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