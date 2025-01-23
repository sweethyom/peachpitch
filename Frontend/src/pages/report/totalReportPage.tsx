import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'

import styles from './styles/total.module.scss'

function totalReportPage() {
  return (
    <>
      <Header />

      <div className={styles.page}>
        <div className={styles.report}>
          <p className={styles.report__title}>전체 리포트</p>

          {/* 시간 통계 */}
          <div className={styles.report__status}>
            <div className={styles.total}>
              <p className={styles.total__title}>총 대화 시간</p>
              <p className={styles.total__time}>총 대화 시간</p>
            </div>
            <div className={styles.gap}>
              <p className={styles.gap__title}>평균 공백 시간</p>
              <p className={styles.gap__time}>평균 공백 시간</p>
            </div>
          </div>

          {/* 반복되는 단어 습관 */}
          <div className={styles.report__habits}>
            <p className={styles.report__habits__title}>반복되는 단어 습관</p>
            <div className={styles.pie}>
              <div className={styles.pie__graph}></div>
              <div className={styles.pie__detail}></div>
            </div>
          </div>

          {/* 대화 주도권 */}
          <div className={styles.report__lead}>
            <p className={styles.report__lead__title}>대화 주도권</p>
            <div className={styles.meter}>
              <p className={styles.meter__label}>질문</p>
              <div className={styles.meter__graph}></div>
              <p className={styles.meter__label}>답변</p>
            </div>
          </div>

          {/* 대화 키워드(워드 클라우드) */}
          <div className={styles.report__keyword}>
            <p className={styles.report__keyword__title}>대화 키워드(워드 클라우드)</p>
            <div className={styles.wordcloud}></div>
            <div className={styles.bar}></div>
          </div>

          {/* 대화 리스트 */}
          <div className={styles.report__list}>
            <p className={styles.report__list__title}>대화 리스트</p>
            <div className={styles.report__list__items}>
              <div className={styles.item}>
                <p className={styles.item__name}>떡볶이 먹는 하마와의 대화</p>
                <div className={styles.item__keyword}>
                  <p className={styles.item__keyword__title}>대화 키워드</p>
                  <p className={styles.item__keyword__tag}>취미</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

export default totalReportPage