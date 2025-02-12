import { useEffect, useState } from "react";
// import axios from "axios";
import styles from "./styles/Drawer.module.scss";

import openBtn from "@/assets/icons/drawer_open.png";
import closeBtn from "@/assets/icons/drawer_close.png";
import settingBtn from "@/assets/icons/drawer_setting.png";
import timerIcon from "@/assets/icons/drawer_timer.png";
import hintIcon from "@/assets/icons/drawer_hint.png";
import chatBtn from "@/assets/icons/drawer_chatting.png";

import FeedbackModal from "@/components/modal/Feedback"
import Setting from "@/components/modal/Setting";

type DrawerProps = {
    selectedKeyword: string | null;
    chatHistory: { role: string; message: string }[];
    turnCount: number;
};

const Drawer = ({ selectedKeyword, chatHistory, turnCount }: DrawerProps) => {
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

    // 채팅 토글
    const [chatOpen, setChatOpen] = useState(false);

    const toggleChat = () => {
        setChatOpen(!chatOpen);
    };

    // 힌트
    const [hints, setHints] = useState<string[]>([]);

    const hintSwitch = () => {
        setHintOn(!hintOn);
    };

    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const toggleSetting = () => {
        setIsSettingOpen(!isSettingOpen);
    };

    // ✅ 힌트 데이터 불러오기
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

        if (selectedKeyword) {
            loadHints();
        }
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
                    <img src={settingBtn} width={"30px"} onClick={toggleSetting} />
                </div>

                <hr className={styles.drawer__divider} />

                {/* 키워드 표시 */}
                <div className={styles.drawer__tag}>
                    <p className={styles.drawer__tag__1}>{selectedKeyword || "여행"}</p>
                    <p className={styles.drawer__tag__2} style={{ display: "none" }}></p>

                    {limitOn && (
                        <p className={styles.drawer__tag__limit}>
                            {turnCount > 0 ? (
                                <><strong>{turnCount}</strong> 회</>
                            ) : (
                                <><strong style={{ color: "red" }}>0</strong> 회</>
                            )}
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
                {hintOn && (
                    <div className={styles.drawer__hint}>
                        <div className={styles.drawer__hint__header}>
                            <p className={styles.drawer__hint__header__title}>[{selectedKeyword}] 관련 질문</p>
                        </div>
                        <ul className={styles.drawer__hint__list}>
                            {hints.length > 0 ? (
                                hints.map((hint, index) => (
                                    <li key={index} className={styles.drawer__hint__list__item}>
                                        {hint}
                                    </li>
                                ))
                            ) : (
                                <li className={styles.noHint}>관련 힌트가 없습니다.</li>
                            )}
                        </ul>
                    </div>
                )}

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
                            {chatHistory && chatHistory.length > 0 ? ( // ✅ chatHistory가 undefined/null인지 체크
                                chatHistory.map((msg, index) => (
                                    <div key={index} className={msg.role === "ai" ? styles.bubble__left : styles.bubble__right}>
                                        {msg.message}
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noChat}>채팅 기록이 없습니다.</p>
                            )}
                        </div>
                    )}

                </div>
            </div>

            <Setting isOpen={isSettingOpen} onClose={toggleSetting} />
            
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
