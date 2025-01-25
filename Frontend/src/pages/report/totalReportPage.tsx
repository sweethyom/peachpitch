import { Link } from 'react-router-dom'

import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'

import styles from './styles/total.module.scss'

import HabitsChart from '@/components/chart/Habits'
import LeadChart from '@/components/chart/Lead'
import WordCloud from '@/components/chart/WordCloud'
import WordChart from '@/components/chart/Word'


function totalReportPage() {
  return (
    <>
      <Header />

      <div className={styles.page}>
        {/* 목차 */}
        <div className={styles.index}>
          <p className={styles.index__item}>반복되는 단어 습관</p>
          <p className={styles.index__item}>대화 주도권</p>
          <p className={styles.index__item}>대화 키워드</p>
          <p className={styles.index__item}>대화 리스트</p>
        </div>

        <div className={styles.report}>
          <p className={styles.report__title}>전체 리포트</p>

          {/* 시간 통계 */}
          <div className={styles.report__status}>
            <div className={styles.total}>
              <p className={styles.total__title}>총 대화 시간</p>
              <p className={styles.total__time}><span className={styles.total__time__strong}>50</span>시간 <span className={styles.total__time__strong}>20</span>분</p>
            </div>
            <div className={styles.total}>
              <p className={styles.total__title}>평균 공백 시간</p>
              <p className={styles.total__time}>평균 <span className={styles.total__time__strong}>16</span>초</p>
            </div>
          </div>

          {/* 반복되는 단어 습관 */}
          <div className={styles.report__habits}>
            <p className={styles.report__sub}>반복되는 단어 습관</p>

            {/* Pie 차트 */}
            <div className={styles.pie}>
              <div className={styles.pie__graph}>
                <HabitsChart />
              </div>
            </div>
          </div>


          {/* 대화 주도권 */}
          <div className={styles.report__lead}>
            <p className={styles.report__sub}>대화 주도권</p>
            <div className={styles.meter}>
              <p className={styles.meter__label}>질문</p>
              <div className={styles.meter__graph}>
                <LeadChart />
              </div>
              <p className={styles.meter__label}>답변</p>
            </div>
          </div>


          {/* 대화 키워드(워드 클라우드) */}
          <div className={styles.report__keyword}>
            <p className={styles.report__sub}>대화 키워드(워드 클라우드)</p>
            <div className={styles.keyword}>
              <div className={styles.keyword__wordcloud}>
                <WordCloud />
              </div>
              <div className={styles.keyword__bar}>
                <WordChart />
              </div>
            </div>
          </div>


          {/* 대화 리스트 */}
          <div className={styles.report__list}>
            <p className={styles.report__sub}>대화 리스트</p>

            <div className={styles.report__list__items}>

              {/* 대화 리스트 필터 */}
              <div className={styles.report__filter}>
                <div className={styles.report__filter__drop}>▽ 키워드</div>
                <div className={styles.report__filter__drop}>▽ 최신순</div>
              </div>

              {/* 대화 리포트들 */}
              <div className={styles.item}>
                <Link to="/report/detail" className={styles.item__link}>
                  <p className={styles.item__name}>떡볶이 먹는 하마와의 대화</p>
                  <div className={styles.item__keyword}>
                    <p className={styles.item__keyword__title}>대화 키워드</p>
                    <div className={styles.item__tag}>
                      <p className={styles.item__tag__1}>보드 게임</p>
                      <p className={styles.item__tag__2}>겨울 스포츠</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* 페이저블, 페이징 - spring으로 구현 가능 */}
              <div className={styles.report__paging}>
                <p className={styles.report__paging__number}> ◁ 1 2 3 ▷ </p>
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