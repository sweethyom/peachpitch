import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

import styles from './styles/main.module.scss';

import medal1 from '@/assets/icons/medal1.png';
import medal2 from '@/assets/icons/medal2.png';
import medal3 from '@/assets/icons/medal3.png';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

// 핑거프린트 로직 추가
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';
// 페이지 이동을 위한 React Router의 navigate 훅 import
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const [randomTalks, setRandomTalks] = useState<string[]>([]);
  const [currentTalk, setCurrentTalk] = useState('');
  const [nextTalk, setNextTalk] = useState('');
  const [rotate, setRotate] = useState(false);

  // 핑거프린트
  const navigate = useNavigate();
  // 브라우저 핑거프린트를 저장할 상태 변수
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  // 컴포넌트가 처음 렌더링될 때 핑거프린트 생성
  useEffect(() => {
    const generateFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
      } catch (error) {
        console.error('Fingerprint generation failed:', error);
      }
    };
    generateFingerprint();
  }, []);

  // AI 채팅 버튼 클릭 시 실행되는 핸들러 함수
  const handleAIChatClick = async (e: React.MouseEvent) => {
    // 기본 링크 클릭 이벤트 방지
    e.preventDefault();

    // 핑거프린트가 생성되지 않았다면 함수 종료
    if (!fingerprint) {
      console.error('Fingerprint not generated');
      return;
    }

    try {
      // 서버에 핑거프린트를 보내서 무료 체험 가능 여부 확인
      const response = await axios.post('/api/trial/check', {
        fingerprint: fingerprint
      });

      // 서버 응답에 따른 처리
      if (response.data.canAccess) {
        // 무료 체험 가능하면 AI 채팅 페이지로 이동
        navigate('/chat/ai');
      } else {
        // 이미 무료 체험을 사용했다면 로그인 페이지로 이동
        alert('무료 체험은 1회만 가능합니다. 로그인해주세요.');
        navigate('/login');
      }
    } catch (error) {
      // 서버 통신 중 오류 발생 시 에러 처리
      console.error('Trial check failed:', error);
      alert('서비스 이용에 문제가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetch('/data/random_talks.json')
      .then(response => response.json())
      .then(data => {
        setRandomTalks(data.random_talks);
        if (data.random_talks.length > 0) {
          setCurrentTalk(data.random_talks[Math.floor(Math.random() * data.random_talks.length)]);
        }
      })
      .catch(error => console.error('Error fetching random talks:', error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (randomTalks.length > 0) {
        setNextTalk(randomTalks[Math.floor(Math.random() * randomTalks.length)]);
        setRotate(true);

        setTimeout(() => {
          setCurrentTalk(nextTalk);
          setRotate(false);
        }, 600);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [randomTalks, nextTalk]);

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.main}>
          <div className={styles.main__random}>
            <p className={styles.main__random__title}>오늘의 토킹</p>
            <p className={`${styles.main__random__content} ${rotate ? styles.rotateOut : styles.rotateIn}`}>
              {currentTalk}
            </p>
          </div>

          <div className={styles.main__chat}>
            <div onClick={handleAIChatClick} className={styles.main__link}>
              <div className={styles.main__chat__voice}>
                <p className={styles.voice}>AI와 스몰토킹</p>
                <p className={styles.voice__description}>AI와 부담없이 스몰토킹 해볼까?</p>
              </div>
            </div>

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
                <img className={styles.item__medal} src={medal1}/>
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
