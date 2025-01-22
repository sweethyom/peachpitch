import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'

import styles from './styles/login.module.scss'

function loginPage() {
  return (
    <>
      <Header />

      <div className={styles.page}>
        <p>Login Page</p>
        <h4>로그인페이지</h4>
      </div>

      <Footer />
    </>
  )
}

export default loginPage