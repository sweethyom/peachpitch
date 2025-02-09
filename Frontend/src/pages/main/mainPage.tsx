import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

import styles from './styles/main.module.scss';

import medal1 from '@/assets/icons/medal1.png';
import medal2 from '@/assets/icons/medal2.png';
import medal3 from '@/assets/icons/medal3.png';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import CompletePay from '@/components/modal/SuccessPay';

import GreenAlert from '@/components/alert/greenAlert';
import RedAlert from '@/components/alert/redAlert';

function MainPage() {
  const [randomTalks, setRandomTalks] = useState<string[]>([]);
  const [currentTalk, setCurrentTalk] = useState('');
  const [nextTalk, setNextTalk] = useState('');
  const [rotate, setRotate] = useState(false);

  const [showCompletePay, setShowCompletePay] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const navigate = useNavigate();

  const [showWelcomeAlert, setShowWelcomeAlert] = useState(false);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [permissionAlert, setPermissionAlert] = useState<string | null>(null);

  // ✅ 핑거프린트 생성 함수
  const generateFingerprint = async () => {
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
      console.log('🔍 Fingerprint:', result.visitorId);
    } catch (error) {
      console.error('Fingerprint generation failed:', error);
    }
  };

  // ✅ "오늘의 토킹" 데이터를 불러오기
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

  // ✅ 5초마다 "오늘의 토킹" 변경
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

  // ✅ 최초 실행 시 핑거프린트 생성 및 결제 성공 메시지 감지
  useEffect(() => {
    generateFingerprint();

    if (localStorage.getItem('loginSuccess') === 'true') {
      setShowWelcomeAlert(true);

      // ✅ 3초 후 자동으로 알림 제거
      setTimeout(() => {
        setShowWelcomeAlert(false);
        localStorage.removeItem('loginSuccess'); // ✅ localStorage에서도 삭제
      }, 3000);
    }

    const handlePaymentMessage = (event: MessageEvent) => {
      console.log("📩 결제 완료 메시지 수신:", event.data, "from:", event.origin);

      const allowedOrigins = ["http://localhost:8080", "http://localhost:5173"];
      if (!allowedOrigins.includes(event.origin)) return;

      if (event.data === 'paymentSuccess') {
        setShowCompletePay(true);
        localStorage.removeItem('paymentSuccess');

        // ✅ 쿠폰 모달 닫기
        const couponModal = document.querySelector('.coupon-modal');
        if (couponModal) {
          couponModal.classList.remove('open');
        }
      }
    };

    window.addEventListener('message', handlePaymentMessage);

    // ✅ 로컬 스토리지에서 결제 성공 여부 확인
    if (localStorage.getItem('paymentSuccess') === 'true') {
      setShowCompletePay(true);
      localStorage.removeItem('paymentSuccess');
    }

    return () => {
      window.removeEventListener('message', handlePaymentMessage);
    };
  }, []);

  const handleCloseSuccessModal = () => {
    setShowCompletePay(false);
  };

  // ✅ AI 채팅 접근 핸들러
  const handleAIChatClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      setAlertMessage("마이크 및 카메라 권한을 허용해야 합니다!");
      return;
    }

    if (!fingerprint) {
      console.error('Fingerprint not generated');
      return;
    }

    // try {
      // const response = await axios.post('/api/trial/check', {
      //   fingerprint: fingerprint,
      // });

      // if (response.data.canAccess) {
        navigate('/chat/ai');
      // } else {
        // setAlertMessage("무료 체험은 1회만 가능합니다. 로그인해주세요.");
        // navigate('/login');
      // }
    // } catch (error) {
      // console.error('Trial check failed:', error);
      // setAlertMessage("서비스 이용에 문제가 발생했습니다.");
    // }
  };

  // ✅ 마이크 및 카메라 권한 체크 함수
  const checkPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      return true; // ✅ 권한이 허용됨
    } catch (error) {
      return false; // ❌ 권한이 거부됨
    }
  };

  // ✅ 1:1 매칭 접근 핸들러 (권한 체크 추가)
  const handleVideoChatClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      setAlertMessage("마이크 및 카메라 권한을 허용해야 합니다!");
      return;
    }

    navigate("/chat/video");
  };

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.main}>
          {/* ✅ 오늘의 토킹 섹션 */}
          <div className={styles.main__random}>
            <p className={styles.main__random__title}>오늘의 토킹</p>
            <p className={`${styles.main__random__content} ${rotate ? styles.rotateOut : styles.rotateIn}`}>
              {currentTalk}
            </p>
          </div>

          {/* ✅ AI 채팅 & 1:1 매칭 */}
          <div className={styles.main__chat}>
            <Link to="#" onClick={handleAIChatClick} className={styles.main__link}>
              <div className={styles.main__chat__voice}>
                <p className={styles.voice}>AI와 스몰토킹</p>
                <p className={styles.voice__description}>AI와 부담없이 스몰토킹 해볼까?</p>
              </div>
            </Link>

            <Link to="#" onClick={handleVideoChatClick} className={styles.main__link}>
              <div className={styles.main__chat__video}>
                <p className={styles.video}>1:1 매칭 스몰토킹</p>
                <p className={styles.video__description}>사람과의 스몰토킹 너두 할 수 있어!</p>
              </div>
            </Link>
          </div>

          {/* ✅ 인기 키워드 섹션 */}
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
        <Footer />
      </div>


      {/* ✅ 결제 완료 모달 */}
      {showCompletePay && <CompletePay isOpen={showCompletePay} onClose={handleCloseSuccessModal} />}

      {/* ✅ 로그인 성공 후 GreenAlert 유지 */}
      {showWelcomeAlert && (
        <div>
          <GreenAlert message="로그인에 성공하였습니다. 환영합니다." onClose={() => setShowWelcomeAlert(false)} />
        </div>
      )}

      {alertMessage && (
        <div>
          <RedAlert message={alertMessage} onClose={() => setAlertMessage(null)} />
        </div>
      )}

      {permissionAlert && (
        <RedAlert message={permissionAlert} onClose={() => setPermissionAlert(null)} />
      )}
    </>
  );
}

export default MainPage;
