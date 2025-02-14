import { useNavigate } from 'react-router-dom';

import Header from '@/components/header/Header'
import Footer from '@/components/footer/Footer'

import styles from './styles/join.module.scss'
import { useState } from 'react';

import RedAlert from '@/components/alert/redAlert';
import GreenAlert from '@/components/alert/greenAlert';

function joinPage() {
  const navigate = useNavigate();

  // Alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // 입력값 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    birthdate: ''
  });

  // const [error, setError] = useState<string | null>(null); // 에러 메시지 상태

  // 입력값 변경 핸들러 (e의 타입을 지정)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // 회원가입 요청 핸들러 (e의 타입을 지정)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/users/signup', {  // ✅ 변경: 절대 경로(X) → /api 사용
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          birth: formData.birthdate // ✅ 백엔드에 맞게 필드명 사용
        })
      });


      // const data = await response.json();

      if (response.ok) {
        setAlertMessage('회원가입에 성공하였습니다.');
        setIsSuccess(true);
        setShowAlert(true);

        localStorage.setItem('signupSuccess', 'true');

        navigate('/login'); // 로그인 페이지로 이동
      } else {
        setAlertMessage('회원가입에 실패했습니다.');
        setIsSuccess(false);
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage('이미 존재하는 이메일입니다.');
      setIsSuccess(false);
      setShowAlert(true);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.wrap}>
        <div className={styles.page}>

          <div className={styles.join}>

            <p className={styles.join__title}>환영합니다!</p>
            <p className={styles.join__explain}>가벼운 대화가 어려운 사람들을 위한 PeachPitch</p>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <div className={styles.join__form}>
                <label htmlFor='email' className={styles.join__form__label}>이메일</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={styles.join__form__input}
                />
              </div>

              <div className={styles.join__form}>
                <label htmlFor='password' className={styles.join__form__label}>비밀번호</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={styles.join__form__input}
                />
              </div>

              <div className={styles.join__form}>
                <label htmlFor='birthdate' className={styles.join__form__label}>생년월일</label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  required
                  className={styles.join__form__input}
                />
              </div>

              <button type="submit" className={styles.join__submit}>회원가입</button>
            </form>

            <div className={styles.join__login}>
              로그인을 진행하시겠습니까?{' | '}
              <a href="/login" className={styles.join__login__btn}>로그인하러 가기</a>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {showAlert && (
        <div style={{ zIndex: 9999 }}>
          {isSuccess ? (
            <GreenAlert message={alertMessage} onClose={() => setShowAlert(false)} />
          ) : (
            <RedAlert message={alertMessage} onClose={() => setShowAlert(false)} />
          )}
        </div>
      )}
    </>
  )
}

export default joinPage