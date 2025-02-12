import {useState, useEffect} from "react";
import styles from "./styles/Keyword.module.scss";

import closeBtn from "@/assets/icons/modal__close.png";
import {Link} from "react-router-dom";
import {Client} from "@stomp/stompjs";

type ModalProps = {
    isOpen: boolean; // 모달 열림 상태
    // onClose: () => void; // 닫기 버튼 클릭 이벤트
    setSelectedKeyword: (keyword: string) => void; // 키워드 저장 함수
    historyId: number; // 현재 대화 내역 id
    setIsCompleted: (completed: boolean) => void;  // 키워드 전부 선택되었는지
    children?: React.ReactNode; // 추가적인 child 요소
    // onKeywordSelected: (keyword: string) => void;
};

// Keyword 객체 타입 정의
type KeywordItem = {
    id: number;
    name: string;
};

function Keyword({isOpen, setSelectedKeyword, historyId, setIsCompleted}: ModalProps) {
    if (!isOpen) return null;
    // 키워드 배열의 타입을 KeywordItem[]으로 수정
    const [keywords, setKeywords] = useState<KeywordItem[]>([]);
    const [visibleCount, setVisibleCount] = useState(5); // 처음 5개만 표시
    const [selectedKeyword, setSelectedKeywordState] = useState<string | null>(null);
    const [selectedKeywordId, setSelectedKeywordIdState] = useState<number | null>(null);
    /* stomp client */
    const [client, setClient] = useState<Client | null>(null);
    /* 키워드 선택 상태 */

    useEffect(() => {
        const fetchKeywords = async () => {
            try {
                const response = await fetch("https://peachpitch.site/api/chat/ai/keywords/add");
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

    // 모달 열릴 때 STOMP 클라이언트 생성 및 구독 설정
    useEffect(() => {
        const userJwtFromStorage = localStorage.getItem("accessToken");
        if (isOpen && historyId) {
            const client = new Client({
                brokerURL: "wss://peachpitch.site/api/ws",
                connectHeaders: {
                    access: `${userJwtFromStorage}`,
                },
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log("✅ KeywordModal: STOMP 연결됨");
                    // 키워드 관련 메시지 구독
                    client.subscribe(`/sub/chat/${historyId}`, (message) => {
                        const response = JSON.parse(message.body);
                        console.log("키워드 응답:", response);
                        if (response.status === "waiting") {
                            console.log("힌트 정보:", response.hints);
                        } else if (response.status === "completed") {
                            // 두 명 모두 키워드 선택 완료 -> 최종 데이터 전달 및 모달 닫기
                            setSelectedKeyword(response.keyword);
                            // 힌트 전달 필요
                            setIsCompleted(true);
                            //키워드 웹소켓 종료
                            client.deactivate();
                        }
                    });
                },
                onDisconnect: () => console.log("❌ keyword STOMP 연결 종료됨"),
                onStompError: (frame) => console.error("STOMP 에러:", frame),
                onWebSocketError: (event) => console.error("WebSocket 에러:", event),
            });
            client.activate();
            setClient(client);
            return () => {
                client.deactivate();
                setClient(null);
            };
        }
    }, [isOpen, setSelectedKeyword, setIsCompleted]);

    const handleAddKeyword = () => {
        setVisibleCount((prev) => Math.min(prev + 5, 15)); // 5개씩 추가 표시, 최대 15개까지
    };

    // 키워드 클릭 시 로컬 상태만 업데이트
    const handleKeywordClick = (keyword: KeywordItem) => {
        setSelectedKeywordState(keyword.name);
        setSelectedKeywordIdState(keyword.id);
    };

    const handleStart = () => {
        if (!selectedKeywordId || !client?.connected) return;

        if (selectedKeywordId && client && client.connected) {
            client.publish({
                destination: `/pub/keyword/${historyId}`,
                body: JSON.stringify({
                    keywordId: selectedKeywordId
                }),
            });
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <Link to="/main">
                        <img src={closeBtn} className={styles.modal__header__close}/>
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
                {/*<div className={styles.modal__btn}>{children}</div>*/}
                <div className={styles.modal__btn}>
                    <div className={styles.btn} onClick={handleStart}>
                        시작하기
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Keyword;
