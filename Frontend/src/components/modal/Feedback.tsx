import {useState} from "react";
import styles from "./styles/Feedback.module.scss";
import axios from "axios";
//import closeBtn from "@/assets/icons/modal__close.png";
import {useNavigate} from "react-router-dom";

import clockIcon from "@/assets/icons/feedback_clock.png";
import handsIcon from "@/assets/icons/feedback_hands.png";
import heartIcon from "@/assets/icons/feedback_heart.png";
import laughIcon from "@/assets/icons/feedback_laugh.png";
import mouthIcon from "@/assets/icons/feedback_mouth.png";
import scoreIcon from "@/assets/icons/feedback_score.png";

type ModalProps = {
    isOpen: boolean;
    historyId: number | null;
};

// 피드백 데이터 리스트 (아이콘 및 라벨 포함)
const feedbackItems = [
    {id: "A", icon: handsIcon, label: "편안했어요"},
    {id: "B", icon: heartIcon, label: "따뜻해요"},
    {id: "C", icon: mouthIcon, label: "말이 잘 통해요"},
    {id: "D", icon: clockIcon, label: "시간 가는 줄 몰랐어요"},
    {id: "E", icon: laughIcon, label: "배꼽이 빠졌어요"},
    {id: "F", icon: scoreIcon, label: "속도가 잘 맞아요"}
];

function Feedback({isOpen, historyId}: ModalProps) {
    const navigate = useNavigate();
    // const [selected, setSelected] = useState<string | null>(null); // 선택한 아이템 저장
    const [selected, setSelected] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    // 아이템 선택 핸들러 수정
    const handleSelect = (id: string) => {
        setSelected(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };


    const handleSubmitFeedback = async () => {
        if (isSubmitting || !historyId || selected.length === 0) return;

        const userJwtFromStorage = localStorage.getItem("accessToken");
        if (!userJwtFromStorage) {
            console.error("No access token found, please log in.");
            return;
        }

        setIsSubmitting(true);

        try {
            console.log(userJwtFromStorage);
            const feedbackString = selected.sort().join('');
            const feedbackData = { feedback: feedbackString, historyId };

            // 피드백 제출 요청
            try {
                const response = await axios.post('https://peachpitch.site/api/chat/video/feedback', feedbackData, {
                    headers: { access: userJwtFromStorage }
                });
                console.log('피드백 제출 성공:', response.data);
            } catch (error) {
                console.error('피드백 제출 실패:', error);
                return;
            }

            // 대화 기록 저장 요청
            try {
                const saveResponse = await axios.post('https://peachpitch.site/api/chat/video/save',
                    { historyId },
                    { headers: { access: userJwtFromStorage } }
                );
                console.log('대화 기록 저장 성공:', saveResponse.data);
            } catch (error) {
                console.error('대화 기록 저장 실패:', error);
                return;
            }

            navigate('/main');

            console.log("리포트가 생성중입니다..");

            // 3초 후 리포트 생성 요청
            setTimeout(async () => {
                try {
                    const reportResponse = await axios.post("https://peachpitch.site/ai/users/reports/refine/", { history_id: historyId });
                    console.log("리포트 생성 완료:", reportResponse.data);
                } catch (error) {
                    console.error("리포트 생성 실패:", error);
                }
            }, 3000);
        } catch (error) {
            console.error('알 수 없는 오류 발생:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <p className={styles.modal__header__logo}>PeachPitch</p>
                </div>
                <p className={styles.modal__header__title}>대화가 어땠나요?</p>

                {/* 피드백 아이콘 리스트 */}
                <div className={styles.modal__contents}>
                    {feedbackItems.map(({id, icon, label}) => (
                        <div
                            key={id}
                            className={`${styles.modal__contents__wrap} ${selected.includes(id) ? styles.selected : ""}`}
                            onClick={() => handleSelect(id)}
                        >
                            <img src={icon} height="32px" width="32px"/>
                            <p className={styles.modal__contents__item}>{label}</p>
                        </div>
                    ))}
                </div>
                {/*
                    <div className={styles.modal__sub}>
                        <div className={styles.modal__sub__wrap}>
                        <p>다시 만나고 싶지 않은 상대인가요?</p>
                            <p style={{cursor: "pointer"}}>yes</p>
                            <p> / </p>
                            <p style={{cursor: "pointer"}}>no</p>
                        </div>
                    </div>
                */}
                <div className={styles.modal__btn}>
                    <div
                        className={styles.modal__btn__leave}
                        onClick={handleSubmitFeedback}
                        style={{
                            cursor: isSubmitting || selected.length === 0 ? 'not-allowed' : 'pointer',
                            opacity: selected.length === 0 ? 0.5 : 1
                        }}
                    >
                        {isSubmitting ? '제출 중...' : '종료하기'}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Feedback;
