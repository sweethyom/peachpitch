// 음성인식을 위해 최상단에 위치
import 'regenerator-runtime/runtime';

import Footer from '@/components/footer/Footer';

import styles from './styles/voice.module.scss'

import leaveBtn from '@/assets/icons/leave.png'

import sttBtn from '@/assets/icons/chat_stt.png'
import sttBtnActive from '@/assets/icons/chat_stt_active.png'

import Video from '@/components/chat/Video'
import WebcamComponent from '@/components/chat/WebcamComponent';
import Drawer from '@/components/chat/Drawer';
import { useState } from 'react';

import RoomLeaveModal from '@/components/modal/RoomLeave';
import KeywordModal from '@/components/modal/Keyword';
import RedAlert from '@/components/alert/redAlert';

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function voiceChatPage() {

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

  /* STT 버튼 상태 */
  const [isListening, setIsListening] = useState(false);

  /* 이전 대화 내용 저장 */
  const [messageHistory, setMessageHistory] = useState<string>('응답을 기다리는 중...');

  /* 현재 음성 입력 상태 */
  const [currentMessage, setCurrentMessage] = useState<string>('');

  /* 음성 인식 */
  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <p>브라우저가 음성 인식을 지원하지 않습니다.</p>;
  }

  const handleStartClick = () => {
    if (!selectedKeyword) {
      setShowAlert(true);
      return;
    }
    setIsKeywordOpen(false);
  };

  /* STT 버튼 클릭 시 음성 인식 ON/OFF */
  const toggleListening = () => {
    if (isListening) {
      // 음성 인식 종료
      SpeechRecognition.stopListening();
      setIsListening(false);

      if (transcript.trim() !== '') {
        setMessageHistory(transcript); // 최종 인식된 내용을 저장
      }
      setCurrentMessage(''); // 입력 필드 초기화
    } else {
      // 음성 인식 시작
      resetTranscript();
      setCurrentMessage('');
      SpeechRecognition.startListening({ continuous: true, language: 'ko-KR' });
      setIsListening(true);
    }
  };

  /* 음성 인식이 활성화되었을 때, 현재 입력값 업데이트 */
  if (listening && transcript !== currentMessage) {
    setCurrentMessage(transcript);
  }

  return (
    <div className={styles.page}>
      <div className={styles.menu}>
        <Drawer selectedKeyword={selectedKeyword} />
      </div>

      <div className={styles.chat}>
        {/* 채팅 헤더 부분 */}
        <div className={styles.chat__header}>
          <p className={styles.chat__header__title}>AI와 스몰토크</p>

          {/* 대화 나가기 아이콘 */}
          <img
            src={leaveBtn}
            onClick={toggleLeave}
            className={styles.chat__header__img}
          />
        </div>

        {/* AI 캐릭터 */}
        <div className={styles.chat__ai}>
          <div className={styles.chat__ai__video}>
            <Video />
          </div>
          <div className={styles.chat__ai__bubble}>
            <div className={styles.bubble__left}>
              {selectedKeyword || '여행'}에 대해 이야기 나누기 좋아요! 최근에 가장 기억에 남는 일이 있으신가요?
            </div>
          </div>
        </div>

        {/* 사용자 웹캠 */}
        <div className={styles.chat__user}>
          <div className={styles.chat__user__bubble}>
            <div className={styles.bubble__right}>
              {messageHistory}
            </div>
          </div>
          <div className={styles.chat__user__video}>
            <WebcamComponent />
          </div>
        </div>

        {/* 음성챗 */}
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

      {/* 키워드 모달 */}
      <KeywordModal
        isOpen={isKeywordOpen}
        onClose={toggleKeyword}
        setSelectedKeyword={setSelectedKeyword}
      >
        <div className={styles.btn} onClick={handleStartClick}>시작하기</div>
      </KeywordModal>

      {/* 키워드 선택안했을 경우 뜨는 alert창 */}
      {showAlert && (
        <div style={{ zIndex: 9999 }}>
          <RedAlert
            message="키워드를 선택해주세요!"
            onClose={() => setShowAlert(false)}
          />
        </div>
      )}

      {/* 대화 나가기 모달 */}
      <RoomLeaveModal isOpen={isLeaveOpen} onClose={toggleLeave} />
    </div>
  );
}

export default voiceChatPage