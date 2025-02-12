import { useState, useEffect } from "react";
import styles from "./styles/Keyword.module.scss";

import closeBtn from "@/assets/icons/modal__close.png";
import { Link } from "react-router-dom";

type ModalProps = {
    children?: React.ReactNode;
    setSelectedKeyword: (keyword: string) => void;
    setSelectedKeywordId: (id: number) => void; // id 전달 함수 추가
    onClose: () => void;
};

// Keyword 객체 타입 정의
type KeywordItem = {
    id: number;
    name: string;
};

function Keyword({ children, setSelectedKeyword, setSelectedKeywordId, onClose }: ModalProps) {
    // 키워드 배열의 타입을 KeywordItem[]으로 수정
    const [keywords, setKeywords] = useState<KeywordItem[]>([]);
    const [visibleCount, setVisibleCount] = useState(5); // 처음 5개만 표시
    const [selectedKeyword, setSelectedKeywordState] = useState<string | null>(null);

    useEffect(() => {
        const fetchKeywords = async () => {
            try {
                const response = await fetch("http://peachpitch.site/api/chat/ai/keywords/add");
                const responseJson = await response.json();
                const data = responseJson.data;
                console.log(data);
                if (data.keywords && data.keywords.length > 0) {
                    // data의 keywordId와 keyword를 추출하여 KeywordItem 객체 배열로 저장
                    setKeywords(
                        data.keywords.map((item: { keywordId: number; keyword: string }) => ({
                            id: item.keywordId,
                            name: item.keyword,
                        }))
                    );
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

    // 키워드 객체 전체를 받아 처리
    const handleKeywordClick = (keyword: KeywordItem) => {
        setSelectedKeywordState(keyword.name);
        setSelectedKeyword(keyword.name); // 부모 컴포넌트에 선택된 키워드 전달
        setSelectedKeywordId(keyword.id); // 부모 컴포넌트에 선택된 키워드 id 전달
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
                            <div className={styles.modal__contents__btn} onClick={handleAddKeyword}>
                                키워드 추가하기
                            </div>
                        )}
                    </div>
                    <div className={styles.modal__keywords}>
                        {keywords.map((keyword, index) => (
                            <div
                                key={keyword.id}
                                className={`${styles.modal__keywords__item} ${
                                    selectedKeyword === keyword.name ? styles.selected : ""
                                }`}
                                onClick={() => handleKeywordClick(keyword)}
                                style={{
                                    visibility: index < visibleCount ? "visible" : "hidden",
                                    opacity: index < visibleCount ? 1 : 0,
                                    transition: "opacity 0.3s ease-in-out",
                                }}
                            >
                                {keyword.name}
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
