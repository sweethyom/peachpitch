import styles from "./styles/Remove.module.scss";

import closeBtn from "@/assets/icons/modal__close.png";
import warnIcon from "@/assets/icons/modal_warn.png"
import axios from "axios";
import { useNavigate } from "react-router-dom";

type ModalProps = {
    isOpen: boolean; // 모달 열림 상태
    onClose: () => void; // 닫기 버튼 클릭 이벤트
};

function AccountRemove({ isOpen, onClose }: ModalProps) {

    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleAccountRemove = async () => {
        try {
            const response = await axios.post("https://peachpitch.site/api/users/delete", {}, {
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
            });
    
            console.log("회원 탈퇴 성공:", response.data);
    
            // ✅ 탈퇴 후 로컬 스토리지 삭제
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userId");
    
            // ✅ 로그아웃과 동일하게 쿠키 삭제
            document.cookie = "refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure;";
    
            // ✅ 로그인 페이지로 이동
            navigate("/login");
            window.dispatchEvent(new Event("storage"));
        } catch (error) {
            console.error("회원 탈퇴 실패:", error);
        }
    };
    


    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <img src={closeBtn} className={styles.modal__header__close} onClick={onClose} />
                    <p className={styles.modal__header__logo}>PeachPitch</p>
                </div>
                <p className={styles.modal__header__title}>회원 탈퇴</p>
                <div className={styles.modal__contents}>
                    <img src={warnIcon} width={'109px'} height={'103px'} />
                    <p className={styles.modal__sub}>정말 탈퇴하시겠어요?</p>
                    <p className={styles.modal__sub__red}>회원 탈퇴 시 기존의 데이터를 복구할 수 없습니다.</p>

                </div>
                <div className={styles.modal__btn}>
                    <div
                        onClick={onClose}
                        className={styles.modal__btn__cancle}>
                        취소하기
                    </div>
                    <div
                        onClick={handleAccountRemove}
                        className={styles.modal__btn__remove}>탈퇴하기</div>
                </div>
            </div>
        </div>
    );
}

export default AccountRemove;
