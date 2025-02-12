import styles from "./styles/ChatEnd.module.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;  // ✅ 모달 닫기 이벤트 추가
    historyId: number | null;
};

function ChatEnd({ isOpen, onClose, historyId }: ModalProps) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    /* ✅ 채팅 다시 시작 (새로고침) */
    const restartChat = () => {
        window.location.href = "/chat/ai";
    };

    /* ✅ 종료 버튼 클릭 시 데이터 저장 후 /report 페이지로 이동 */
    const endChat = async () => {
        if (!historyId) {
            console.error("No historyId available to save chat history.");
            return;
        }

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            console.error("No access token found, please log in.");
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/chat/report/save", 
                { historyId }, 
                { headers: { access: accessToken } }
            );

            navigate("/report");
        } catch (error) {
            console.error("채팅이 저장이 안 됐습니다.");
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
                        [다른 대화 진행하기] 버튼을 클릭하면 새로운 키워드로 <br/> AI와 대화를 시작할 수 있습니다.
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
