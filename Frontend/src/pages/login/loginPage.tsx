import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

import styles from './styles/login.module.scss';

import { FaGoogle } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";

import GreenAlert from '@/components/alert/greenAlert';
import RedAlert from '@/components/alert/redAlert';

import Google from '@/components/login/Google'
import Kakao from '@/components/login/Kakao'
import Naver from '@/components/login/Naver'

function loginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  // alert창
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('signupSuccess') === 'true') {
      setShowSuccessAlert(true);

      // ✅ 3초 후 자동으로 알림 제거
      setTimeout(() => {
        setShowSuccessAlert(false);
        localStorage.removeItem('signupSuccess'); // ✅ localStorage에서도 삭제
      }, 3000);
    }
  }, []);

  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  // 로그인 요청 핸들러
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 쿠키 저장을 위한 옵션 추가
        body: JSON.stringify(formData)
      });

      // 응답 헤더 출력
      for (let [key, value] of response.headers.entries()) {
        console.log(`Header Key: ${key}, Value: ${value}`);
      }
      const headers = Object.fromEntries(response.headers.entries());
      console.log("Full Headers:", headers); // 모든 헤더 출력

      // 대소문자 상관없이 access 헤더 찾기
      const accessToken = headers["access"] || headers["Access"] || headers["ACCESS"];

      const data = await response.json(); // ✅ JSON 데이터 파싱

      if (response.ok) {
        if (accessToken) {
          console.log("✅ Access Token:", accessToken);
          localStorage.setItem('accessToken', accessToken); // ✅ localStorage에 저장
        } else {
          console.warn("🚨 Access 토큰이 undefined (서버 헤더 확인 필요)");
        }

        localStorage.setItem('loginSuccess', 'true');
        localStorage.setItem('userEmail', formData.email);

        navigate('/main'); // 홈 화면으로 이동
      } else {
        setError('아이디 혹은 비밀번호를 다시 입력해주세요.');
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("🚨 서버 오류:", error);
      setError('서버와의 통신 중 오류가 발생했습니다.');
      setShowErrorAlert(true);
    }
  };


  return (
    <>
      <Header />
      <div className={styles.wrap}>
        <div className={styles.page}>
          <div className={styles.login}>
            <p className={styles.login__logo}>PeachPitch</p>
            <p className={styles.login__explain}>하나의 아이디로 스몰톡 서비스를 이용하세요.</p>

            <p className={styles.login__sns}>다른 서비스로 로그인</p>
            <div className={styles.login__sns__item}>
              <a href="http://localhost:8080/api/users/login/social/google">
                <FaGoogle style={{ fontSize: '40px' }} />
              </a>
              {/* <FaGoogle style={{ fontSize: '40px' }} /> */}
              <a href="http://localhost:8080/api/users/login/social/kakao">
                <RiKakaoTalkFill style={{ fontSize: '50px' }} />
              </a>

              <SiNaver style={{ fontSize: '36px' }} />
            </div>

            <div className={styles.login__divider}>
              <hr className={styles.login__divider__line} />
              <p className={styles.login__divider__text}>or</p>
              <hr className={styles.login__divider__line} />
            </div>

            {/* 로그인 폼 */}
            <form onSubmit={handleLogin} style={{ width: '100%' }}>
              <div className={styles.login__form}>
                <label htmlFor='email' className={styles.login__form__label}>이메일</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={styles.login__form__input}
                />
              </div>

              <div className={styles.login__form}>
                <label htmlFor='password' className={styles.login__form__label}>비밀번호</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={styles.login__form__input}
                />
              </div>

              <button type="submit" className={styles.login__submit}>로그인</button>

            </form>

            <div className={styles.login__join}>
              아직 회원이 아니신가요?{' | '}
              <a href="/join" className={styles.login__join__btn}>회원가입하러 가기</a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
      {/* ✅ 회원가입 성공 시 GreenAlert */}
      {showSuccessAlert && (
        <div style={{ zIndex: 9999 }}>
          <GreenAlert message="회원가입에 성공하였습니다." onClose={() => setShowSuccessAlert(false)} />
        </div>
      )}

      {/* ✅ 로그인 실패 시 RedAlert */}
      {showErrorAlert && (
        <div style={{ zIndex: 9999 }}>
          <RedAlert message="아이디 혹은 비밀번호를 다시 입력해주세요." onClose={() => setShowErrorAlert(false)} />
        </div>
      )}
    </>
  );
}

export default loginPage;
