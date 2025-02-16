import React, { useEffect, useState } from 'react';
import styles from './styles/video.module.scss';

import leaveBtn from '@/assets/icons/leave.png';
import sstBtn from '@/assets/icons/chat_stt.png';
import UserVideoComponent from "@components/chat/UserVideoComponent.tsx";
import Drawer from '@/components/chat/DrawerVideo';
import RoomLeaveModal from '@/components/modal/RoomLeave';
import KeywordModal from '@/components/modal/KeywordVideo';
import RedAlert from '@/components/alert/redAlert';
import "regenerator-runtime/runtime";

import { Client } from "@stomp/stompjs";
import { OpenVidu, Session, Publisher, Subscriber } from "openvidu-browser";

import FeedbackModal from "@components/modal/Feedback.tsx";
import {useNavigate} from "react-router-dom";

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

    //const [chatHistory, setChatHistory] = useState<{ role: string; message: string }[]>([]);
    const [chatHistory] = useState<{ role: string; message: string }[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[] | null>(null); // 사용자들이 고른 키워드
    const [hints, setHints] = useState<{ hint: string }[][]>([]);

    const [isConnecting, setIsConnecting] = useState(true); // 웹소켓 연결 시도 중

    /* stomp client */
    //const [client, setClient] = useState<Client | null>(null);
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

    const [showTimeAlert, setShowTimeAlert] = useState<boolean>(false); // 10초 후 경고창

    /* 세션 종료 여부 플래그 (중복 요청 방지) */
    const [isSessionClosed, setIsSessionClosed] = useState(false);

    /* 피드백 모달 */
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    const [sessionEndType, setSessionEndType] = useState<SessionEndType | null>(null);
    const [matchedUserEmail, setMatchedUserEmail] = useState<string | null>(null);

    // 키워드가 선택될 때마다 selectedKeywords에 추가
    useEffect(() => {
        if (selectedKeyword) {
            setSelectedKeywords((prev) => prev ? [...prev, selectedKeyword] : [selectedKeyword]);
            // 힌트 배열도 새 참조로 만들어 리렌더 유도 (필요 시 로직 추가)
            setHints((prev) => [...(prev || [])]);
        }
    }, [selectedKeyword]);

    // 모든 키워드 선택이 끝나면(=isCompleted) 토큰이 있는 경우 오픈비듀 세션 시작
    useEffect(() => {
        if (isCompleted && token) {
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

                // 10초 후 경고창 표시
                setTimeout(() => {
                    setShowTimeAlert(true);
                }, 10000);

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
    };

    // STOMP client setup
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
                    //console.log("📩 받은 메시지:", message.body);
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
                    else if(response.status === "auto"){
                        // 자동 종료
                        console.log("자동 종료");
                        setSessionEndType(SessionEndType.AUTO);
                        setIsFeedbackOpen(true);
                        stompClient.deactivate();
                    }
                    else if(response.status === "manual" || response.status === "disconnected"){
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
            onDisconnect: () => {
                console.log("❌ STOMP 연결 종료됨")
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
        }, 20000);

        return () => clearTimeout(autoEndTimeout);
    }, [session, token, isSessionClosed, sessionId]);

    /*useEffect(() => {
        const handlePopstate = (event) => {
            console.log("뒤로 가기 또는 앞으로 가기가 발생했습니다.", event);

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
                console.error("STOMP client가 연결되어 있지 않습니다 (뒤로 가기).");
            }
            // 여기에서 웹소켓 연결 해제 등의 처리를 할 수 있습니다.
        };

        window.addEventListener("popstate", handlePopstate);

        return () => {
            window.removeEventListener("popstate", handlePopstate);
        };
    }, []);*/
    // const closeSession = async(sId: string | null) => {
    //     console.log(sId+" "+sessionEndType);
    //     if(!sId) return;
    //     try {
    //         const response = await axios.post('http://localhost:8080/api/chat/video/close', {
    //             historyId: historyId,
    //             sessionId: sId,
    //             sessionEndType: sessionEndType
    //         });
    //         console.log('서버에서 세션 종료 처리 완료: ', response.data)
    //     } catch (error) {
    //         setSessionEndType(SessionEndType.ERROR);
    //         throw error;
    //     }
    // }

    return (
        <div className={styles.page}>
            {/* 설정 메뉴바 */}
            <div className={styles.menu}>
                <Drawer
                    chatHistory={chatHistory}
                    selectedKeywords={selectedKeywords}
                    hints={hints}
                    historyId={historyId ?? 0}
                />
            </div>

            <div className={styles.chat}>
                {/* 채팅 헤더 부분 */}
                <div className={styles.chat__header}>
                    <p className={styles.chat__header__title}>1:1 매칭 스몰토크(오픈비듀)</p>
                    {/* 대화 나가기 아이콘 */}
                    <img
                        src={leaveBtn}
                        onClick={toggleLeave}
                        className={styles.chat__header__img}
                        alt="leave button"
                    />
                </div>
                {session ? (
                    <>
                        <button onClick={leaveSession}>세션 종료</button>
                        <div id="video-container">
                            {publisher && (
                                <div className="stream-container col-md-6 col-xs-6">
                                    <UserVideoComponent streamManager={publisher}/>
                                </div>
                            )}
                            {subscribers.map((sub) => (
                                <div
                                    key={sub.stream.connection.connectionId}
                                    className="stream-container col-md-6 col-xs-6"
                                >
                                    <span>{sub.stream.connection.data}</span>
                                    <UserVideoComponent streamManager={sub}/>
                                </div>
                            ))}

                            <div className={styles.chat__input}>
                                <p className={styles.chat__input__content}>
                                    최근에 간 여행 중에 가장 기억에 남는 여행은 강릉 여행이었어. 나는 바다를 보고 왔어.
                                </p>
                                <img src={sstBtn} className={styles.chat__input__img} alt="sst button"/>
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

            {/* alert창 */}
            {showAlert && (
                <div style={{ zIndex: 9999 }}>
                    <RedAlert
                        message={alertMessage}
                        onClose={() => setShowAlert(false)}
                    />
                </div>
            )}

            {/* 10초 후 경고창 */}
            {showTimeAlert && (
                <div style={{ zIndex: 9999 }}>
                    <RedAlert
                        message="10초가 경과되었습니다!"
                        onClose={() => setShowTimeAlert(false)}
                    />
                </div>
            )}

            {/* 대화 나가기 모달 */}
            <RoomLeaveModal
                isOpen={isLeaveOpen}
                onClose={() => setIsLeaveOpen(false)}
                stopTTS={() => {}}
                //leaveSession={leaveSession} // 모달 내에서 세션 종료 가능하도록
            />

            {/* 피드백 모달 */}
            {sessionEndType === SessionEndType.AUTO && (
                <FeedbackModal
                    isOpen={isFeedbackOpen}
                    historyId={historyId}
                />)}
        </div>
    );
};

export default VideoChatPage;
