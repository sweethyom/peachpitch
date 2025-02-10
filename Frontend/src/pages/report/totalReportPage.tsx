import { Link } from 'react-router-dom'

import Header from '@/components/header/Header'
import Footer from '@/components/footer/Footer'

import styles from './styles/total.module.scss'

import HabitsChart from '@/components/chart/Habits'
import LeadChart from '@/components/chart/Lead'
import WordCloud from '@/components/chart/WordCloud'
import WordChart from '@/components/chart/Word'
import { useState } from 'react'

// ✅ 대화 리스트 더미 데이터 (20개)
const conversationList = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `대화 ${i + 1}`,
  keywords: i % 2 === 0 ? ["보드 게임", "겨울 스포츠"] : ["AI", "블록체인"],
  date: new Date(2024, 1, i + 1).toISOString().split("T")[0], // 2024-02-01 형식 날짜
}));

const ITEMS_PER_PAGE = 6; // ✅ 한 페이지당 6개 표시

function totalReportPage() {
  const [keywordFilter, setKeywordFilter] = useState<string>("전체");
  const [sortOrder, setSortOrder] = useState<string>("최신순");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ✅ 필터링된 대화 리스트 계산
  const filteredConversations = conversationList
    .filter(conv => keywordFilter === "전체" || conv.keywords.includes(keywordFilter))
    .sort((a, b) => {
      if (sortOrder === "최신순") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

  // ✅ 페이지별 데이터 분할
  const totalPages = Math.ceil(filteredConversations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedConversations = filteredConversations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ✅ 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ✅ 특정 섹션으로 스크롤 이동 함수
  const handleScrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Header />
      <div className={styles.wrap}>
        <div className={styles.page}>
          {/* 목차 */}
          <div className={styles.index}>
            <p className={styles.index__item}
            onClick={() => handleScrollToSection('habits')}>반복되는 단어 습관</p>
            <p className={styles.index__item}
            onClick={() => handleScrollToSection('lead')}>대화 주도권</p>
            <p className={styles.index__item}
            onClick={() => handleScrollToSection('keyword')}>대화 키워드</p>
            <p className={styles.index__item}
            onClick={() => handleScrollToSection('list')}>대화 리스트</p>
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
            <div id="habits"
            className={styles.report__habits}>
              <p className={styles.report__sub}>반복되는 단어 습관</p>

              {/* Pie 차트 */}
              <div className={styles.pie}>
                <div className={styles.pie__graph}>
                  <HabitsChart />
                </div>
              </div>
            </div>


            {/* 대화 주도권 */}
            <div id="lead"
            className={styles.report__lead}>
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
            <div id="keyword"
            className={styles.report__keyword}>
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
            <div id="list"
            className={styles.report__list}>
              <p className={styles.report__sub}>대화 리스트</p>

              <div className={styles.report__list__items}>

                {/* ✅ 대화 리스트 필터 */}
                <div className={styles.report__filter}>
                  {/* 키워드 필터 */}
                  <select
                    className={styles.report__filter__drop}
                    value={keywordFilter}
                    onChange={(e) => {
                      setKeywordFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="전체">전체</option>
                    <option value="보드 게임">보드 게임</option>
                    <option value="겨울 스포츠">겨울 스포츠</option>
                    <option value="AI">AI</option>
                    <option value="블록체인">블록체인</option>
                  </select>

                  {/* 정렬 필터 */}
                  <select
                    className={styles.report__filter__drop}
                    value={sortOrder}
                    onChange={(e) => {
                      setSortOrder(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="최신순">최신순</option>
                    <option value="오래된순">오래된순</option>
                  </select>
                </div>

                {/* ✅ 필터링된 대화 리스트 (2x3 레이아웃 적용) */}
                <div className={styles.report__grid}>
                  {paginatedConversations.map((conv) => (
                    <div key={conv.id} className={styles.item}>
                      {/* <Link to={`/report/detail/${conv.id}`} className={styles.item__link}> */}
                      <Link to={`/report/detail`} className={styles.item__link}>
                        <p className={styles.item__name}>{conv.name}</p>
                        <div className={styles.item__keyword}>
                          <p className={styles.item__keyword__title}>대화 키워드</p>
                          <div className={styles.item__tag}>
                            {conv.keywords.map((kw, idx) => (
                              <p key={idx} className={idx === 0 ? styles.item__tag__1 : styles.item__tag__2}>{kw}</p>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* ✅ 페이징 */}
                <div className={styles.report__paging}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.report__paging__button}
                  >
                    ◁
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.report__paging__number} ${currentPage === i + 1 ? styles.active : ""}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.report__paging__button}
                  >
                    ▷
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}

export default totalReportPage