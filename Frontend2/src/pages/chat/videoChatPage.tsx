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

  /* alert 창 */
  const [showAlert, setShowAlert] = useState(false);

  const [chatHistory, setChatHistory] = useState<{ role: string; message: string }[]>([]);

  /* 시작하기 버튼 클릭 시 */
  const handleStartClick = () => {
    if (!selectedKeyword) {
      setShowAlert(true);
      return;
    }
    setIsKeywordOpen(false); // 키워드가 선택된 경우 모달 닫기
  };

  /* OpenVidu 관련 */
  const [client, setClient] = useState<Client | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [userJwt, setUserJwt] = useState<string>("");
  const [isWaiting, setIsWaiting] = useState(true);

  useEffect(() => {
    const userJwtFromStorage = localStorage.getItem("accessToken");
    setUserJwt(userJwtFromStorage || "");
    console.log("stomp call " + userJwt);
    const stompClient = new Client({
      brokerURL: "ws://peachpitch.site/ws/room",
      connectHeaders: {
        access: `${userJwt}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ STOMP 연결됨");
        stompClient.subscribe(`/user/sub/call`, (message) => {
          console.log("📩 받은 메시지:", message.body);
          console.log(message.body);
          const response = JSON.parse(message.body);
          const data = response;
          if (data.status === "waiting") {
            console.log("🔄 매칭 대기 중...");
          } else if (data.status === "matched") {
            console.log("🎉 매칭 완료! 토큰:", data.token);
            setToken(data.token);
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

            const cloned = stream.clone(); // 이거 나중에 주석

            // cloned 대신 stream쓰기
            const newPublisher: Publisher = ov.initPublisher(undefined, {
              videoSource: cloned.getVideoTracks()[0],
              audioSource: cloned.getAudioTracks()[0],
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

  const handleKeywordSelection = (keyword: string) => {
    setSelectedKeyword(keyword);
    setIsKeywordOpen(false);
    setIsWaiting(true);
  };

  useEffect(() => {
    if (subscribers.length > 0) {
      setIsWaiting(false);
    }
  }, [subscribers]);

  const navigate = useNavigate();
  const handleLeave = () => {
    if (session) {
      session.disconnect();
      setSession(null);
      setPublisher(null);
      setSubscribers([]);
      setToken(null);
      setIsMatching(false);
    }
    navigate("/main");
  };

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

        {/* 상대방 웹캠 */}
        <div className={styles.chat__other}>
          <div className={styles.chat__other__video}>
            {/* <WebcamComponent /> */}
            {publisher && (
              <UserVideoComponent streamManager={publisher} />
            )}
          </div>
          <div className={styles.chat__other__bubble}>
            <div className={styles.bubble__left}>
              {selectedKeyword || "여행"}에 대해 이야기 나누기 좋아요! 최근에 가장 기억에 남는 일이 있으신가요?
            </div>
          </div>
        </div>

        {/* 사용자 웹캠 */}
        <div className={styles.chat__user}>
          <div className={styles.chat__user__bubble}>
            <div className={styles.bubble__right}>
              최근에 간 여행 중에 가장 기억에 남는 여행은 강릉 여행이었어. 나는 바다를 보고 왔어.
            </div>
          </div>
          <div className={styles.chat__user__video}>
            {subscribers.map((sub) => (
              <div key={sub.stream.connection.connectionId}>
                {/* <span>{sub.stream.connection.data}</span> */}
                <UserVideoComponent streamManager={sub} />
              </div>
            ))}
          </div>
        </div>

        {/* 음성챗 */}
        <div className={styles.chat__input}>
          <p className={styles.chat__input__content}>최근에 간 여행 중에 가장 기억에 남는 여행은 강릉 여행이었어. 나는 바다를 보고 왔어.</p>
          <img src={sstBtn} className={styles.chat__input__img} />
        </div>

      </div>

      {/* 키워드 모달 */}
      {/* <KeywordModal isOpen={isKeywordOpen} setSelectedKeyword={handleKeywordSelection}>
        <div className={styles.btn} onClick={() => selectedKeyword ? setIsKeywordOpen(false) : setShowAlert(true)}>시작하기</div>
      </KeywordModal> */}

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