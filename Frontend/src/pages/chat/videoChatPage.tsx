import styles from './styles/video.module.scss'

import leaveBtn from '@/assets/icons/leave.png'
import sstBtn from '@/assets/icons/chat_stt.png'
import WebcamComponent from '@/components/chat/WebcamComponent';

import Drawer from '@/components/chat/Drawer';
import { useState } from 'react';

import RoomLeaveModal from '@/components/modal/RoomLeave';
import KeywordModal from '@/components/modal/KeywordVideo';
import RedAlert from '@/components/alert/redAlert';

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

  return (
    <div className={styles.page}>

      {/* 설정 메뉴바 */}
      <div className={styles.menu}>
        <Drawer selectedKeyword={selectedKeyword} chatHistory={chatHistory} turnCount={10} />
      </div>

      <div className={styles.chat}>
        {/* 채팅 헤더 부분 */}
        <div className={styles.chat__header}>
          <p className={styles.chat__header__title}>1:1 매칭 스몰토크</p>

          {/* 대화 나가기 아이콘 */}
          <img
            src={leaveBtn}
            onClick={toggleLeave}
            className={styles.chat__header__img} />
        </div>

        {/* 상대방 웹캠 */}
        <div className={styles.chat__other}>
          <div className={styles.chat__other__video}>
            <WebcamComponent />
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
            <WebcamComponent />
          </div>
        </div>

        {/* 음성챗 */}
        <div className={styles.chat__input}>
          <p className={styles.chat__input__content}>최근에 간 여행 중에 가장 기억에 남는 여행은 강릉 여행이었어. 나는 바다를 보고 왔어.</p>
          <img src={sstBtn} className={styles.chat__input__img} />
        </div>

      </div>

      {/* 키워드 모달 */}
      <KeywordModal
        isOpen={isKeywordOpen}
        onClose={toggleKeyword}
        setSelectedKeyword={setSelectedKeyword}>
        <div className={styles.btn} onClick={handleStartClick}>시작하기</div>
      </KeywordModal>

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

      {/* 대화 나가기 모달 */}
      <RoomLeaveModal isOpen={isLeaveOpen} onClose={toggleLeave} />
    </div >
  )
}

export default videoChatPage