import Footer from '../../components/footer/Footer';

import styles from './styles/voice.module.scss'

import leaveBtn from '../../assets/icons/leave.png'
import { Link } from 'react-router-dom';

import sstBtn from '../../assets/icons/chat_sst.png'
import Video from '../../components/video/Video'

function chatPage() {
  return (
    <div className={styles.page}>

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
          <div className={styles.bubble__left}>
            여행에 대해 이야기 나누기 좋아요! 최근에 여행 간 곳 중에 가장 기억에 남는 곳이 있으신가요?
          </div>
        </div>

        {/* 사용자 카메라 */}
        <div className={styles.chat__human}>
          <div className={styles.chat__human__video}>

          </div>
          <div className={styles.bubble__right}>
            최근에 간 여행 중에 가장 기억에 남는 여행은 강릉 여행이었어. 나는 바다를 보고 왔어.
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

export default chatPage