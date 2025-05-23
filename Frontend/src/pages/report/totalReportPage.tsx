import Header from '@/components/header/Header'
import Footer from '@/components/footer/Footer'

import styles from './styles/total.module.scss'

import HabitsChart from '@/components/chart/Habits'
import LeadChart from '@/components/chart/Lead'
import WordCloud from '@/components/chart/WordCloud'
import WordChart from '@/components/chart/Word'
import { useEffect, useState } from 'react'
import axios from 'axios'

import loading from '@/assets/images/report_loading.png'

import { useNavigate } from "react-router-dom";
import ChatReportPage from './chatReportPage'

interface SpeakingHabit {
  wordId: number;
  word: string;
  count: number;
}

function totalReportPage() {
  const [keywordFilter, _setKeywordFilter] = useState<string>("전체");
  const [sortOrder, setSortOrder] = useState<string>("최신순");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectReportId, setSelectReportId] = useState<number | null>(null);
  const navigate = useNavigate();
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
  const [_paginatedConversations, setPaginatedConversations] = useState<any[]>([]);

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
          "https://peachpitch.site/api/users/reports/totalreport",
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
  useEffect(() => {
    const fetchReportData = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const userId = Number(localStorage.getItem("userId"));

      try {
        const response = await axios.post(
          "https://peachpitch.site/api/users/reports/totalreport",
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

        if (response.data?.data?.chatReports) {
          setChatReports(response.data.data.chatReports);
        }
      } catch (error) {
        console.error("❌ Failed to fetch report data:", error);
      }
    };

    fetchReportData();
  }, []);

  // 페이징
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 선택된 리포트 클릭 시 상세 페이지로 이동 (selectReportId 설정)
  const handleReportClick = (reportId: number) => {
    console.log(reportId);
    setSelectReportId(Number(reportId));
    navigate(`/report/detail/${reportId}`,)
  };

  // 필터링된 대화 리스트 계산
  const filteredConversations = chatReports
    .filter((conv) => keywordFilter === "전체" || conv.keywords.includes(keywordFilter))
    .sort((a, b) => {
      if (sortOrder === "최신순") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

  const totalPages = Math.ceil(filteredConversations.length / 6); // Assuming 6 items per page

  useEffect(() => {
    if (filteredConversations.length > 0) {
      const startIndex = (currentPage - 1) * 6;
      const endIndex = startIndex + 6;
      setPaginatedConversations(filteredConversations.slice(startIndex, endIndex));
    }
  }, [currentPage, filteredConversations.length]);

  // 정렬된 chatReports 저장을 위한 새로운 상태 추가
  const [sortedChatReports, setSortedChatReports] = useState<any[]>([]);

  // chatReports가 변경되거나 sortOrder가 변경될 때 정렬 수행
  useEffect(() => {
    if (chatReports.length > 0) {
      const sortedReports = [...chatReports].sort((a, b) => {
        return sortOrder === "최신순" ? b.reportId - a.reportId : a.reportId - b.reportId;
      });

      setSortedChatReports(sortedReports);
    }
  }, [chatReports, sortOrder]);


  return (
    <>
      <Header />
      <div className={styles.wrap}>

        {reportData === null || chatReports === null && (
          <img src={loading} className={styles.loading} />
        )}

        {reportData !== null ? (
          <>
            <div className={styles.page}>

              {/* 목차 */}
              < div className={styles.index}>
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
                {/* <div className={styles.report__status}>
                  <div className={styles.total}>
                    <p className={styles.total__title}>총 대화 시간</p>
                    <p className={styles.total__time}><span className={styles.total__time__strong}>50</span>시간 <span className={styles.total__time__strong}>20</span>분</p>
                  </div>
                </div> */}

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
                  <p className={styles.report__alert}>리포트를 생성하는데 <strong>최대 3분</strong>이 소요됩니다.</p>

                  <div className={styles.report__list__items}>

                    {selectReportId ? (
                      <>
                        <button onClick={() => setSelectReportId(null)} className={styles.backButton}>🔙 뒤로가기</button>
                        <ChatReportPage reportId={selectReportId} /> {/* ✅ reportId 전달 */}
                      </>
                    ) : (
                      <>
                        <p className={styles.report__title}>전체 리포트</p>
                        {/* ✅ 대화 리스트 필터 */}
                        <div className={styles.report__filter}>
                          {/* 키워드 필터 */}
                          {/* <select
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
                  </select> */}

                          {/* 정렬 필터 */}
                          <select
                            className={styles.report__filter__drop}
                            value={sortOrder}
                            onChange={(e) => {
                              console.log("📌 정렬 변경됨:", e.target.value);
                              setSortOrder(e.target.value);
                              setCurrentPage(1);
                            }}
                          >
                            <option value="최신순">최신순</option>
                            <option value="오래된순">오래된순</option>
                          </select>

                        </div>

                        <div className={styles.report__list}>
                          <div className={styles.report__grid}>
                            {sortedChatReports
                              .slice((currentPage - 1) * 6, currentPage * 6) // ✅ 현재 페이지의 6개만 보여줌
                              .map((report) => (
                                <div key={report.reportId} className={styles.item}>
                                  <div onClick={() => handleReportClick(report.reportId)} className={styles.item__link}>
                                    <p className={styles.item__name}>{`${report.partnerName}와의 대화`}</p>
                                    <div className={styles.item__keyword}>
                                      <p className={styles.item__keyword__title}>대화 키워드</p>
                                      <div className={styles.item__tag}>
                                        <p className={styles.item__tag__1}>{report.keyword1}</p>
                                        {report.keyword2 && <p className={styles.item__tag__2}>{report.keyword2}</p>}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ✅ 페이징 */}
                    <div className={styles.report__paging}>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.report__paging__button}
                      >
                        ◁
                      </button>

                      {[...Array(Math.ceil(chatReports.length / 6))].map((_, i) => (
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
                        disabled={currentPage === Math.ceil(chatReports.length / 6)}
                        className={styles.report__paging__button}
                      >
                        ▷
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <img src={loading} className={styles.loading} />
          </>
        )}
        <Footer />
      </div >
    </>
  )
}

export default totalReportPage