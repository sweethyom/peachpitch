import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'

import styles from './styles/join.module.scss'

function loginPage() {
  return (
    <>
      <Header />

      <div className={styles.page}>
        <p>join Page</p>
        <h4>회원가입페이지</h4>
      </div>

      <Footer />
    </>
  )
}

export default loginPage