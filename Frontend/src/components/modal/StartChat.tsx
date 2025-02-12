import styles from "./styles/StartChat.module.scss";
import closeBtn from "@/assets/icons/modal__close.png";
import couponIcon from "@/assets/images/coupon.png";

 type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  children?: React.ReactNode;
};

function StartChat({ isOpen, onClose, onStart, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modal__header}>
          <img src={closeBtn} className={styles.modal__header__close} onClick={onClose} />
          {/* <p className={styles.modal__header__logo}>PeachPitch</p> */}
        </div>
        <p className={styles.modal__header__title}>AI 대화하기</p>
        <div className={styles.modal__contents}>
          <p className={styles.modal__sub}>AI와 대화하겠습니까?</p>
          <img src={couponIcon} width={"141px"} height={"165px"} />
          <p className={styles.modal__sub__red}>[시작하기] 버튼을 누르면 쿠폰이 -1 차감됩니다.</p>
        </div>
        {children}
        <div className={styles.modal__btn}>
          <div onClick={onClose} className={styles.modal__btn__cancle}>취소하기</div>
          <div onClick={onStart} className={styles.modal__btn__start}>시작하기</div>
        </div>
      </div>
    </div>
  );
}

export default StartChat;
