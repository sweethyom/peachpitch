import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'

import styles from './styles/login.module.scss'

import { FaGoogle } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";

function loginPage() {
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
            <RiKakaoTalkFill style={{ fontSize: '40px' }} />
            <SiNaver style={{ fontSize: '40px' }} />
          </div>


          <div className={styles.login__divider}>
            <hr className={styles.login__divider__line} />
            <p className={styles.login__divider__text}>or</p>
            <hr className={styles.login__divider__line} />
          </div>

          <div className={styles.login__form}>
            <label htmlFor='email' className={styles.login__form__label}>이메일</label>
            <input type="email" id="email" name="email" required className={styles.login__form__input} />
          </div>

          <div className={styles.login__form}>
            <label htmlFor='password' className={styles.login__form__label}>비밀번호</label>
            <input type="password" id="password" name="password" required className={styles.login__form__input} />
          </div>

          <button type="submit" className={styles.login__submit}>로그인</button>


          <div className={styles.login__join}>
            아직 회원이 아니신가요?{' | '}
            <a href="/join" className={styles.login__join__btn}>회원가입하러 가기</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default loginPage