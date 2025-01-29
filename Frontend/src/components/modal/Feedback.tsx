import { useState } from "react";
import styles from "./styles/Feedback.module.scss";

import closeBtn from "@/assets/icons/modal__close.png";
import { Link } from "react-router-dom";

import clockIcon from "@/assets/icons/feedback_clock.png";
import handsIcon from "@/assets/icons/feedback_hands.png";
import heartIcon from "@/assets/icons/feedback_heart.png";
import laughIcon from "@/assets/icons/feedback_laugh.png";
import mouthIcon from "@/assets/icons/feedback_mouth.png";
import scoreIcon from "@/assets/icons/feedback_score.png";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

// 피드백 데이터 리스트 (아이콘 및 라벨 포함)
const feedbackItems = [
    { id: "hands", icon: handsIcon, label: "편안했어요" },
    { id: "heart", icon: heartIcon, label: "따뜻해요" },
    { id: "mouth", icon: mouthIcon, label: "말이 잘 통해요" },
    { id: "clock", icon: clockIcon, label: "시간 가는 줄 몰랐어요" },
    { id: "laugh", icon: laughIcon, label: "배꼽이 빠졌어요" },
    { id: "score", icon: scoreIcon, label: "속도가 잘 맞아요" }
];

function Feedback({ isOpen, onClose }: ModalProps) {
    const [selected, setSelected] = useState<string | null>(null); // 선택한 아이템 저장

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <img src={closeBtn} className={styles.modal__header__close} onClick={onClose} />
                    <p className={styles.modal__header__logo}>PeachPitch</p>
                </div>
                <p className={styles.modal__header__title}>대화가 어땠나요?</p>

                {/* 피드백 아이콘 리스트 */}
                <div className={styles.modal__contents}>
                    {feedbackItems.map(({ id, icon, label }) => (
                        <div
                            key={id}
                            className={`${styles.modal__contents__wrap} ${selected === id ? styles.selected : ""}`}
                            onClick={() => setSelected(id)}
                        >
                            <img src={icon} height="32px" width="32px" />
                            <p className={styles.modal__contents__item}>{label}</p>
                        </div>
                    ))}
                </div>

                <div className={styles.modal__sub}>
                    <div className={styles.modal__sub__wrap}>
                        <p>다시 만나고 싶지 않은 상대인가요?</p>
                        <p style={{ cursor: "pointer" }}>yes</p>
                        <p> / </p>
                        <p style={{ cursor: "pointer" }}>no</p>
                    </div>
                </div>
                <div className={styles.modal__btn}>
                    <Link to='/report'>
                        <div className={styles.modal__btn__leave}>종료하기</div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Feedback;
