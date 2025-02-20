import { useState, useEffect } from "react";
import styles from "./styles/Keyword.module.scss";

import { Client } from "@stomp/stompjs";

type ModalProps = {
    isOpen: boolean; // 모달 열림 상태
    setSelectedKeyword: (keyword: string) => void; // 키워드 저장 함수
    setHints: React.Dispatch<React.SetStateAction<{ hint: string }[][]>>; // 힌트 저장 함수
    historyId: number; // 현재 대화 내역 id
    setIsCompleted: (completed: boolean) => void; // 키워드 전부 선택되었는지 여부
    children?: React.ReactNode; // 추가적인 child 요소
};

type KeywordItem = {
    id: number;
    name: string;
};

function Keyword({ isOpen, setSelectedKeyword, historyId, setHints, setIsCompleted }: ModalProps) {

    // 키워드 목록과 관련 상태들
    const [keywords, setKeywords] = useState<KeywordItem[]>([]);
    const [visibleCount, setVisibleCount] = useState(5); // 처음 5개만 표시
    const [selectedKeyword, setSelectedKeywordState] = useState<string | null>(null);
    const [selectedKeywordId, setSelectedKeywordIdState] = useState<number | null>(null);

    // STOMP 클라이언트 상태
    const [client, setClient] = useState<Client | null>(null);
    const [_isSelected, setIsSelected] = useState<boolean>(false);

    // 사용자가 버튼을 클릭해서 키워드 선택을 완료했는지 여부
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

    useEffect(() => {
        const fetchKeywords = async () => {
            try {
                const response = await fetch("https://peachpitch.site/api/chat/ai/keywords/add");
                const responseJson = await response.json();
                const data = responseJson.data;
                console.log(data);
                if (data.keywords && data.keywords.length > 0) {
                    // 응답 데이터의 keywordId와 keyword를 추출하여 키워드 목록에 저장
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
        let subscription: any = null; // 구독 ID 저장용 변수
         
        if (isOpen && historyId) {
            const client = new Client({
                brokerURL: "wss://peachpitch.site/api/ws",
                connectHeaders: {
                    access: `${userJwtFromStorage}`,
                },
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log("✅ KeywordModal: STOMP 연결됨");
                    client.subscribe(`/sub/chat/${historyId}`, (message) => {
                        const response = JSON.parse(message.body);
                        // console.log("키워드 응답:", response);
                        if (response.status === "waiting") {
                            // console.log("힌트 정보:", response.hints);
                            setSelectedKeyword(response.keyword);
                            setIsSelected(true);
                            setHints(prev => prev ? [...prev, response.hints] : [response.hints]);
                        } else if (response.status === "completed") {
                            // 두 명 모두 키워드 선택 완료 → 최종 데이터 전달 및 모달 종료
                            setSelectedKeyword(response.keyword);
                            setHints(prev => prev ? [...prev, response.hints] : [response.hints]);
                            // 힌트 전달 필요
                            setIsCompleted(true);
                            //  키워드 웹소켓 종료
                            // client.deactivate();
                            client.unsubscribe(subscription.id); // 구독 해제
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
                // client.deactivate();
                if (subscription) {
                    client.unsubscribe(subscription.id); // 구독 해제
                }
                setClient(null);
            };
        }
    }, [isOpen, setSelectedKeyword, setIsCompleted]);

    // "키워드 추가하기" 버튼 핸들러 (최대 15개까지)
    const handleAddKeyword = () => {
        setVisibleCount((prev) => Math.min(prev + 5, 15));
    };

    // 키워드 클릭 시 (이미 선택이 완료된 경우엔 클릭 무시)
    const handleKeywordClick = (keyword: KeywordItem) => {
        if (hasSubmitted) return;
        setSelectedKeywordState(keyword.name);
        setSelectedKeywordIdState(keyword.id);
    };

    // 선택 버튼 클릭 시, STOMP 메시지 전송 후 선택 잠금
    const handleStart = () => {
        if (!selectedKeywordId || !client?.connected) return;

        client.publish({
            destination: `/pub/keyword/${historyId}`,
            body: JSON.stringify({
                keywordId: selectedKeywordId,
            }),
        });
        setHasSubmitted(true);
    };

    return (
        <>
            {isOpen && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <div className={styles.modal__header}>
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
                                        className={`${styles.modal__keywords__item} ${selectedKeyword === keyword.name ? styles.selected : ""
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

                            {/* 버튼 영역: 아직 선택하지 않았다면 선택 버튼 보임,
                            선택 후에는 모달 중앙에 대기 메시지 표시 */}
                            {!hasSubmitted ? (
                                <div className={styles.modal__btn}>
                                    <div className={styles.btn} onClick={handleStart}>
                                        선택하기
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
                                    다른 사용자가 키워드를 고르고 있습니다.
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )
            }
        </>

    );
}

export default Keyword;
