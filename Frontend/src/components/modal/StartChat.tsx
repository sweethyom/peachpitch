import styles from "./styles/StartChat.module.scss";
import closeBtn from "@/assets/icons/modal__close.png";
import couponIcon from "@/assets/images/coupon.png";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  isFinger: boolean;
  children?: React.ReactNode;
};

function StartChat({ isOpen, onClose, onStart, isFinger, children }: ModalProps) {
  const handleCancel = () => {
    window.dispatchEvent(new Event("chatModalCancelled")); // Dispatch an event
    onClose(); // Close modal
  };

  // const handleStart = () => {
  //   if (!isFinger) {
  //     window.alert("이미 무료로 이용한 적이 있습니다. 로그인 후 이용해주세요.");
  //     return;
  //   }
  //   onStart();
  // };  
  
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
          {!isFinger || localStorage.getItem("userId") != null ? (
            <p className={styles.modal__sub__red}>[시작하기] 버튼을 누르면 쿠폰이 -1 차감됩니다.</p>
          ) : (
            <>
              <p className={styles.modal__sub__red}>
                <strong>! 현재 로그인하지 않은 상태입니다. !</strong> </p>
              <p className={styles.modal__sub__red}>
                AI 스몰토크는 비로그인 사용자에게 최초 1회 무료로 제공되며 </p>
              <p className={styles.modal__sub__red}>
                이 경우, 리포트가 저장되지 않습니다.
              </p>
            </>
          )}
        </div>
        {children}
        <div className={styles.modal__btn}>
          <div onClick={handleCancel} className={styles.modal__btn__cancle}>취소하기</div>
          <div onClick={onStart} className={styles.modal__btn__start}>시작하기</div>
        </div>
      </div>
    </div>
  );
}

export default StartChat;
