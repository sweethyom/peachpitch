import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'

import styles from './styles/chat.module.scss'

function chatReportPage() {
  return (
    <>
      <Header />

      <div className={styles.page}>
        <p>main Page</p>
        <h4>메인인페이지</h4>
      </div>

      <Footer />
    </>
  )
}

export default chatReportPage