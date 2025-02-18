import styles from "./styles/ChatEnd.module.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;  // ✅ 모달 닫기 이벤트 추가
    historyId: number | null;
};

function ChatEnd({ isOpen, historyId }: ModalProps) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    /* ✅ 채팅 다시 시작 (새로고침) */
    const restartChat = () => {
        window.location.href = "/chat/ai";
    };

    const userId = localStorage.getItem("userId")

    /* ✅ 종료 버튼 클릭 시 데이터 저장 후 /report 페이지로 이동 */
    const endChat = async () => {
        if (!historyId) {
            console.error("history id 없음");
            navigate('/main');
            return;
        }

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            console.error("accessToken 없음");
            return;
        }

        try {

            // ✅ Step 1: Save chat history in the database
            await axios.post(
                "https://peachpitch.site/api/chat/save",
                { historyId },
                {
                    headers: {
                        access: accessToken  // ✅ access token 추가
                    },
                    withCredentials: true,
                }
            );


            console.log("채팅 기록 저장 완료");
            console.log("리포트가 생성중입니다..");

            navigate("/main");

            setTimeout(async () => {
                try {
                    await axios.post("https://peachpitch.site/ai/users/reports/refine/",
                        {
                            history_id: historyId
                        }
                    );
                    console.log("리포트 생성 완료");
                } catch (error) {
                    console.error("리포트 생성 실패", error);
                }
            }, 3000);

        } catch (error) {
            console.error("❌ Failed to save chat history:", error);
        }
    };


    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <p className={styles.modal__header__logo}>PeachPitch</p>
                </div>

                <p className={styles.modal__header__title}>AI 대화 종료</p>

                <div className={styles.modal__contents}>
                    <p className={styles.modal__sub}>AI와의 대화가 종료되었습니다.</p>
                    <p className={styles.modal__description}>
                        [다른 대화 진행하기] 버튼을 클릭하면 새로운 키워드로 <br /> AI와 대화를 시작할 수 있습니다.
                    </p>
                </div>

                {/* ✅ 버튼을 ChatEnd 내부에서 관리 */}
                <div className={styles.modal__btn}>
                    <button className={styles.modal__btn__continue} onClick={restartChat}>
                        다른 대화 진행하기
                    </button>
                    <button className={styles.modal__btn__end} onClick={endChat}>
                        종료하기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatEnd;
