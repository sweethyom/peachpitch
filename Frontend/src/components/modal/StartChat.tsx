import styles from "./styles/StartChat.module.scss";
import closeBtn from "@/assets/icons/modal__close.png";
import couponIcon from "@/assets/images/coupon.png";

import RedAlert from '@/components/alert/redAlert';
import axios from "axios";
import { useState } from "react";

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

  const couponNum = Number(localStorage.getItem("couponNum")); // 문자열 → 숫자로 변환
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertF, _setShowAlertF] = useState(false);

  const handleStart = async () => {
    console.log("🟢 StartChat 모달 실행, isFinger:", isFinger, "couponNum:", couponNum);

    if (localStorage.getItem("userId") === null) {
      console.log("🚀 무료 체험 가능 (핑거프린트 없음)");

      try {
        // ✅ 핑거프린트 사용 기록을 서버에 저장
        const fingerprint = localStorage.getItem("fingerprint");
        if (fingerprint) {
          await axios.post('http://localhost:8080/api/chat/ai/use', {
            fingerprint: fingerprint,
          });
          console.log("핑거프린트 사용 기록 저장 완료");
        }
      } catch (error) {
        console.error("핑거프린트 사용 기록 저장 실패:", error);
      }

      onStart(); // ✅ AI 채팅 페이지로 이동
      return; // ✅ 쿠폰 개수 체크 X
    }

    // ✅ 로그인 사용자만 쿠폰 개수 체크
    if (couponNum <= 0) {
      setShowAlert(true);
      return;
    }

    onStart(); // ✅ 쿠폰이 있을 경우만 실행
  };




  if (!isOpen) return null;

  return (
    <>
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
            {localStorage.getItem("userId") != null ? (
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
            <div onClick={handleStart} className={styles.modal__btn__start}>시작하기</div>
          </div>
        </div>
      </div>

      {showAlert && (
        <div style={{ zIndex: 9999 }}>
          <RedAlert message="쿠폰이 없습니다. 충전해주세요." onClose={() => setShowAlert(false)} />
        </div>
      )}

      {showAlertF && (
        <div style={{ zIndex: 9999 }}>
          <RedAlert message="무료 이용권을 사용한 적이 있습니다. 로그인 후 이용해주세요." onClose={() => setShowAlert(false)} />
        </div>
      )}
    </>
  );
}

export default StartChat;
