import { useState, useEffect } from "react";
import styles from "./styles/Keyword.module.scss";

import closeBtn from "@/assets/icons/modal__close.png";

import axios from "axios";
import { Link } from "react-router-dom";

type ModalProps = {
    children?: React.ReactNode;
    setSelectedKeyword: (keyword: string) => void;
    onClose: () => void; // ✅ 모달 닫기 함수 추가
};

function Keyword({ children, setSelectedKeyword }: ModalProps) {
    // if (!isOpen) return null;

    const [keywords, setKeywords] = useState<string[]>([]);
    const [visibleCount, setVisibleCount] = useState(5); // 처음 5개만 표시
    const [selectedKeyword, setSelectedKeywordState] = useState<string | null>(null);

    useEffect(() => {
        const fetchKeywords = async () => {
            try {
                const response = await fetch("/data/keywords.json"); // ✅ 올바른 경로 사용
                const data = await response.json();

                if (data.keywords && data.keywords.length > 0) {
                    const shuffledKeywords = [...data.keywords].sort(() => 0.5 - Math.random()); // ✅ Shuffle keywords
                    setKeywords(shuffledKeywords.slice(0, 15)); // ✅ Select exactly 15 keywords
                }
            } catch (error) {
                console.error("키워드 로딩 오류:", error);
            }
        };

        fetchKeywords();
    }, []);


    const handleAddKeyword = () => {
        setVisibleCount((prev) => Math.min(prev + 5, 15)); // 5개씩 추가 표시, 최대 15개까지
    };

    const handleKeywordClick = (keyword: string) => {
        setSelectedKeywordState(keyword);
        setSelectedKeyword(keyword); // 부모 컴포넌트에 선택된 키워드 전달
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
                                    visibility: index < visibleCount ? "visible" : "hidden",
                                    opacity: index < visibleCount ? 1 : 0,
                                    transition: "opacity 0.3s ease-in-out"
                                }}>
                                {keyword}
                            </div>
                        ))}
                    </div>
                </div>

                {/* main에서 이동 링크 관리 */}
                <div className={styles.modal__btn}>{children}</div>
            </div>
        </div>
    );
}

export default Keyword;
