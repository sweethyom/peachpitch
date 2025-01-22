import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'

import styles from './styles/landing.module.scss'

function ladingPage() {
    return (
        <>
            <Header />

            <div className={styles.page}>
                <p>Lading Page</p>
                <h4>랜딩페이지</h4>
            </div>

            <Footer />
        </>
    )
}

export default ladingPage