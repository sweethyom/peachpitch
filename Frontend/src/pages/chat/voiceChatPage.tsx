import 'regenerator-runtime/runtime';

import { useState, useEffect } from 'react';
import axios from 'axios';

import Footer from '@/components/footer/Footer';
import styles from './styles/voice.module.scss';

import leaveBtn from '@/assets/icons/leave.png';
import sttBtn from '@/assets/icons/chat_stt.png';
import sttBtnActive from '@/assets/icons/chat_stt_active.png';

import Video from '@/components/chat/Video';
import WebcamComponent from '@/components/chat/WebcamComponent';
import Drawer from '@/components/chat/Drawer';
import ChatEnd from "@/components/modal/ChatEnd";

import RoomLeaveModal from '@/components/modal/RoomLeave';
import KeywordModal from '@/components/modal/Keyword';
import RedAlert from '@/components/alert/redAlert';

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import { useNavigate } from "react-router-dom";

function VoiceChatPage() {
  /* 모달 관련 상태 */
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isKeywordOpen, setIsKeywordOpen] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  /* 키워드 상태 */
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  /* 음성 인식 관련 상태 */
  const [isListening, setIsListening] = useState(false);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  /* 대화 저장 */
  const [messageHistory, setMessageHistory] = useState<{ role: string, message: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');

  useEffect(() => {
    if (listening && transcript !== currentMessage) {
      setCurrentMessage(transcript);
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
      const response = await axios.post('http://127.0.0.1:8000/ai/start/', {
        keyword: selectedKeyword,
      });
      setMessageHistory(prev => [...prev, { role: 'ai', message: response.data.message }]);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  /* 사용자가 메시지를 보낼 때 API 호출 */
  const handleUserMessage = async () => {
    if (!currentMessage.trim()) return;

    // ✅ 사용자의 메시지를 저장
    setMessageHistory((prev) => [...prev, { role: "user", message: currentMessage }]);

    // ✅ AI의 응답을 12번까지 받도록 함
    if (turnCount > 0) {
      try {
        const response = await axios.post("http://127.0.0.1:8000/ai/chat/", {
          message: currentMessage,
        });

        // ✅ AI 응답 저장 및 턴 카운트 감소
        setMessageHistory((prev) => [...prev, { role: "ai", message: response.data.message }]);
        setTurnCount((prev) => prev - 1);
      } catch (error) {
        console.error("AI 응답 오류:", error);
      }
    }

    // ✅ 턴이 0이 된 후 사용자가 메시지 입력하면 AI 종료 인사
    if (turnCount === 1) {
      setIsOverlay(true);
      setTimeout(() => {
        setIsOverlay(false);
        setIsChatEnd(true);
      }, 10000);
      setMessageHistory((prev) => [
        ...prev,
        { role: "ai", message: "너와의 대화가 즐거웠어. 다음번에 또 즐거운 대화를 하자!" },
      ]);
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
    }
  };

  /* 대화 종료 모달창 */
  const navigate = useNavigate();

  /* turn 카운트 숫자를 10에서 적은 수로 줄이면 빠르게 다음 단계를 테스트 해 볼 수 있음 */
  const [turnCount, setTurnCount] = useState(10);
  const [isChatEnd, setIsChatEnd] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);

  /* 대화 재시작 */
  const restartChat = () => {
    window.location.href = "/chat/ai";
  };

  /* 대화 종료 후 /report 페이지 이동 */
  const endChat = () => {
    navigate("/report");
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
      <ChatEnd isOpen={isChatEnd} onClose={endChat} />

      <div className={styles.menu}>
        <Drawer selectedKeyword={selectedKeyword} chatHistory={messageHistory} turnCount={turnCount} />
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
            <Video />
          </div>
          <div className={styles.chat__ai__bubble}>
            {/* 최신 AI 메시지만 표시 */}
            {messageHistory.length > 0 &&
              <div className={styles.bubble__left}>
                {messageHistory
                  .filter(msg => msg.role === 'ai')
                  .slice(-1)[0]?.message || '대화를 시작하세요!'}
              </div>
            }
          </div>
        </div>


        {/* 사용자 웹캠 및 대화 */}
        <div className={styles.chat__user}>
          <div className={styles.chat__user__bubble}>
            <div className={styles.bubble__right}>
              {currentMessage || '음성을 입력하세요...'}
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
          <img
            src={isListening ? sttBtnActive : sttBtn}
            className={styles.chat__input__img}
            onClick={toggleListening}
          />
        </div>
      </div>

      <Footer />

      {/* 대화 종료 모달
      {isChatEnd && (
        <ChatEnd isOpen={isChatEnd} onClose={endChat}>
          <div className={styles.modal__btn}>
            <button className={styles.modal__btn__continue} onClick={restartChat}>
              다른 대화 진행하기
            </button>
            <button className={styles.modal__btn__leave} onClick={endChat}>
              종료하기
            </button>
          </div>
        </ChatEnd>
      )} */}

      {/* 키워드 모달 */}
      <KeywordModal isOpen={isKeywordOpen} onClose={() => setIsKeywordOpen(false)} setSelectedKeyword={setSelectedKeyword}>
        <div className={styles.btn} onClick={handleStartClick}>시작하기</div>
      </KeywordModal>

      {/* 키워드 미선택 시 alert */}
      {showAlert && (
        <div style={{ zIndex: 9999 }}>
          <RedAlert message="키워드를 선택해주세요!" onClose={() => setShowAlert(false)} />
        </div>
      )}

      {/* 대화 나가기 모달 */}
      <RoomLeaveModal isOpen={isLeaveOpen} onClose={() => setIsLeaveOpen(false)} />
    </div>
  );
}

export default VoiceChatPage;
