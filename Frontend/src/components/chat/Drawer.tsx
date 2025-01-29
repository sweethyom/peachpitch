import { useEffect, useState } from "react";
import styles from "./styles/Drawer.module.scss";

import openBtn from "@/assets/icons/drawer_open.png";
import closeBtn from "@/assets/icons/drawer_close.png";
import settingBtn from "@/assets/icons/drawer_setting.png";
import timerIcon from "@/assets/icons/drawer_timer.png";
import hintIcon from "@/assets/icons/drawer_hint.png";
import chatBtn from "@/assets/icons/drawer_chatting.png";

import FeedbackModal from "@/components/modal/Feedback"

type DrawerProps = {
    selectedKeyword: string | null;
};

const Drawer = ({ selectedKeyword }: DrawerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // 드로어 토글
    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    // 스위치 토글
    const [limitOn, setLimitOn] = useState(false);
    const [hintOn, setHintOn] = useState(false);

    const limitSwitch = () => {
        setLimitOn(!limitOn);
    };

    const hintSwitch = () => {
        setHintOn(!hintOn);
    };

    // 채팅 토글
    const [chatOpen, setChatOpen] = useState(false);

    const toggleChat = () => {
        setChatOpen(!chatOpen);
    };

    // 힌트
    const [hints, setHints] = useState<string[]>([]);

    useEffect(() => {
        const loadHints = async () => {
            try {
                const response = await fetch("/data/hints.json");
                const data = await response.json();
                if (selectedKeyword && data[selectedKeyword]) {
                    setHints(data[selectedKeyword]);
                } else {
                    setHints([]);
                }
            } catch (error) {
                console.error("힌트 데이터를 불러오는 중 오류가 발생했습니다:", error);
            }
        };

        loadHints();
    }, [selectedKeyword]);

    // 피드백 토글
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    const toggleFeedback = () => { setIsFeedbackOpen(!isFeedbackOpen) };

    return (
        <div>
            {/* 드로어 */}
            <div className={`${styles.drawer} ${isOpen ? styles.open : styles.closed}`}>
                {/* 공통 헤더 */}
                <div className={styles.drawer__header}>
                    <img src={closeBtn} onClick={toggleDrawer} width={"12px"} height={"23px"} />
                    <button onClick={toggleFeedback}>피드백</button>
                    <img src={settingBtn} width={"30px"} />
                </div>

                <hr className={styles.drawer__divider} />

                {/* 키워드 표시 */}
                <div className={styles.drawer__tag}>
                    <p className={styles.drawer__tag__1}>{selectedKeyword || "여행"}</p>
                    <p className={styles.drawer__tag__2} style={{ display: "none" }}></p>
                    {limitOn && (
                        <p className={styles.drawer__tag__limit}>
                            <strong>10</strong> 회
                        </p>
                    )}

                </div>

                {/* 남은 턴수 */}
                <div className={styles.drawer__wrapper}>
                    <img src={timerIcon} width={"30px"} />
                    <p className={styles.drawer__sub}>남은 턴수</p>

                    {/* 스위치 */}
                    <div className={styles.drawer__wrapper__switch}>
                        <p className={styles.switch__label}>OFF</p>
                        <div className={`${styles.switch} ${limitOn ? styles.on : ""}`} onClick={limitSwitch}>
                            <div className={`${styles.toggle} ${limitOn ? styles.on : styles.off}`} />
                        </div>
                        <p className={styles.switch__label}>ON</p>
                    </div>
                </div>

                {/* 힌트 */}
                <div className={styles.drawer__wrapper}>
                    <img src={hintIcon} width={"30px"} />
                    <p className={styles.drawer__sub}>힌트</p>

                    {/* 스위치 */}
                    <div className={styles.drawer__wrapper__switch}>
                        <p className={styles.switch__label}>OFF</p>
                        <div className={`${styles.switch} ${hintOn ? styles.on : ""}`} onClick={hintSwitch}>
                            <div className={`${styles.toggle} ${hintOn ? styles.on : styles.off}`} />
                        </div>
                        <p className={styles.switch__label}>ON</p>
                    </div>
                </div>

                {/* 힌트 리스트 */}
                <div className={styles.drawer__hint}>
                    <div className={styles.drawer__hint__header}>
                        <p className={styles.drawer__hint__header__title}>[{selectedKeyword || "키워드"}]에 관련된 질문</p>
                    </div>
                    <ul className={`${styles.drawer__hint__list} ${!hintOn ? styles["drawer__hint__list--hidden"] : ""}`}>
                        {hints.map((hint, index) => (
                            <li key={index} className={styles.drawer__hint__list__item}>
                                {hint}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 채팅 */}
                <div className={styles.drawer__chatting}>
                    <div className={styles.drawer__chatting__header} onClick={toggleChat}>
                        <p className={styles.drawer__sub__chat}>채팅</p>
                        <img
                            src={chatBtn}
                            width={"18px"}
                            height={"10px"}
                            className={`${styles.chatBtn} ${chatOpen ? styles.open : styles.closed}`}
                        />
                    </div>

                    {/* Prompt 창 */}
                    {chatOpen && (
                        <div className={styles.drawer__chatting__prompt}>
                            <div className={styles.bubble__left}>
                                여행에 대해 이야기 나누기 좋아요! 최근에 여행 간 곳 중에 가장 기억에 남는 곳이 있으신가요?
                            </div>
                            <div className={styles.bubble__right}>
                                최근에 간 여행 중에 가장 기억에 남는 여행은 강릉 여행이었어. 나는 바다를 보고 왔어.
                            </div>
                            <div className={styles.bubble__left}>
                                맘껏 뛰어다니는 그 기분이 해방되셨을 것 같아요. 그런 순간들이 정말 시원하고 행복하죠.
                            </div>
                            <div className={styles.bubble__right}>
                                정말 재밌는 경험이었다고 생각해. 너도 그런 경험 해봤어?
                            </div>
                            <div className={styles.bubble__left}>
                                네, 해변에서 맨발로 뛰어본 경험이 있어요. 정말 자유롭고 즐거운 기억으로 남아있어요. 친구와의 그런 순간은 정말 소중하죠.
                            </div>
                            <div className={styles.bubble__right}>
                                정말 멋진 추억이 되었겠네요. 그런 경험은 두고두고 떠올리게 되죠. 다음 여행도 기대될 것같아!
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 열기 버튼 */}
            {!isOpen && (
                <button onClick={toggleDrawer} className={styles.drawerToggle}>
                    <img src={openBtn} width={"40px"} />
                </button>
            )}

            {/* 피드백 모달 */}
            <FeedbackModal isOpen={isFeedbackOpen} onClose={toggleFeedback} />
        </div>
    );
};

export default Drawer;
