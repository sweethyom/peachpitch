import styles from "./styles/Leave.module.scss";
import closeBtn from "@/assets/icons/modal__close.png";
import warnIcon from "@/assets/icons/modal_warn.png";
import { useNavigate } from "react-router-dom";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    stopTTS: () => void; // ✅ VoiceChatPage에서 전달받음
};

function RoomLeave({ isOpen, onClose, stopTTS }: ModalProps) {
    const navigate = useNavigate();

    // ✅ 종료하기 버튼 클릭 시 실행
    const handleExit = () => {
        stopTTS(); // ✅ VoiceChatPage에서 전달받은 stopTTS 실행
        navigate('/main'); // ✅ 즉시 페이지 이동
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <img src={closeBtn} className={styles.modal__header__close} onClick={onClose} />
                    <p className={styles.modal__header__logo}>PeachPitch</p>
                </div>
                <p className={styles.modal__header__title}>대화 나가기</p>
                <div className={styles.modal__contents}>
                    <img src={warnIcon} width={'109px'} height={'103px'} />
                    <p className={styles.modal__sub}>대화를 종료 하시겠습니까?</p>
                    <p className={styles.modal__sub__red}>지금 대화를 종료하면 대화 리포트가 생성되지 않습니다.</p>
                </div>
                <div className={styles.modal__btn}>
                    <div onClick={onClose} className={styles.modal__btn__cancle}>
                        대화 계속하기
                    </div>
                    <div className={styles.modal__btn__leave} onClick={handleExit}>
                        종료하기
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomLeave;
