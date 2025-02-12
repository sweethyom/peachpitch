import styles from "./styles/Tutorial.module.scss";

import closeBtn from "@/assets/icons/modal__close.png";
import leftBtn from "@/assets/icons/modal__left.png";
import rightBtn from "@/assets/icons/modal__right.png";
import { useState } from "react";

type ModalProps = {
    isOpen: boolean; // 모달 열림 상태
    onClose: () => void; // 닫기 버튼 클릭 이벤트
};

function Tutorial({ isOpen, onClose }: ModalProps) {
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태

    if (!isOpen) return null;

    // 페이지별 콘텐츠
    const pages = [
        {
            modalHeaderTitle: "AI와 진행하는 스몰토크 연습",
            modalHeaderDescription:
                "AI와의 스몰토크 연습을 통해 몰랐던 나의 대화 습관부터가벼운 대화를 나누기 위한 <br /> 첫 질문을 할 수 있도록 도와드리겠습니다.",
            modalContents: [
                "1. 메인화면에서 [AI와 스몰토킹] <br /> 모드를 선택하세요.",
                "2. 녹음 파일을 AI에게 보내면 정확도 <br /> 높은 스몰토킹을 진행할 수 있습니다.",
            ],
        },
        {
            modalHeaderTitle: "AI와 진행하는 스몰토크 연습",
            modalHeaderDescription:
                "AI와의 스몰토크 연습을 통해 몰랐던 나의 대화 습관부터가벼운 대화를 나누기 위한 <br /> 첫 질문을 할 수 있도록 도와드리겠습니다.",
            modalContents: [
                "3. 대화가 힘들다면 힌트를 통해 다른 이야기 <br /> 주제로 전환하는 연습을 할 수 있습니다.",
                "4. AI와 주어진 총 10번의 문답을 주고 받을 수 <br /> 있습니다. 10번이 끝나면 최대 1번까지 이용권을 <br /> 이용해 대화를 이어가보세요!",
            ],
        },
        {
            modalHeaderTitle: "익명의 사용자와 1:1 매칭으로 스몰토크 연습",
            modalHeaderDescription:
                "1:1 매칭 스몰토킹으로 낯선 사람과 연결되어 <br /> 자연스럽게 대화의 즐거움을 발견하고 소통 능력을 키워보세요!",
            modalContents: [
                "1. 메인화면에서 [1:1 매칭 스몰토킹] <br /> 모드를 선택하세요.",
                "2. 대화할 키워드를 선택하게 되면 대화가 시작됩니다. <br /> 말문이 막힐 땐 힌트를 이용해보세요!",
            ],
        },
        {
            modalHeaderTitle: "AI가 분석해주는 나만의 리포트",
            modalHeaderDescription: "스몰토킹이 끝나면 리포트를 생성합니다.",
            modalContents: [
                "1. 전체 키워드에서는 총 대화 시간, 평균 공백 시간 <br /> 반복되는 단어 습관, 대화 주도권, 많이 선택한 대화 키워드 <br /> 정보를 확인할 수 있습니다.",
                "2. 리포트 상세에서는 대화를 나누었던 기록과 <br /> AI 피드백 등을 확인할 수 있습니다.",
            ],
        },
    ];

    const handleNext = () => {
        setCurrentPage((prevPage) => (prevPage < pages.length ? prevPage + 1 : prevPage));
    };

    const handlePrevious = () => {
        setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
    };

    const currentPageData = pages[currentPage - 1];

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <img
                        src={closeBtn}
                        className={styles.modal__header__close}
                        onClick={onClose}
                    />
                    <p className={styles.modal__header__logo}>PeachPitch</p>
                </div>

                {/* 페이지별 값 변경 */}
                <p className={styles.modal__header__title}>
                    {currentPageData.modalHeaderTitle}
                </p>
                <p
                    className={styles.modal__header__description}
                    dangerouslySetInnerHTML={{
                        __html: currentPageData.modalHeaderDescription,
                    }}
                ></p>

                <div className={styles.modal__contents}>
                    {/* 왼쪽 버튼 - 맨 처음 페이지에서는 보이지 않음 */}
                    <div
                        className={styles.modal__contents__btn}
                        style={{ visibility: currentPage === 1 ? "hidden" : "visible" }}
                        onClick={handlePrevious}
                    >
                        <img src={leftBtn} width={"15px"} height={"24px"} />
                    </div>

                    {currentPageData.modalContents.map((content, index) => (
                        <div key={index} className={styles.modal__contents__section}>
                            <div className={styles.modal__contents__img}></div>
                            <p
                                className={styles.modal__contents__label}
                                dangerouslySetInnerHTML={{ __html: content }}
                            ></p>
                        </div>
                    ))}

                    {/* 오른쪽 버튼 - 마지막 페이지에서는 보이지 않음 */}
                    <div
                        className={styles.modal__contents__btn}
                        style={{
                            visibility: currentPage === pages.length ? "hidden" : "visible",
                        }}
                        onClick={handleNext}
                    >
                        <img src={rightBtn} width={"15px"} height={"24px"} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tutorial;
