import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'

import styles from './styles/chat.module.scss'

import icon_clock from '../../assets/icons/feedback_clock.png'
import icon_hands from '../../assets/icons/feedback_hands.png'
import icon_heart from '../../assets/icons/feedback_heart.png'
import icon_laugh from '../../assets/icons/feedback_laugh.png'
import icon_mouth from '../../assets/icons/feedback_mouth.png'
import icon_score from '../../assets/icons/feedback_score.png'

function chatReportPage() {

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
            <p className={styles.index__item}
              onClick={() => handleScrollToSection('history')}>대화 기록</p>
            <p className={styles.index__item}
              onClick={() => handleScrollToSection('commentary')}>총평</p>
            <p className={styles.index__item} onClick={() => handleScrollToSection('feedback')}>
              상대방의 평가
            </p>
          </div>

          <div className={styles.report}>
            <p className={styles.report__title}>달고나 좋아하는 강아지와의 대화 리포트</p>
            <div className={styles.report__tag}>
              <p className={styles.report__tag__1}>보드 게임</p>
              <p className={styles.report__tag__2}>보드 게임</p>
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
                  1. 주제 전개: 강릉 여행에서 시작하여 해외여행, 특히 스위스로 자연스럽게 주제를 확장했습니다.<br />
                  2. 상호작용: 서로의 말에 적절히 반응하고 추가 질문을 하며 대화를 이어갔습니다.<br />
                  3. 구체적 경험 공유: 모래사장에서 뛰어논 경험 등 구체적인 이야기를 통해 대화에 생동감을 더했습니다.
                </div>
                <p className={styles.report__commentary__title}>개선점</p>
                <div className={styles.report__commentary__contents}>
                  1. 대화 속도: 대부분의 발화 사이에 5-6초의 간격이 있었습니다. 더 빠른 응답으로 대화의 흐름을 더욱 자연스럽게 만들 수 있습니다.<br />
                  2. 질문의 다양성: 더 다양한 유형의 질문을 통해 대화를 더욱 풍부하게 만들 수 있습니다.<br />
                  3. 정보의 깊이: 스위스에 대한 대화에서 더 구체적인 정보나 개인적인 의견을 추가하면 대화가 더욱 흥미로워질 수 있습니다.
                </div>
              </div>
            </div>

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
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}

export default chatReportPage