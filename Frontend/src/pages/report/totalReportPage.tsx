import { Link } from 'react-router-dom'

import Header from '@/components/header/Header'
import Footer from '@/components/footer/Footer'

import styles from './styles/total.module.scss'

import HabitsChart from '@/components/chart/Habits'
import LeadChart from '@/components/chart/Lead'
import WordCloud from '@/components/chart/WordCloud'
import WordChart from '@/components/chart/Word'
import { useEffect, useState } from 'react'
import axios from 'axios'

import { useNavigate } from "react-router-dom";

interface SpeakingHabit {
  wordId: number;
  word: string;
  count: number;
}

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

  // ✅ 특정 섹션으로 스크롤 이동 함수
  const handleScrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [reportData, setReportData] = useState<{ ansCount: number; questCount: number } | null>(null);
  const [speakingHabits, setSpeakingHabits] = useState<SpeakingHabit[]>([]);
  const [chatReports, setChatReports] = useState<any[]>([]);
  const [paginatedConversations, setPaginatedConversations] = useState<any[]>([]);

  useEffect(() => {
    const fetchReportData = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const userId = Number(localStorage.getItem("userId"));

      // console.log("userId: " + userId);
      // console.log("userId: " + accessToken);

      // if (!accessToken || !userId) {
      //   console.error("❌ Missing access token or user ID");
      //   window.location.href = "/login";
      //   return;
      // }

      try {
        const response = await axios.post(
          "http://localhost:8080/api/users/reports/totalreport",
          { userId: userId },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            withCredentials: true, // ✅ 쿠키 포함
          }
        );

        console.log("✅ Report Data:", response.data);

        if (response.data?.data?.speakingHabits) {
          setSpeakingHabits(response.data.data.speakingHabits);
        }

        if (response.data?.data) {
          setReportData({
            ansCount: response.data.data.ansCount || 0,
            questCount: response.data.data.questCount || 0,
          });
        }

        if (response.data.data.chatReports) {
          setChatReports(response.data.data.chatReports);
        }
      } catch (error) {
        console.error("❌ Failed to fetch report data:", error);
      }
    };

    fetchReportData();
  }, []);

  // 워드 클라우드 키워드 가지고 오기
  const keywords = chatReports.reduce((acc: string[], report: any) => {
    if (report.keyword1) acc.push(report.keyword1);
    if (report.keyword2) acc.push(report.keyword2);
    return acc;
  }, []);

  const wordCloudData = keywords.map((keyword: string) => ({
    text: keyword,
    value: Math.floor(Math.random() * 100) + 1, // Random value for word size
  }));

  // 페이징
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Filter chatReports based on selected keyword filter
  const filteredReports = chatReports.filter((report) => {
    if (keywordFilter === "전체") return true;
    return (
      (report.keyword1 && report.keyword1.includes(keywordFilter)) ||
      (report.keyword2 && report.keyword2.includes(keywordFilter))
    );
  });

  // Sort chatReports based on the selected sort order
  const sortedReports = filteredReports.sort((a, b) => {
    if (sortOrder === "최신순") {
      return b.reportId - a.reportId;
    } else {
      return a.reportId - b.reportId;
    }
  });

  // Calculate total pages for pagination (inside useEffect or computation)
  const totalPages = Math.ceil(sortedReports.length / 6); // Assuming 6 items per page

  // Paginate the reports based on currentPage
  useEffect(() => {
    if (sortedReports.length > 0) {
      const startIndex = (currentPage - 1) * 6;
      const endIndex = startIndex + 6;
      setPaginatedConversations(sortedReports.slice(startIndex, endIndex));
    }
  }, [currentPage, sortedReports.length]); // Only depend on `sortedReports.length`


  // 리포트 선택
  const navigate = useNavigate();

  const handleReportClick = async (reportId: number) => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = Number(localStorage.getItem("userId"));

    // console.log("historyId: " + historyId)

    if (!accessToken || !userId) {
      console.error("❌ Missing access token or user ID");
      return;
    }

    try {
      // Send GET request with headers and body
      const response = await axios.post("http://localhost:8080/api/users/reports/report",
        {userId},
        {
          headers: {
            "access": accessToken,
          }
        });

      console.log("✅ Report Details:", response.data);

      // ✅ Navigate to report detail page
      navigate(`/report/detail/${historyId}`);

    } catch (error) {
      console.error("❌ Failed to fetch report data:", error);
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
            </div>

            {/* 반복되는 단어 습관 */}
            <div id="habits"
              className={styles.report__habits}>
              <p className={styles.report__sub}>반복되는 단어 습관</p>

              {/* Pie 차트 */}
              <div className={styles.pie}>
                <div className={styles.pie__graph}>
                  <HabitsChart speakingHabits={speakingHabits} />
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
                  {/* <LeadChart  /> */}
                  {reportData ? (
                    <LeadChart ansCount={reportData.ansCount} questCount={reportData.questCount} />
                  ) : (
                    <p>📊 데이터 로딩 중...</p>
                  )}
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
                  <WordCloud words={wordCloudData} />
                </div>
                <div className={styles.keyword__bar}>
                  <WordChart keywords={keywords} />
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
                    <div key={conv.reportId} className={styles.item}>
                      <div onClick={() => handleReportClick(conv.reportId)} className={styles.item__link}>
                        <p className={styles.item__name}>{`${conv.partnerName}와의 대화`}</p>
                        <div className={styles.item__keyword}>
                          <p className={styles.item__keyword__title}>대화 키워드</p>
                          <div className={styles.item__tag}>
                            <p className={styles.item__tag__1}>{conv.keyword1}</p>
                            {conv.keyword2 && <p className={styles.item__tag__2}>{conv.keyword2}</p>}
                          </div>
                        </div>
                      </div>
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
      </div >
    </>
  )
}

export default totalReportPage