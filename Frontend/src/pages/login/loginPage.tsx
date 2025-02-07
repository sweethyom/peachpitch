import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

import styles from './styles/login.module.scss';

import { FaGoogle } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";

function loginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

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

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // 로그인 성공 메시지
        
        // ✅ localStorage에 로그인 정보 저장
        localStorage.setItem('userEmail', formData.email);
        
        navigate('/main'); // 홈 화면으로 이동
        window.dispatchEvent(new Event("storage")); // ✅ 상태 변경 이벤트 발생
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      setError('서버와의 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Header />

      <div className={styles.page}>
        <div className={styles.login}>
          <p className={styles.login__logo}>PeachPitch</p>
          <p className={styles.login__explain}>하나의 아이디로 스몰톡 서비스를 이용하세요.</p>

          <p className={styles.login__sns}>다른 서비스로 로그인</p>
          <div className={styles.login__sns__item}>
            <FaGoogle style={{ fontSize: '40px' }} />
            <RiKakaoTalkFill style={{ fontSize: '50px' }} />
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

            {/* 에러 메시지 출력 */}
            {error && <p className={styles.login__error}>{error}</p>}
          </form>

          <div className={styles.login__join}>
            아직 회원이 아니신가요?{' | '}
            <a href="/join" className={styles.login__join__btn}>회원가입하러 가기</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default loginPage;
