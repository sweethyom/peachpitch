import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

import styles from './styles/landing.module.scss';

import magnifier from '@/assets/images/landing_magnifier.png';
import meeting from '@/assets/images/landing_meeting.png';
import talk from '@/assets/images/landing_talk.png';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import TutorialModal from '@/components/modal/Tutorial'

function LandingPage() {
    /* 이미지 애니메이션 */
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prevStep) => (prevStep + 1) % 4);
        }, 3000); // 3초 간격

        switch (currentStep) {
            case 0:
                document.body.style.backgroundColor = 'var(--color-green-000)';
                break;
            case 1:
                document.body.style.backgroundColor = 'var(--color-pink-000)';
                break;
            case 2:
                document.body.style.backgroundColor = 'var(--color-yellow-000)';
                break;
            case 3:
                document.body.style.backgroundColor = 'var(--color-yellow-000)';
                break;
            default:
                document.body.style.backgroundColor = 'var(--color-white-000)';
        }

        return () => clearInterval(interval); // 클린업
    }, [currentStep]);

    const getPageClass = () => {
        if (currentStep === 0) return `isGreen`;
        if (currentStep === 1) return `isPink`;
        if (currentStep === 2 || currentStep === 3) return `isYellow`;
        return '';
    };

    const getDynamicContent = () => {
        switch (currentStep) {
            case 0:
                return {
                    keyword: "AI와 스몰토크 코칭",
                    title: "AI와 스몰토크를 진행하고 <br /> 나의 대화 습관을 <br /> 파악해보세요!",
                };
            case 1:
                return {
                    keyword: "1:1 스몰토크 매칭",
                    title: "익명의 1:1 매칭을 통해 <br /> 부담없이 스몰토크를 <br /> 진행해보세요!",
                };
            case 2:
            case 3:
                return {
                    keyword: "오늘의 스몰토키 키워드",
                    title: "매일 새롭게 주어지는 키워드 <br /> 로 대화하면 나도 이제 스몰 <br /> 토크 장인?!",
                };
            default:
                return { keyword: "", title: "" };
        }
    };

    const { keyword, title } = getDynamicContent();

    /* 튜토리얼 모달창 */
    const [isTutorialOpen, setIsTutorialOpen] = useState(false); // 모달 열림 상태 관리

    const toggleTutorial = () => {
        setIsTutorialOpen(!isTutorialOpen);
    };

    return (
        <>
            <Header
                isGreen={currentStep === 0}
                isPink={currentStep === 1}
                isYellow={currentStep === 2}
            />

            {/* 상위 컨테이너에 동적으로 클래스 추가 */}
            <div className={`${styles.page} ${getPageClass()}`}>
                <div className={styles.page__wrap}>
                    <div className={styles.landing}>
                        <p className={styles.landing__keyword}>{keyword}</p>
                        <p
                            className={styles.landing__title}
                            dangerouslySetInnerHTML={{ __html: title }}
                        ></p>
                        <div className={styles.landing__button}>
                            <Link to="/main">
                                <button
                                    className={styles.landing__button__start}
                                    onClick={() =>
                                        (document.body.style.backgroundColor = 'var(--color-white-000)')
                                    }
                                >
                                    시작하기
                                </button>
                            </Link>
                            <button
                                className={styles.landing__button__tutorial}
                                onClick={toggleTutorial}
                            >
                                튜토리얼
                            </button>
                        </div>
                    </div>

                    <div className={styles.post}>
                        <img
                            src={magnifier}
                            alt="magnifier"
                            className={`${styles.post__image} ${currentStep === 0 ? styles.active : currentStep === 1 ? styles.exit : ''}`}
                        />
                        <img
                            src={meeting}
                            alt="meeting"
                            className={`${styles.post__image} ${currentStep === 1 ? styles.active : currentStep === 2 ? styles.exit : ''}`}
                        />
                        <img
                            src={talk}
                            alt="talk"
                            className={`${styles.post__image} ${currentStep === 2 ? styles.active : currentStep === 0 ? styles.exit : ''}`}
                        />
                    </div>


                </div>

                <Footer
                    isGreen={currentStep === 0}
                    isPink={currentStep === 1}
                    isYellow={currentStep === 2}
                />
            </div>



            <TutorialModal isOpen={isTutorialOpen} onClose={toggleTutorial} />
        </>
    );
}

export default LandingPage;
