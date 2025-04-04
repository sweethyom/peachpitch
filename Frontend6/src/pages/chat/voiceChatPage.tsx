import 'regenerator-runtime/runtime';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// import Footer from '@/components/footer/Footer';
import styles from './styles/voice.module.scss';

import leaveBtn from '@/assets/icons/leave.png';
import sttBtn from '@/assets/icons/chat_stt.png';
import sttBtnActive from '@/assets/icons/chat_stt_active.png';

/* AI 영상 */
import Video from '@/components/chat/Video';
import Video_AI_1 from '@/assets/videos/ai_1.mp4';
import Video_AI_2 from '@/assets/videos/ai_2.mp4';
import Video_AI_3 from '@/assets/videos/ai_3.mp4';
import Video_AI_4 from '@/assets/videos/ai_4.mp4';

import WebcamComponent from '@/components/chat/WebcamComponent';
import Drawer from '@/components/chat/Drawer';
import ChatEnd from "@/components/modal/ChatEnd";

import RoomLeaveModal from '@/components/modal/RoomLeave';
import KeywordModal from '@/components/modal/Keyword';
import RedAlert from '@/components/alert/redAlert';

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import { useNavigate } from "react-router-dom";

import ChatStop from "@/assets/icons/chat_stop_btn.png"

function VoiceChatPage() {
  /* 모달 관련 상태 */
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isKeywordOpen, setIsKeywordOpen] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  /* 키워드 상태 */
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(null);
  const [hints, setHints] = useState<string[] | null>(null);

  /* 음성 인식 관련 상태 */
  const [isListening, setIsListening] = useState(false);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  /* 대화 저장 */
  const [messageHistory, setMessageHistory] = useState<{ role: string, message: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');

  const [historyId, setHistoryId] = useState<number | null>(null);

  useEffect(() => {
    if (listening && transcript !== currentMessage) {
      setCurrentMessage(addQuestionMark(transcript));
    }
  }, [transcript, listening, currentMessage]);


  /* 브라우저 지원 여부 확인 */
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <p>브라우저가 음성 인식을 지원하지 않습니다.</p>;
  }

  /* 키워드 선택 후 대화 시작 */
  const handleStartClick = async () => {

    if (!selectedKeyword) {
      setShowAlert(true);
      return;
    }
    setIsKeywordOpen(false);

    try {
      const userJwtFromStorage = localStorage.getItem("accessToken");

      const config = userJwtFromStorage
        ? { headers: { access: `${userJwtFromStorage}` } }
        : {}; // 토큰이 없으면 headers 설정 안 함

      console.log("쿠폰 사용 요청 중...");
      // setMessageHistory((prev) => [...prev, { role: "system", message: "쿠폰 사용 중..." }]);

      const responseFromSpring = await axios.post(
        "https://peachpitch.site/api/chat/ai/keywords",
        { keywordId: selectedKeywordId },
        config
      );

      if (responseFromSpring.status === 401) {
        console.error("Access token expired. Redirecting to login.");
        return;
      }

      const hintResponse = responseFromSpring.data;
      const historyIdFromResponse = hintResponse.data.historyId || null;
      const hints = hintResponse.data.hints;
      setHints(hints);
      setHistoryId(historyIdFromResponse);

      console.log("쿠폰 차감 완료. 대화 시작");
      // setMessageHistory((prev) => [...prev, { role: "system", message: "대화가 시작되었습니다!" }]);

      const response = await axios.post("https://peachpitch.site/ai/start/", {
        keyword: selectedKeyword,
        history_id: historyIdFromResponse,
      });

      const aiResponse = response.data.message;

      setMessageHistory((prev) => [...prev, { role: "ai", message: aiResponse }]);
      playTTS(aiResponse);
    } catch (error: any) {
      console.error("Error starting conversation:", error.response?.data || error.message);
    }
  };

  // 구글 tts api 이용
  const GOOGLE_TTS_API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ✅ Google TTS 요청 함수 */
  const playTTS = async (text: string) => {
    try {
      stopTTS();

      // if (audioRef.current) {
      //   audioRef.current.pause();
      //   audioRef.current.currentTime = 0;
      // }

      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: "ko-KR", ssmlGender: "FEMALE" }, // ✅ 한국어 여성 음성
          audioConfig: { audioEncoding: "MP3" },
        }),
      });

      const data = await response.json();
      if (data.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audioRef.current = audio;

        // ✅ 음성이 시작되면 타이핑 효과 시작
        setIsTyping(true);
        setIsWaiting(false);
        if (text.length > 0) {
          setAiMessage(text[0]); // 첫 글자 즉시 표시
        }
        // setAiMessage('');
        let index = 0;

        const typingEffect = setInterval(() => {
          if (index < text.length) {
            setAiMessage(prev => prev + text[index]);
            index++;
          } else {
            clearInterval(typingEffect);
            setIsTyping(false);
            setLastAiMessage(text);
          }
        }, 50); // 글자당 50ms 간격 (속도 조절 가능)

        audio.play(); // ✅ 음성 재생
      }
    } catch (error) {
      console.error("Google TTS 오류:", error);
    }
  };

  // /* AI 응답이 발생할 때 새로운 영상으로 전환 */
  // const handleNewAIResponse = (aiResponse: string) => {
  //   console.log("🚀 handleNewAIResponse 실행됨!");

  //   let randomVideo;
  //   do {
  //     randomVideo = videos[Math.floor(Math.random() * videos.length)];
  //   } while (randomVideo === currentVideo); // ✅ 같은 비디오 반복 방지

  //   console.log(`🎥 새로운 비디오 설정: ${randomVideo}`);

  //   setNextVideo(randomVideo);
  // };

  /* AI 응답이 발생할 때 새로운 영상으로 전환 */
  // const handleNewAIResponse = () => {
  //   console.log("🚀 handleNewAIResponse 실행됨!");

  //   // 비디오 스택에서 다음 비디오 선택
  //   setVideoStack((prevStack) => {
  //     // 스택에 비디오가 있으면 다음 비디오를 선택하고, 없으면 첫 번째 비디오를 선택
  //     const nextIndex = (prevStack.currentIndex + 1) % videoStack.videos.length;
  //     return {
  //       videos: prevStack.videos,
  //       currentIndex: nextIndex,
  //     };
  //   });
  // };

  // const getNextVideoIndex = () => (currentVideoIndex + 1) % videoStack.length;

  /* AI 응답이 발생할 때 새로운 영상으로 전환 */
  const handleNewAIResponse = (aiResponse: string) => {
    console.log("🚀 handleNewAIResponse 실행됨!");
    console.log(aiResponse)
    // 다음 비디오 인덱스 계산
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };


  /* 사용자가 메시지를 보낼 때 API 호출 */
  const handleUserMessage = async () => {
    if (!currentMessage.trim()) return;

    const modifiedMessage = addQuestionMark(currentMessage);
    setMessageHistory((prev) => [...prev, { role: "user", message: modifiedMessage }]);
    setLastUserMessage(modifiedMessage);

    setAiMessage("");
    setAiResponseBuffer("");

    if (turnCount > 0) {
      try {
        console.log("📡 AI 서버에 요청 중...");
        const response = await axios.post("https://peachpitch.site/ai/chat/", {
          message: modifiedMessage,
          history_id: historyId
        });

        const aiResponse = response.data.message;
        console.log(`📝 AI 응답 받음: ${aiResponse}`);

        // handleNewAIResponse(aiResponse); // ✅ 비디오 변경 트리거
        handleNewAIResponse(aiResponse); // ✅ 비디오 변경 트리거

        setMessageHistory((prev) => [...prev, { role: "ai", message: aiResponse }]);
        setAiResponseBuffer(aiResponse);
        setIsWaiting(false);

        playTTS(aiResponse);
        setTurnCount((prev) => prev - 1);

      } catch (error) {
        console.error("❌ AI 응답 오류:", error);
      }
    }

    resetTranscript();
    setCurrentMessage("");
  };


  /* 음성 인식 버튼 ON/OFF */
  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);

      if (transcript.trim() !== '') {
        handleUserMessage();
      }
    } else {
      resetTranscript();
      setCurrentMessage('');
      SpeechRecognition.startListening({ continuous: true, language: 'ko-KR' });
      setIsListening(true);


      if (turnCount === 0) {
        setIsChatEnd(true);
      }
    }
  };

  /* 특정 대화에 물음표 붙이기 */
  const addQuestionMark = (sentence: string): string => {
    const questionWords = ["넌", "너는", "어디", "뭐", "뭘까", "왜", "어떻게", "언제", "무엇", "몇", "누가", "누구", "어떤"];
    const lastChar = sentence.trim().slice(-1);

    // 문장이 비어있거나 마지막에 이미 물음표가 있다면 그대로 반환
    if (!sentence.trim() || lastChar === "?" || lastChar === "!" || lastChar === ".") {
      return sentence;
    }

    // 질문 단어 포함 여부 확인 후 물음표 추가
    if (questionWords.some(word => sentence.includes(word))) {
      return `${sentence.trim()}?`;
    }

    return sentence; // 기본적으로 변경 없음
  };

  /* 대화 종료 모달창 */
  const navigate = useNavigate();

  /* turn 카운트 숫자를 10에서 적은 수로 줄이면 빠르게 다음 단계를 테스트 해 볼 수 있음 */
  const [turnCount, setTurnCount] = useState(3);
  const [isChatEnd, setIsChatEnd] = useState(false);
  const [isOverlay, _setIsOverlay] = useState(false);

  /* 대화 재시작 */
  // const restartChat = () => {
  //   window.location.href = "/chat/ai";
  // };

  /* 대화 종료 후 /report 페이지 이동 */
  const endChat = () => {
    navigate("/report");
  };

  const videos = [Video_AI_1, Video_AI_2, Video_AI_4, Video_AI_3];

  /* 비디오 스택 상태 */
  const [videoStack, _setVideoStack] = useState<string[]>(() => {
    // 초기 비디오 스택을 랜덤하게 채우는 로직
    const initialStack = Array.from({ length: 11 }, () => videos[Math.floor(Math.random() * videos.length)]);
    // console.log('Initial Video Stack:', initialStack); // 초기 스택 로그
    return initialStack;
  });
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    // videoStack 또는 currentVideoIndex가 변경될 때마다 로그 출력
    // console.log('Video Stack:', videoStack);
    // console.log('Current Video Index:', currentVideoIndex);
  }, [videoStack, currentVideoIndex]);



  // // 기본 영상
  // const [videoState, setVideoState] = useState<string>(videos[1]);

  // // ai 영상 상태 변화
  // const [currentVideo, setCurrentVideo] = useState<string>(videos[1]);
  // const [nextVideo, setNextVideo] = useState<string | null>(null);

  // typing 애니메이션
  const [aiMessage, setAiMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [_aiResponseBuffer, setAiResponseBuffer] = useState('');
  const [lastAiMessage, setLastAiMessage] = useState(''); // 마지막 AI 응답 저장
  const [lastUserMessage, setLastUserMessage] = useState<string>(''); // 마지막 사용자 메시지 저장

  // const handleVideoLoaded = () => {
  //   console.log(`비디오 로드 완료: ${currentVideo}`);

  //   if (nextVideo) {
  //     setCurrentVideo(nextVideo);
  //     setNextVideo(null);
  //   }
  // };

  /* 페이지 이동 시 TTS 중단 */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null; // ✅ 오디오 객체 초기화
    }
  };

  return (
    <div className={styles.page}>
      {/* 오버레이 로딩 화면 */}
      {isOverlay && (
        <div className={styles.overlay}>
          <div className={styles.loader}>로딩 중...</div>
        </div>
      )}

      {/* 대화 종료 모달 */}
      {/* <ChatEnd isOpen={isChatEnd} onClose={endChat} /> */}
      <ChatEnd isOpen={isChatEnd} onClose={endChat} historyId={historyId} />

      <div className={styles.menu}>
        <Drawer selectedKeyword={selectedKeyword} chatHistory={messageHistory} turnCount={turnCount} hints={hints} />
      </div>

      <div className={styles.chat}>
        {/* 채팅 헤더 */}
        <div className={styles.chat__header}>
          <p className={styles.chat__header__title}>AI와 스몰토크</p>
          <img src={leaveBtn} onClick={() => setIsLeaveOpen(true)} className={styles.chat__header__img} />
        </div>

        {/* AI 캐릭터 대화 */}
        <div className={styles.chat__ai}>
          <div className={styles.chat__ai__video}>
            {/* <Video videoSrc={currentVideo} nextVideo={nextVideo} /> */}
            {/* <Video
              videoSrc={currentVideo}  // 현재 비디오 소스 전달
              nextVideo={nextVideo}
              onVideoLoaded={handleVideoLoaded}
            /> */}
            <Video
              videoSrc={videoStack}  // 현재 비디오 소스 전달
              currentIndex={currentVideoIndex} // 다음 비디오는 없음
            // onVideoLoaded={() => { }} // handleVideoLoaded는 필요 없음
            />
          </div>
          <div className={styles.chat__ai__bubble}>
            <div className={styles.bubble__left}>
              {isWaiting
                ? "AI가 응답을 생성 중입니다. 잠시만 기다려 주세요..."
                : isTyping
                  ? aiMessage
                  : lastAiMessage || "AI가 응답을 생성 중입니다. 잠시만 기다려 주세요..."
              }
            </div>
          </div>
        </div>


        {/* 사용자 웹캠 및 대화 */}
        <div className={styles.chat__user}>
          <div className={styles.chat__user__bubble}>
            <div className={styles.bubble__right}>
              {currentMessage.trim() ? currentMessage : lastUserMessage || '음성을 입력하세요...'}
            </div>

          </div>
          <div className={styles.chat__user__video}>
            <WebcamComponent />
          </div>
        </div>

        {/* 음성 입력창 */}
        <div className={styles.chat__input}>
          <p className={styles.chat__input__content}>
            {isListening ? transcript || '음성을 입력하세요...' : ''}
          </p>
          {/* <img
            src={isListening ? sttBtnActive : sttBtn}
            className={styles.chat__input__img}
            onClick={toggleListening}
          /> */}
          {turnCount > 0 && (
            <img
              src={isListening ? sttBtnActive : sttBtn}
              className={styles.chat__input__img}
              onClick={toggleListening}
            />
          )}

          {/* ChatStop 버튼 (turnCount가 0일 때만 표시) */}
          {turnCount === 0 && (
            <img
              src={ChatStop}
              className={styles.chat__input__img}
              onClick={() => setIsChatEnd(true)}
            />
          )}
        </div>
      </div>

      {/* <Footer /> */}

      {/* 키워드 모달 */}
      {isKeywordOpen && (
        <KeywordModal setSelectedKeyword={setSelectedKeyword} setSelectedKeywordId={setSelectedKeywordId} onClose={() => setIsKeywordOpen(false)}>
          <div className={styles.btn} onClick={handleStartClick}>시작하기</div>
        </KeywordModal>
      )}

      {/* 키워드 미선택 시 alert */}
      {showAlert && (
        <div style={{ zIndex: 9999 }}>
          <RedAlert message="키워드를 선택해주세요!" onClose={() => setShowAlert(false)} />
        </div>
      )}

      {/* 대화 나가기 모달 */}
      <RoomLeaveModal isOpen={isLeaveOpen} onClose={() => setIsLeaveOpen(false)} stopTTS={stopTTS} />
    </div>
  );
}

export default VoiceChatPage;
