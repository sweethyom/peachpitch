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

// import CompletePay from '@/components/modal/SuccessPay';

import GreenAlert from '@/components/alert/greenAlert';
import RedAlert from '@/components/alert/redAlert';
import StartChat from '@/components/modal/StartChat'
// import { access } from 'fs';

function MainPage() {
  const defaultMessage = `"안녕하세요. 최종 발표를 진행하게 되어 너무 떨리네요."`

  const [randomTalks, setRandomTalks] = useState<string[]>([]);
  const [currentTalk, setCurrentTalk] = useState(defaultMessage);
  // const [nextTalk, setNextTalk] = useState(defaultMessage);
  const [rotate, setRotate] = useState(false);

  const [_showCompletePay, setShowCompletePay] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const navigate = useNavigate();

  const [showWelcomeAlert, setShowWelcomeAlert] = useState(false);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [permissionAlert, setPermissionAlert] = useState<string | null>(null);

  // 소셜 로그인 accessToken
  const [_isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('accessToken') !== null;
  });

  const [rank, setRank] = useState<string[] | null>(null);
  const [_couponNum, setCouponNum] = useState(0)

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

  // 랭킹 데이터를 불러오기
  useEffect(() => {
    axios.get("https://peachpitch.site/api/main/rank")
      .then((response) => {
        const keywords = response.data.data.rank.map((item: { keyword: string }) => item.keyword);
        setRank(keywords);
        console.log(rank);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

  }, []);

  // ✅ "오늘의 토킹" 데이터를 불러오기
  // useEffect(() => {
  //   axios.post("http://localhost:8080/api/main/randomscript")
  //     .then(response => {
  //       const content = response.data.data.content;
  //       setRandomTalks(prev => [...prev, content]);
  //       setCurrentTalk(content);
  //     })
  //     .catch(error => console.error('Error fetching random script:', error));
  // }, []);

  // ✅ 5초마다 새로운 "오늘의 토킹" 불러오기
  useEffect(() => {
    const fetchRandomScript = () => {
      axios.post("https://peachpitch.site/api/main/randomscript")
        .then(response => {
          const content = response.data.data.content;
          setRandomTalks(prev => [...prev, content]);
        })
        .catch(error => console.error('Error fetching random script:', error));
    };

    fetchRandomScript(); // 최초 실행
    const interval = setInterval(fetchRandomScript, 5000); // 5초마다 실행

    return () => clearInterval(interval);
  }, []);


  // ✅ 5초마다 "오늘의 토킹" 변경
  useEffect(() => {
    if (randomTalks.length === 0) return;

    const changeTalk = () => {
      setRotate(true); // 애니메이션 시작

      setTimeout(() => {
        const newTalk = randomTalks[Math.floor(Math.random() * randomTalks.length)] || defaultMessage;
        setCurrentTalk(newTalk);
        setRotate(false); // 애니메이션 종료
      }, 600); // 애니메이션 지속 시간과 맞추기
    };

    const interval = setInterval(changeTalk, 5000);
    return () => clearInterval(interval);
  }, [randomTalks]);

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

      const allowedOrigins = ["https://peachpitch.site"];
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

  // const handleCloseSuccessModal = () => {
  //   // stopCameraStream();
  //   setShowCompletePay(false);
  //   reloadPage()
  // };

  //   const stopCameraStream = () => {
  //   navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  //     .then((stream) => {
  //       stream.getTracks().forEach(track => track.stop());
  //     })
  //     .catch((error) => {
  //       console.error("카메라 스트림 정리 중 오류 발생:", error);
  //     });
  // };

  // const reloadPage = () => {
  //   console.log("🔄 페이지 새로고침 실행됨");
  //   window.location.reload();
  // };


  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // ✅ AI 채팅 접근 핸들러
  const handleAIChatClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // if(coupon)

    try {
      // 1. 권한 체크 먼저 수행
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        setAlertMessage("마이크 및 카메라 권한을 허용해야 합니다!");
        return;
      }

      // 2. 로그인 상태 확인
      const isLoggedIn = localStorage.getItem('accessToken') !== null;
      if (isLoggedIn) {
        // 로그인된 사용자는 쿠폰만 확인
        const hasCoupon = await checkCouponAvailability();
        console.log("! " + hasCoupon)

        if (hasCoupon) {
          setIsChatModalOpen(true);
          console.log("🟢 AI 채팅 모달 열기 (로그인 상태)");
        }
      } else {
        // 비로그인 사용자는 fingerprint 확인
        if (!fingerprint) {
          // fingerprint가 없으면 생성
          // await generateFingerprint();
          console.log("🚀 핑거프린트 없음, 첫 무료 체험 가능!");
          setIsChatModalOpen(true);
          return; // ✅ 첫 무료 체험이므로 API 요청 없이 실행
        }

        // fingerprint로 시도 여부 확인
        const response = await axios.post('https://peachpitch.site/api/chat/ai/check', {
          fingerprint: fingerprint,
        });

        // console.log("🟢 핑거프린트 체크 결과:", response.data);

        // Redis에 fingerprint가 없으면 처음 시도하는 것이므로 바로 채팅 가능
        if (response.data.data) {
          // setIsChatModalOpen(true);
          navigate('/chat/ai')
        } else {
          setAlertMessage("무료 체험은 1회만 가능합니다. 로그인해주세요.");
          // navigate('/login');
        }
      }
    } catch (error) {
      console.error('Trial check failed:', error);
      setAlertMessage("서비스 이용에 문제가 발생했습니다.");
    }
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
    const userJwtFromStorage = localStorage.getItem("accessToken");

    if (!userJwtFromStorage) {
      setAlertMessage("로그인을 해주세요.");
      return;
    }
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      setAlertMessage("마이크 및 카메라 권한을 허용해야 합니다!");
      return;
    }

    navigate("/chat/video");
  };

  // 소셜 로그인 확인
  useEffect(() => {
    const checkSocialLogin = async () => {
      if (localStorage.getItem("socialLoginAttempt")) {
        try {
          const response = await fetch("https://peachpitch.site/api/users/check-login", {
            method: "GET",
            credentials: "include",
          });

          if (!response.ok) throw new Error("로그인 확인 실패");

          const accessToken = response.headers.get("access") || null;
          const email = response.headers.get("email") || null;
          const userId = response.headers.get("userId") || null;

          console.log("🔑 access:", accessToken);
          console.log("📧 email:", email);
          console.log("🆔 userId:", userId);

          if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("userEmail", email || "");
            localStorage.setItem("userId", userId || "");
            setIsLoggedIn(true);

            // ✅ storage 이벤트 트리거하여 Header.tsx 업데이트
            window.dispatchEvent(new Event("storage"));
          }

          localStorage.removeItem("socialLoginAttempt");
        } catch (error) {
          console.error("🚨 로그인 상태 확인 실패:", error);
          localStorage.removeItem("socialLoginAttempt");
        }
      }
    };

    checkSocialLogin();
  }, []);

  useEffect(() => {
    const handleChatCancel = () => {
      console.log("🔄 Chat modal cancelled. Reloading page...");
      window.location.reload();
    };

    window.addEventListener("chatModalCancelled", handleChatCancel);

    return () => {
      window.removeEventListener("chatModalCancelled", handleChatCancel);
    };
  }, []);


  // AI 접근 모달창 닫기
  const handleCloseChatModal = () => {
    setIsChatModalOpen(false);
  };

  const handleStartChat = () => {
    if (!fingerprint) {
      setAlertMessage("이미 무료로 이용한 적이 있습니다. 로그인 후 이용해주세요.")
      return
    }
    setIsChatModalOpen(false);
    navigate('/chat/ai');
  };

  // const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  // console.log("access" + accessToken)
  // console.log("user" + userId)
  const checkCouponAvailability = async () => {
    try {
      // const response = await axios.get(`https://peachpitch.site/api/users/coupon/${userId}`);
      const response = await axios.post(
        'https://peachpitch.site/api/users/coupon/have',
        { userId: userId }, // Body 데이터
      );
      setCouponNum(response.data.data)
      // console.log("coupon " + couponNum);

      if (response.data.data < 1) {
        setAlertMessage("이용권이 부족합니다.");
        return false;
      }
      return true;
    } catch (error) {
      console.error('쿠폰 확인 실패:', error);
      setAlertMessage("쿠폰 확인 중 오류가 발생했습니다.");
      return false;
    }
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
              {currentTalk || defaultMessage}
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

            {/* StartChat 모달 */}
            {isChatModalOpen && (
              <StartChat isOpen={isChatModalOpen} onClose={handleCloseChatModal} onStart={handleStartChat} isFinger={fingerprint != null} />
            )}
            {alertMessage && (
              <RedAlert message={alertMessage} onClose={() => setAlertMessage(null)} />
            )}

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
              {rank && rank.length >= 3 ? (
                rank.slice(0, 3).map((keyword, index) => (
                  <div className={styles.item} key={index}>
                    <img
                      className={styles.item__medal}
                      src={index === 0 ? medal1 : index === 1 ? medal2 : medal3}
                    />
                    <p className={styles.item__keyword}>{keyword}</p>
                  </div>
                ))
              ) : (
                <div>아직 랭킹이 없음</div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>


      {/* ✅ 결제 완료 모달 */}
      {/* {showCompletePay && <CompletePay isOpen={showCompletePay} onClose={handleCloseSuccessModal} />} */}

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