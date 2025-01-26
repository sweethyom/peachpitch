import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

import styles from './styles/landing.module.scss';

import magnifier from '@/assets/images/landing_magnifier.png';
import meeting from '@/assets/images/landing_meeting.png';
import talk from '@/assets/images/landing_talk.png';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function LandingPage() {
    const [currentStep, setCurrentStep] = useState(0); // 0 → 1 → 2 순환

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prevStep) => (prevStep + 1) % 3); // 0 → 1 → 2 → 0 반복
        }, 3000); // 20초 간격
        return () => clearInterval(interval); // 클린업
    }, []);

    return (
        <>
            <Header />

            <div className={styles.page}>
                <div className={styles.landing}>
                    <p className={styles.landing__keyword}>AI와 스몰토크 코칭</p>
                    <p className={styles.landing__title}>
                        AI와 스몰토크를 진행하고 <br /> 나의 대화 습관을 <br /> 파악해보세요!
                    </p>
                    <div className={styles.landing__button}>
                        <Link to='/main'>
                            <button className={styles.landing__button__start}>시작하기</button>
                        </Link>
                        <button className={styles.landing__button__tutorial}>튜토리얼</button>
                    </div>
                </div>

                <div className={styles.post}>
                    {/* 이미지 1 */}
                    <img
                        src={magnifier}
                        alt="magnifier"
                        className={`${styles.post__image} ${currentStep === 0 ? styles.active : currentStep === 1 ? styles.exit : ''
                            }`}
                    />
                    {/* 이미지 2 */}
                    <img
                        src={meeting}
                        alt="meeting"
                        className={`${styles.post__image} ${currentStep === 1 ? styles.active : currentStep === 2 ? styles.exit : ''
                            }`}
                    />
                    {/* 이미지 3 */}
                    <img
                        src={talk}
                        alt="talk"
                        className={`${styles.post__image} ${currentStep === 2 ? styles.active : currentStep === 0 ? styles.exit : ''
                            }`}
                    />
                </div>
            </div>

            <Footer />
        </>
    );
}

export default LandingPage;
