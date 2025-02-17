import styles from "./styles/Tutorial.module.scss";

import closeBtn from "@/assets/icons/modal__close.png";
import leftBtn from "@/assets/icons/modal__left.png";
import rightBtn from "@/assets/icons/modal__right.png";
import { useState } from "react";

import ai1Img from "@/assets/tutorial/ai1.mp4";
import ai2Img from "@/assets/tutorial/ai2.mp4";
import ai3Img from "@/assets/tutorial/ai3.mp4";
import ai4Img from "@/assets/tutorial/ai4.mp4";
import peer1Img from "@/assets/tutorial/peer1.mp4";
import peer2Img from "@/assets/tutorial/peer2.mp4";
import peer4Img from "@/assets/tutorial/peer4.mp4";

type ModalProps = {
    isOpen: boolean; // 모달 열림 상태
    onClose: () => void; // 닫기 버튼 클릭 이벤트
};

function Tutorial({ isOpen, onClose }: ModalProps) {
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 (1부터 시작)

    if (!isOpen) return null;

    // 튜토리얼 영상 리스트 (각 페이지에 맞게 7개 배열)
    const tutorials: { id: number; src: string; type: "ai" | "peer" }[] = [
        { id: 1, src: ai1Img, type: "ai" },
        { id: 2, src: ai2Img, type: "ai" },
        { id: 3, src: ai3Img, type: "ai" },
        { id: 4, src: ai4Img, type: "ai" },
        { id: 5, src: peer1Img, type: "peer" },
        { id: 6, src: peer2Img, type: "peer" },
        { id: 7, src: peer4Img, type: "peer" },
    ];

    // 각 페이지의 설명 데이터 (튜토리얼 개수에 맞게 7개)
    const pages = [
        {
            title: "AI와 진행하는 스몰토크 연습 (1)",
            description: "AI와의 스몰토크 연습을 통해 몰랐던 나의 대화 습관을 개선할 수 있습니다.",
            content: "1. 메인화면에서 [AI와 스몰토킹] 모드를 선택하세요.",
        },
        {
            title: "AI와 진행하는 스몰토크 연습 (2)",
            description: "AI와의 대화를 통해 자연스럽게 스몰토킹을 연습할 수 있습니다.",
            content: "2. 녹음 파일을 AI에게 보내면 정확도 높은 스몰토킹을 진행할 수 있습니다.",
        },
        {
            title: "AI와 진행하는 스몰토크 연습 (3)",
            description: "대화가 힘들다면 힌트를 활용해 다른 주제로 전환할 수 있습니다.",
            content: "3. AI와 주어진 총 10번의 문답을 주고 받을 수 있습니다.",
        },
        {
            title: "익명의 사용자와 1:1 매칭 (1)",
            description: "1:1 매칭을 통해 자연스럽게 대화를 나누고 소통 능력을 키울 수 있습니다.",
            content: "1. 메인화면에서 [1:1 매칭 스몰토킹] 모드를 선택하세요.",
        },
        {
            title: "익명의 사용자와 1:1 매칭 (2)",
            description: "대화할 키워드를 선택하면 대화가 시작됩니다.",
            content: "2. 말문이 막힐 땐 힌트를 이용해보세요!",
        },
        {
            title: "AI가 분석해주는 나만의 리포트 (1)",
            description: "스몰토킹이 끝난 후 AI가 분석한 리포트를 확인할 수 있습니다.",
            content: "1. 리포트에서는 총 대화 시간, 평균 공백 시간, 대화 주도권 등을 분석합니다.",
        },
        {
            title: "AI가 분석해주는 나만의 리포트 (2)",
            description: "AI가 제공하는 피드백을 통해 자신의 대화 습관을 개선할 수 있습니다.",
            content: "2. 리포트 상세에서 대화 기록과 AI 피드백을 확인할 수 있습니다.",
        },
    ];

    // 현재 페이지의 데이터
    const currentPageData = pages[currentPage - 1];
    const currentTutorial = tutorials[currentPage - 1];

    // 다음 페이지로 이동
    const handleNext = () => {
        if (currentPage < pages.length) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    // 이전 페이지로 이동
    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <img
                        src={closeBtn}
                        className={styles.modal__header__close}
                        onClick={onClose}
                        alt="Close"
                    />
                    <p className={styles.modal__header__title}>{currentPageData.title}</p>

                    {/* <p className={styles.modal__header__logo}>PeachPitch</p> */}
                </div>

                {/* 페이지별 값 변경 */}
                <p className={styles.modal__header__description}>{currentPageData.description}</p>

                <div className={styles.modal__contents}>
                    {/* 왼쪽 버튼 - 맨 처음 페이지에서는 보이지 않음 */}
                    <div
                        className={styles.modal__contents__btn}
                        style={{ visibility: currentPage === 1 ? "hidden" : "visible" }}
                        onClick={handlePrevious}
                    >
                        <img src={leftBtn} width={"15px"} height={"24px"} alt="Previous" />
                    </div>

                    <div className={styles.wrap}>
                        {/* 설명 텍스트 */}
                        <p className={styles.modal__contents__label}>{currentPageData.content}</p>

                        {/* 현재 페이지의 영상 */}
                        <video
                            src={currentTutorial.src}
                            width={"200px"}
                            muted
                            autoPlay
                            loop
                            playsInline
                            preload="auto"
                            controls
                            className={styles.wrap__video} />

                    </div>
                    {/* 오른쪽 버튼 - 마지막 페이지에서는 보이지 않음 */}
                    <div
                        className={styles.modal__contents__btn}
                        style={{
                            visibility: currentPage === pages.length ? "hidden" : "visible",
                        }}
                        onClick={handleNext}
                    >
                        <img src={rightBtn} width={"15px"} height={"24px"} alt="Next" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tutorial;
