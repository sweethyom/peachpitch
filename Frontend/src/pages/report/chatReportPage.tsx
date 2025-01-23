import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'

import styles from './styles/chat.module.scss'

function chatReportPage() {
  return (
    <>
      <Header />

      <div className={styles.page}>
        <p>chat report Page</p>
        <h4>대화 리포트 페이지</h4>
      </div>

      <Footer />
    </>
  )
}

export default chatReportPage