import { useState, useEffect } from "react";
import styles from "./styles/Keyword.module.scss";

import closeBtn from "@/assets/icons/modal__close.png";
import { Link } from "react-router-dom";

type ModalProps = {
    isOpen: boolean; // 모달 열림 상태
    // onClose: () => void; // 닫기 버튼 클릭 이벤트
    setSelectedKeyword: (keyword: string) => void; // 키워드 저장 함수
    children?: React.ReactNode; // 추가적인 child 요소
    // onKeywordSelected: (keyword: string) => void;
};


function Keyword({ isOpen, setSelectedKeyword}: ModalProps) {
    if (!isOpen) return null;

    const [keywords, setKeywords] = useState<string[]>([]);
    const [visibleCount, setVisibleCount] = useState(5); // 처음 5개만 표시
    const [selectedKeyword, setSelectedKeywordState] = useState<string | null>(null);

    useEffect(() => {
        const fetchKeywords = async () => {
            try {
                const response = await fetch("/data/keywords.json");
                const data = await response.json();

                // 랜덤한 15개 키워드 선택
                const shuffledKeywords = data.keywords.sort(() => 0.5 - Math.random());
                setKeywords(shuffledKeywords.slice(0, 15));
            } catch (error) {
                console.error("키워드 로딩 중 오류 발생:", error);
            }
        };

        fetchKeywords();
    }, []);

    const handleAddKeyword = () => {
        setVisibleCount((prev) => Math.min(prev + 5, 15)); // 5개씩 추가 표시, 최대 15개까지
    };

    const handleKeywordClick = async (keyword: string) => {
        setSelectedKeywordState(keyword); // 로컬 상태 업데이트
        setSelectedKeyword(keyword); // 부모 컴포넌트(`videoChatPage.tsx`) 상태 업데이트
        // onKeywordSelected(keyword); // 상대방이 키워드를 선택했음을 부모에 전달

        // 선택한 키워드를 서버에 전달 (예제 API 호출)
        try {
            await fetch("/api/setKeyword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyword }),
            });
            console.log(`📡 서버에 키워드(${keyword}) 저장 완료`);
        } catch (error) {
            console.error("❌ 키워드 저장 중 오류 발생:", error);
        }

        // 키워드 선택 후 모달 닫기
        // onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <Link to="/main">
                        <img src={closeBtn} className={styles.modal__header__close} />
                    </Link>
                    <p className={styles.modal__header__logo}>PeachPitch</p>
                </div>
                <p className={styles.modal__header__title}>키워드 선택하기</p>
                <div className={styles.modal__contents}>

                    <div className={styles.modal__contents__add}>
                        {visibleCount < 15 && (
                            <div
                                className={styles.modal__contents__btn}
                                onClick={handleAddKeyword}>
                                키워드 추가하기
                            </div>
                        )}
                    </div>

                    <div className={styles.modal__keywords}>
                        {keywords.map((keyword, index) => (
                            <div
                                key={index}
                                className={`${styles.modal__keywords__item} ${selectedKeyword === keyword ? styles.selected : ""
                                    }`}
                                onClick={() => handleKeywordClick(keyword)}
                                style={{
                                    // visibility: index < visibleCount ? "visible" : "hidden",
                                    // opacity: index < visibleCount ? 1 : 0,
                                    transition: "opacity 0.3s ease-in-out"
                                }}>
                                {keyword}
                            </div>
                        ))}
                    </div>
                </div>

                {/* main에서 이동 링크 관리 */}
                {/* <div className={styles.modal__btn}>{children}</div> */}
            </div>
        </div>
    );
}

export default Keyword;
