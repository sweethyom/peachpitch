import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'

import styles from './styles/join.module.scss'

function joinPage() {
  return (
    <>
      <Header />

      <div className={styles.page}>

        <div className={styles.join}>

          <p className={styles.join__title}>환영합니다!</p>
          <p className={styles.join__explain}>가벼운 대화가 어려운 사람들을 위한 PeachPitch</p>

          <div className={styles.join__form}>
            <label htmlFor='email' className={styles.join__form__label}>이메일</label>
            <input type="email" id="email" name="email" required className={styles.join__form__input} />
          </div>

          <div className={styles.join__form}>
            <label htmlFor='password' className={styles.join__form__label}>비밀번호</label>
            <input type="password" id="password" name="password" required className={styles.join__form__input} />
          </div>

          <div className={styles.join__form}>
            <label htmlFor='birthdate' className={styles.join__form__label}>생년월일</label>
            <input type="date" id="birthdate" name="birthdate" required className={styles.join__form__input} />
          </div>

          <button type="submit" className={styles.join__submit}>회원가입</button>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default joinPage