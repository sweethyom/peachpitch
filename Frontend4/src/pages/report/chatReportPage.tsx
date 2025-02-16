import Header from '@/components/header/Header'
import Footer from '@/components/footer/Footer'

import styles from './styles/chat.module.scss'

import icon_clock from '@/assets/icons/feedback_clock.png'
import icon_hands from '@/assets/icons/feedback_hands.png'
import icon_heart from '@/assets/icons/feedback_heart.png'
import icon_laugh from '@/assets/icons/feedback_laugh.png'
import icon_mouth from '@/assets/icons/feedback_mouth.png'
import icon_score from '@/assets/icons/feedback_score.png'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

interface ChatReport {
  reportId: number;
  partnerName: string;
  keyword1: string;
  keyword2?: string;
}

interface ReportDetail {
  // reportId: number;
  // chatTime: number;
  pros: string;
  cons: string;
  summary: string;
  // userId: number;
  // historyId: number;
}

function chatReportPage(_id : any) {
  const params = useParams(); // ✅ URL에서 reportId 가져오기
  const reportId = params.reportId ? Number(params.reportId) : null;

  // console.log("reportId : " + reportId)

  // const navigate = useNavigate();
  // const [reportData, setReportData] = useState<any>(null);
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken")
  // useEffect(() => {
  //   console.log("📢 현재 reportId:", reportId);
  // }, [reportId]);

  const [chatReport, setChatReport] = useState<ChatReport | null>(null);
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);

  useEffect(() => {
    if (!reportId || !userId || !accessToken) {
      console.warn("⚠ reportId 또는 userId가 없습니다. API 요청을 중단합니다.");
      return;
    }

    // ✅ 첫 번째 API 요청: /totalreport 에서 chatReports 가져오기
    const fetchChatReport = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/users/reports/totalreport",
          { userId: userId },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

        // ✅ chatReports에서 reportId와 일치하는 데이터 찾기
        const chatReports = response.data?.data?.chatReports || [];
        const foundReport = chatReports.find((report: ChatReport) => report.reportId === Number(reportId));

        if (foundReport) {
          console.log("✅ chatReports에서 reportId 찾음:", foundReport);
          setChatReport(foundReport);
        } else {
          console.warn("⚠ chatReports에서 해당 reportId를 찾을 수 없음.");
        }
      } catch (error) {
        console.error("❌ Failed to fetch chatReports:", error);
      }
    };

    // ✅ 두 번째 API 요청: /report에서 reportId의 상세 정보 가져오기
    const fetchReportDetail = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/users/reports/report",
          {
            userId: userId,
            reportId: Number(reportId),
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

        console.log("✅ report 상세 데이터 가져옴:", response.data);
        setReportDetail(response.data.data);
      } catch (error) {
        console.error("❌ Failed to fetch report detail:", error);
      }
    };

    fetchChatReport();
    fetchReportDetail();
  }, [reportId, userId, accessToken]);



  // ✅ 특정 섹션으로 스크롤 이동하는 함수
  const handleScrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <Header />
      <div className={styles.wrap}>
        <div className={styles.page}>
          {/* 목차 */}
          <div className={styles.index}>
            <div className={styles.index__container}>
              <p className={styles.index__item}
                onClick={() => handleScrollToSection('history')}>대화 기록</p>
              <p className={styles.index__item}
                onClick={() => handleScrollToSection('commentary')}>총평</p>

              {chatReport?.keyword2 !== null && (
                <p className={styles.index__item} onClick={() => handleScrollToSection('feedback')}>
                  상대방의 평가
                </p>
              )}
            </div>
          </div>

          <div className={styles.report}>
            <h1 className={styles.report__title}>{chatReport?.partnerName || "알 수 없는 사용자"}와의 대화 리포트</h1>
            <div className={styles.report__tag}>
              <p className={styles.report__tag__1}>{chatReport?.keyword1 || "키워드 없음"}</p>
              {chatReport?.keyword2 && <p className={styles.report__tag__2}>{chatReport?.keyword2}</p>}
            </div>


            {/* 반복되는 단어 습관 */}
            <div className={styles.report__history}>
              <p id="history" className={styles.report__sub}>대화 기록</p>
              <div className={styles.report__history__wrapper}>
                <div className={styles.bubble__left}>
                  여행에 대해 이야기 나누기 좋아요! 최근에 여행 간 곳 중에 가장 기억에 남는 곳이 있으신가요?
                </div>
                <div className={styles.bubble__right}>
                  최근에 간 여행 중에 가장 기억에 남는 여행은 강릉 여행이었어. 나는 바다를 보고 왔어.
                </div>
                <div className={styles.bubble__left}>
                  여행에 대해 이야기 나누기 좋아요! 최근에 여행 간 곳 중에 가장 기억에 남는 곳이 있으신가요?
                </div>
                <div className={styles.bubble__right}>
                  최근에 간 여행 중에 가장 기억에 남는 여행은 강릉 여행이었어. 나는 바다를 보고 왔어.
                </div>
                <div className={styles.bubble__left}>
                  여행에 대해 이야기 나누기 좋아요! 최근에 여행 간 곳 중에 가장 기억에 남는 곳이 있으신가요?
                </div>
                <div className={styles.bubble__right}>
                  최근에 간 여행 중에 가장 기억에 남는 여행은 강릉 여행이었어. 나는 바다를 보고 왔어.
                </div>
                <div className={styles.bubble__left}>
                  여행에 대해 이야기 나누기 좋아요! 최근에 여행 간 곳 중에 가장 기억에 남는 곳이 있으신가요?
                </div>
                <div className={styles.bubble__right}>
                  최근에 간 여행 중에 가장 기억에 남는 여행은 강릉 여행이었어. 나는 바다를 보고 왔어.
                </div>
                <div className={styles.bubble__left}>
                  여행에 대해 이야기 나누기 좋아요! 최근에 여행 간 곳 중에 가장 기억에 남는 곳이 있으신가요?
                </div>
                <div className={styles.bubble__right}>
                  최근에 간 여행 중에 가장 기억에 남는 여행은 강릉 여행이었어. 나는 바다를 보고 왔어.
                </div>
              </div>
            </div>

            <hr className={styles.report__divider} />

            {/* 총평 */}
            <div className={styles.report__commentary}>
              <p id="commentary" className={styles.report__sub}>총평</p>
              <div className={styles.report__commentary__wrapper}>
                <p className={styles.report__commentary__title}>강점</p>
                <div className={styles.report__commentary__contents}>
                  {reportDetail?.pros || "총평 데이터 없음"}
                </div>
                <p className={styles.report__commentary__title}>개선점</p>
                <div className={styles.report__commentary__contents}>
                  {reportDetail?.cons || "개선점 데이터 없음"}
                </div>
                <p className={styles.report__commentary__title}>AI 요약</p>
                <div className={styles.report__commentary__contents}>
                  {reportDetail?.summary || "요약 데이터 없음"}
                </div>
              </div>
            </div>

            {chatReport?.keyword2 !== null && (
              <>
                <hr className={styles.report__divider} />

                <div className={styles.report__feedback}>
                  <p id="feedback" className={styles.report__sub}>상대방의 평가</p>
                  <p className={styles.report__feedback__comment}>
                    전반적으로, 이 대화는 자연스러운 흐름과 상호 관심사를 잘 반영하고 있어 성공적인 스몰톡의 사례라고 볼 수 있습니다.<br />
                    참여자들이 서로의 경험과 관심사에 대해 더 깊이 있게 탐구하고, 대화 속도를 조금 더 높인다면 더욱 활기찬 대화가 될 것입니다.
                  </p>

                  {/* 상대방이 체크한 평가 */}
                  <div className={styles.report__feedback__check}>
                    <div className={styles.check}>
                      <img src={icon_hands} height="26px" />
                      <p className={styles.check__label}>편안했어요</p>
                    </div>
                    <div className={styles.check}>
                      <img src={icon_heart} height="26px" />
                      <p className={styles.check__label}>따뜻해요</p>
                    </div>
                    <div className={styles.check} style={{ display: 'none' }}>
                      <img src={icon_mouth} height="26px" />
                      <p className={styles.check__label}>말이 잘 통해요</p>
                    </div>
                    <div className={styles.check}>
                      <img src={icon_clock} height="26px" />
                      <p className={styles.check__label}>시간 가는 줄 몰랐어요</p>
                    </div>
                    <div className={styles.check} style={{ display: 'none' }}>
                      <img src={icon_laugh} height="26px" />
                      <p className={styles.check__label}>배꼽이 빠졌어요</p>
                    </div>
                    <div className={styles.check} style={{ display: 'none' }}>
                      <img src={icon_score} height="26px" />
                      <p className={styles.check__label}>속도가 잘 맞아요</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}

export default chatReportPage