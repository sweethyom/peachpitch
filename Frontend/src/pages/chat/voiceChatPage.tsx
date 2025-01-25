import Footer from '@/components/footer/Footer';

import styles from './styles/voice.module.scss'

import leaveBtn from '@/assets/icons/leave.png'
import { Link } from 'react-router-dom';

import sstBtn from '@/assets/icons/chat_sst.png'
import Video from '@/components/chat/Video'
import WebcamComponent from '@/components/chat/WebcamComponent';
import Drawer from '@/components/chat/Drawer';

function voiceChatPage() {
  return (
    <div className={styles.page}>

      <div className={styles.menu}>
        <Drawer />
      </div>

      <div className={styles.chat}>

        {/* 채팅 헤더 부분 */}
        <div className={styles.chat__header}>
          <p className={styles.chat__header__title}>AI와 스몰토크</p>
          <Link to="/main">
            <img src={leaveBtn} className={styles.chat__header__img} />
          </Link>
        </div>

        {/* AI 캐릭터 */}
        <div className={styles.chat__ai}>
          <div className={styles.chat__ai__video}>
            <Video />
          </div>
          <div className={styles.chat__ai__bubble}>
            <div className={styles.bubble__left}>
              여행에 대해 이야기 나누기 좋아요! 최근에 여행 간 곳 중에 가장 기억에 남는 곳이 있으신가요?
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

      <Footer />
    </div>
  )
}

export default voiceChatPage