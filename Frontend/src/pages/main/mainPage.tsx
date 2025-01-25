import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

import styles from './styles/main.module.scss';

import medal1 from '../../assets/icons/medal1.png';
import medal2 from '../../assets/icons/medal2.png';
import medal3 from '../../assets/icons/medal3.png';
import { Link } from 'react-router-dom';

function MainPage() {
  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.main}>
          <div className={styles.main__random}>
            <p className={styles.main__random__title}>오늘의 토킹</p>
            <p className={styles.main__random__content}>사랑은 머리가 아니라 가슴으로 하는 거거던요...</p>
          </div>

          <div className={styles.main__chat}>
            <Link to="/chat/ai" className={styles.main__link}>
              <div className={styles.main__chat__voice}>
                <p className={styles.voice}>AI와 스몰토킹</p>
                <p className={styles.voice__description}>AI와 부담없이 스몰토킹 해볼까?</p>
              </div>
            </Link>

            <Link to="/chat/video" className={styles.main__link}>
              <div className={styles.main__chat__video}>
                <p className={styles.video}>1:1 매칭 스몰토킹</p>
                <p className={styles.video__description}>사람과의 스몰토킹 너두 할 수 있어!</p>
              </div>
            </Link>
          </div>

          <div className={styles.main__keyword}>
            <p className={styles.main__keyword__title}>🔥 현재 가장 인기 있는 키워드 🔥</p>
            <div className={styles.main__keyword__list}>
              <div className={styles.item}>
                <img className={styles.item__medal} src={medal1} />
                <p className={styles.item__keyword}>취미</p>
              </div>
              <div className={styles.item}>
                <img className={styles.item__medal} src={medal2} />
                <p className={styles.item__keyword}>여행</p>
              </div>
              <div className={styles.item}>
                <img className={styles.item__medal} src={medal3} />
                <p className={styles.item__keyword}>티타임</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default MainPage;
