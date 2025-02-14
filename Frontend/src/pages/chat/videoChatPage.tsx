import styles from './styles/video.module.scss'

import leaveBtn from '@/assets/icons/leave.png'
import sstBtn from '@/assets/icons/chat_stt.png'
// import WebcamComponent from '@/components/chat/WebcamComponent';
import UserVideoComponent from "@components/chat/UserVideoComponent.tsx";

import Drawer from '@/components/chat/DrawerVideo';
import { useEffect, useState } from 'react';

import RoomLeaveModal from '@/components/modal/RoomLeave';
import KeywordModal from '@/components/modal/KeywordVideo';
import RedAlert from '@/components/alert/redAlert';

import { Client } from "@stomp/stompjs";
import { OpenVidu, Session, Publisher, Subscriber } from "openvidu-browser";

// import Wait from "@/components/modal/Wait"
import { useNavigate } from 'react-router-dom';

function videoChatPage() {

  /* 대화 나가기 모달창 */
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const toggleLeave = () => setIsLeaveOpen(!isLeaveOpen);

  /* 키워드 모달창 */
  const [isKeywordOpen, setIsKeywordOpen] = useState(true);
  const toggleKeyword = () => setIsKeywordOpen(!isKeywordOpen);

  /* 키워드 상태 */
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  /* alert 창 */
  const [showAlert, setShowAlert] = useState(false);

  const [chatHistory, setChatHistory] = useState<{ role: string; message: string }[]>([]);

  /* OpenVidu 관련 */
  // const [isWaiting, setIsWaiting] = useState(true);

  /* stomp client */
  const [client, setClient] = useState<Client | null>(null);

  /* openvidu session */
  const [session, setSession] = useState<Session | null>(null);

  /* stomp publisher */
  const [publisher, setPublisher] = useState<Publisher | null>(null);

  /* stomp subscribers */
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  /* openvidu token */
  const [token, setToken] = useState<string | null>(null);

  /* matching 상태 */
  const [isMatching, setIsMatching] = useState(false);

  const [userJwt, setUserJwt] = useState("");
  const [historyId, setHistoryId] = useState<number | null>(null);

  useEffect(() => {
    if (isCompleted) {
      setIsKeywordOpen(false);
    }
  }, [isCompleted]);

  useEffect(() => {
    const userJwtFromStorage = localStorage.getItem("accessToken");
    setUserJwt(userJwtFromStorage || "");
    console.log("stomp call " + userJwt);
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws/room",
      connectHeaders: {
        access: `${userJwt}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ STOMP 연결됨");
        stompClient.subscribe("/user/sub/call", (message) => {
          console.log("📩 받은 메시지:", message.body);
          const response = JSON.parse(message.body);
          if (response.status === "waiting") {
            console.log("🔄 매칭 대기 중...");
          } else if (response.status === "matched") {
            console.log("🎉 매칭 완료! 토큰:", response.token);
            setToken(response.token);
            setHistoryId(response.historyId); // 대화 내역 id 저장

            // 🌟 매칭 완료되었으므로 웹소켓 연결 해제
            console.log("🛑 웹소켓 연결 종료");
            stompClient.deactivate();
          }
        });
        // STOMP 연결이 성공하면 자동으로 매칭 요청
        console.log("🔍 매칭 시도 중...");
        setIsMatching(true);
        stompClient.publish({
          destination: "/pub/request",
        });
      },
      onDisconnect: () => console.log("❌ STOMP 연결 종료됨"),
      onStompError: (frame) => console.error("STOMP 에러:", frame),
      onWebSocketError: (event) => console.error("WebSocket 에러:", event),
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [userJwt]);

  useEffect(() => {
    if (token) {
      console.log("📡 OpenVidu 세션 시작");
      // 매칭이 완료되었으므로 키워드 모달을 열기.
      setIsKeywordOpen(true);
      if (isCompleted) setIsCompleted(false);
      const ov = new OpenVidu();
      const newSession: Session = ov.initSession();

      newSession.on("streamCreated", (event: any) => {
        console.log("📡 새 구독자 추가");
        const subscriber: Subscriber = newSession.subscribe(event.stream, undefined);
        setSubscribers((prev) => [...prev, subscriber]);
      });

      newSession
        .connect(token)
        .then(async () => {
          console.log("✅ OpenVidu 연결 성공");

          // 🎥 getUserMedia로 미디어 권한 요청
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
  }, [token]);

  const leaveSession = (): void => {
    if (session) {
      console.log("📴 세션 종료");
      session.disconnect();
      setSession(null);
      setPublisher(null);
      setSubscribers([]);
      setToken(null);
      setIsMatching(false);
    }
  };

  // const handleKeywordSelection = (keyword: string) => {
  //   setSelectedKeyword(keyword);
  //   setIsKeywordOpen(false);
  //   setIsWaiting(true);
  // };

  // useEffect(() => {
  //   if (subscribers.length > 0) {
  //     setIsWaiting(false);
  //   }
  // }, [subscribers]);

  // const navigate = useNavigate();
  // const handleLeave = () => {
  //   if (session) {
  //     session.disconnect();
  //     setSession(null);
  //     setPublisher(null);
  //     setSubscribers([]);
  //     setToken(null);
  //     setIsMatching(false);
  //   }
  //   navigate("/main");
  // };

  return (
    <div className={styles.page}>

      {/* 설정 메뉴바 */}
      <div className={styles.menu}>
        <Drawer selectedKeyword={selectedKeyword} chatHistory={chatHistory} />
      </div>

      <div className={styles.chat}>
        {/* 채팅 헤더 부분 */}
        <div className={styles.chat__header}>
          <p className={styles.chat__header__title}>1:1 매칭 스몰토크</p>

          {/* 대화 나가기 아이콘 */}
          <img
            src={leaveBtn}
            onClick={toggleLeave}
            className={styles.chat__header__img}
            alt="leave button"
          />
        </div>

        {session ? (
          <div id="video-container">
            {/* 상대방 웹캠 */}
            <div className={styles.chat__other}>
              <div className={styles.chat__other__video}>
                {subscribers.map((sub) => (
                  <UserVideoComponent key={sub.stream.connection.connectionId} streamManager={sub} />
                ))}
              </div>
            </div>

            {/* 사용자 웹캠 */}
            <div className={styles.chat__user}>
              <div className={styles.chat__user__video}>
                {publisher && <UserVideoComponent streamManager={publisher} />}
              </div>
            </div>
          </div>
        ) : (
          <p>{isMatching ? "매칭 중입니다. 잠시만 기다려 주세요..." : "매칭 버튼을 눌러주세요."}</p>
        )}

        {/* 음성챗 */}
        <div className={styles.chat__input}>
          <p className={styles.chat__input__content}>최근에 간 여행 중에 가장 기억에 남는 여행은 강릉 여행이었어. 나는 바다를 보고 왔어.</p>
          <img src={sstBtn} className={styles.chat__input__img} />
        </div>

      </div>

      {/* 키워드 모달 */}
      <KeywordModal
        isOpen={isKeywordOpen}
        setSelectedKeyword={setSelectedKeyword}
        setIsCompleted={setIsCompleted}
        historyId={historyId ?? 0}
      />

      {/* 키워드 선택안했을 경우 뜨는 alert창 */}
      {
        showAlert && (
          <div style={{ zIndex: 9999 }}>
            <RedAlert
              message="키워드를 선택해주세요!"
              onClose={() => setShowAlert(false)}
            />
          </div>
        )
      }
      {/* {isWaiting && <Wait isOpen={isWaiting} onClose={handleLeave} />} */}
      {/* 대화 나가기 모달 */}
      <RoomLeaveModal isOpen={isLeaveOpen} onClose={() => setIsLeaveOpen(false)} stopTTS={() => { }} />
    </div >
  )
}

export default videoChatPage