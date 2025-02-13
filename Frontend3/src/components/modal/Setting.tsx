import styles from "./styles/Setting.module.scss";

import Mask1 from "@/assets/images/catMask_1.png"
import Mask2 from "@/assets/images/catMask_2.png"
import Mask3 from "@/assets/images/catMask_3.png"
import Mask4 from "@/assets/images/catMask_4.png"
import check from "@/assets/icons/check.png"

import Bg1 from "@/assets/images/setting_bg_1.jpg"
import Bg2 from "@/assets/images/setting_bg_2.jpg"
import Bg3 from "@/assets/images/setting_bg_3.jpg"

import { useState } from "react";


type ModalProps = {
  isOpen: boolean; // 모달 열림 상태
  onClose: () => void; // 닫기 버튼 클릭 이벤트
};

function Setting({ isOpen, onClose }: ModalProps) {
  const [selectedMask, setSelectedMask] = useState<string | null>("mask1");
  const [selectedBackground, setSelectedBackground] = useState<string | null>("bg1");

  if (!isOpen) return null;

  const handleMaskClick = (mask: string) => {
    setSelectedMask(prev => (prev === mask ? null : mask));
  };

  const handleBackgroundClick = (bg: string) => {
    setSelectedBackground(prev => (prev === bg ? null : bg));
    // setSelectedMask(null); // ✅ 필터 선택 해제
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.modal__header__title}>설정</p>
        <div className={styles.modal__contents}>
          <p className={styles.modal__sub}>가상배경</p>
          <div className={styles.modal__sub__wrap}>
            {/* Background 1 */}
            <div
              className={`${styles.back} ${selectedBackground === "bg1" ? styles.selected : ""}`}
              onClick={() => handleBackgroundClick("bg1")}
            >
              <img className={styles.back__img} src={Bg1} />
              {selectedBackground === "bg1" && (
                <>
                  <div className={styles.overlayEffect} />
                  <img src={check} className={styles.checkIcon} />
                </>
              )}
            </div>

            {/* Background 2 */}
            <div
              className={`${styles.back} ${selectedBackground === "bg2" ? styles.selected : ""}`}
              onClick={() => handleBackgroundClick("bg2")}
            >
              <img className={styles.back__img} src={Bg2} />
              {selectedBackground === "bg2" && (
                <>
                  <div className={styles.overlayEffect} />
                  <img src={check} className={styles.checkIcon} />
                </>
              )}
            </div>

            {/* Background 3 */}
            <div
              className={`${styles.back} ${selectedBackground === "bg3" ? styles.selected : ""}`}
              onClick={() => handleBackgroundClick("bg3")}
            >
              <img className={styles.back__img} src={Bg3} />
              {selectedBackground === "bg3" && (
                <>
                  <div className={styles.overlayEffect} />
                  <img src={check} className={styles.checkIcon} />
                </>
              )}
            </div>
          </div>

          <p className={styles.modal__sub}>필터</p>
          <div className={styles.modal__sub__wrap}>

            {/* Mask 1 */}
            <div
              className={`${styles.mask} ${selectedMask === "mask1" ? styles.selected : ""}`}
              onClick={() => handleMaskClick("mask1")}>
              <img src={Mask1} width="100px" height="90px" />
              {selectedMask === "mask1" && (
                <>
                  <div className={styles.overlayEffect} />
                  <img src={check} className={styles.checkIcon} />
                </>
              )}
            </div>

            {/* Mask 2 */}
            <div
              className={`${styles.mask} ${selectedMask === "mask2" ? styles.selected : ""}`}
              onClick={() => handleMaskClick("mask2")}>
              <img src={Mask2} width="100px" height="90px" />
              {selectedMask === "mask2" && (
                <>
                  <div className={styles.overlayEffect} />
                  <img src={check} className={styles.checkIcon} />
                </>
              )}
            </div>

            {/* Mask 3 */}
            <div
              className={`${styles.mask} ${selectedMask === "mask3" ? styles.selected : ""}`}
              onClick={() => handleMaskClick("mask3")}>
              <img src={Mask3} width="100px" height="90px" />
              {selectedMask === "mask3" && (
                <>
                  <div className={styles.overlayEffect} />
                  <img src={check} className={styles.checkIcon} />
                </>
              )}
            </div>

            {/* Mask 4 */}
            <div
              className={`${styles.mask} ${selectedMask === "mask4" ? styles.selected : ""}`}
              onClick={() => handleMaskClick("mask4")}>
              <img src={Mask4} width="100px" height="90px" />
              {selectedMask === "mask4" && (
                <>
                  <div className={styles.overlayEffect} />
                  <img src={check} className={styles.checkIcon} />
                </>
              )}
            </div>
          </div>
        </div>
        <div className={styles.modal__btn}>
          <div
            onClick={onClose}
            className={styles.modal__btn__cancle}>
            적용하기
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setting;
