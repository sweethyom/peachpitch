import styles from "./styles/Tutorial.module.scss";

import closeBtn from "@/assets/icons/modal__close.png";
import leftBtn from "@/assets/icons/modal__left.png";
import rightBtn from "@/assets/icons/modal__right.png";
import { useState } from "react";

import ai1Img from "@/assets/tutorial/ai1.gif";
import ai2Img from "@/assets/tutorial/ai2.gif";
import ai3Img from "@/assets/tutorial/ai3.gif";
import ai4Img from "@/assets/tutorial/ai4.gif";
import peer1Img from "@/assets/tutorial/peer1.gif";
import peer2Img from "@/assets/tutorial/peer2.gif";
import peer4Img from "@/assets/tutorial/peer4.gif";

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
        { id: 4, src: ai4Img, type: "ai" },
        { id: 3, src: ai3Img, type: "ai" },
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
            content: "2. 키워드를 선택해 주제에 맞는 스몰토크를 진행합니다.",
        },
        {
            title: "AI와 진행하는 스몰토크 연습 (3)",
            description: "실제 AI와 진행한 스몰토크 예시",
            content: "3. 어머! 코를 자꾸 만지는 습관이 있군요",
        },
        {
            title: "AI와 진행하는 스몰토크 연습 (4)",
            description: "대화가 힘들다면 힌트를를 활용해 해결해 보세요!",
            content: "4. AI와 주어진 총 10번의 문답을 주고 받을 수 있습니다.",
        },
        {
            title: "익명의 사용자와 1:1 매칭 (1)",
            description: "1:1 매칭을 통해 자연스럽게 대화를 나누고 소통 능력을 키울 수 있습니다.",
            content: "1. 매칭이 되었다면 메인화면에서 [1:1 매칭 스몰토킹] 모드를 선택하세요.",
        },
        {
            title: "익명의 사용자와 1:1 매칭 (2)",
            description: "대화할 키워드를 선택하면 대화가 시작됩니다.",
            content: "2. 어떤 상대와 만날지 두근두근 하네요!",
        },
        {
            title: "익명의 사용자와 1:1 매칭 (3)",
            description: "스몰토킹이 끝난 후 상대에 대한 평가가 진행됩니다.",
            content: "3. 상대의 리포트에 전해지는 만큼 평가에 신중해주세요!",
        }
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

                        {/* 현재 페이지의 영상 */}
                        <div className={styles.wrap__div}>
                            <img src={currentTutorial.src} className={styles.wrap__gif} />
                        </div>

                        <p className={styles.modal__contents__label}>{currentPageData.content}</p>

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
