import { useNavigate } from 'react-router-dom';

import Header from '@/components/header/Header'
import Footer from '@/components/footer/Footer'

import styles from './styles/join.module.scss'
import { useState } from 'react';

function joinPage() {
  const navigate = useNavigate(); // 페이지 이동을 위한 hook

  // 입력값 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    birthdate: ''
  });

  const [error, setError] = useState<string | null>(null); // 에러 메시지 상태

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
      const response = await fetch('/api/users/signup', {  // ✅ 변경: 절대 경로(X) → /api 사용
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


      const data = await response.json();

      if (response.ok) {
        alert(data.message); // 회원가입 성공 메시지 표시
        navigate('/login'); // 로그인 페이지로 이동
      } else {
        setError(data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      setError('서버와의 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Header />

      <div className={styles.page}>

        <div className={styles.join}>

          <p className={styles.join__title}>환영합니다!</p>
          <p className={styles.join__explain}>가벼운 대화가 어려운 사람들을 위한 PeachPitch</p>

          <form onSubmit={handleSubmit} style={{width:"100%"}}>
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
            
            {/* 에러 메시지 출력 */}
            {error && <p className={styles.join__error}>{error}</p>}
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default joinPage