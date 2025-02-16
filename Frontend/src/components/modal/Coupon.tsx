import { useState, useEffect } from "react";
import styles from "./styles/Coupon.module.scss";
import closeBtn from "@/assets/icons/modal__close.png";
import couponImg from "@/assets/images/coupon_img.png";

import RedAlert from "../alert/redAlert";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

function Coupon({ isOpen, onClose }: ModalProps) {
    const [counts, setCounts] = useState([0, 0, 0]);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const prices = [1000, 3000, 5000];
    const totalPrice = counts.reduce((acc, count, index) => acc + count * prices[index], 0);
    const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);

    const increment = (index: number) => {
        setCounts((prevCounts) =>
            prevCounts.map((count, i) => (i === index ? count + 1 : count))
        );
    };

    const decrement = (index: number) => {
        setCounts((prevCounts) =>
            prevCounts.map((count, i) => (i === index && count > 0 ? count - 1 : count))
        );
    };

    window.addEventListener("message", (event) => {
        console.log("📩 메시지 수신:", event.data, "from:", event.origin);
    
        if (event.origin !== "http://localhost:8080") {
            console.warn("❌ 허용되지 않은 출처의 메시지입니다.");
            return; // 잘못된 origin이면 메시지 무시
        }
    
        if (event.data === "paymentSuccess") {
            console.log("✅ 결제 성공 메시지 처리");
            // 원하는 동작 수행
        }
    }, false);

    // ✅ 결제 완료 메시지를 감지하여 모달 닫기
    useEffect(() => {

        const handlePaymentMessage = (event: MessageEvent) => {
            console.log("📩  :", event.data, "from:", event.origin);

            if (event.origin !== "http://localhost:8080") {
                console.warn("알림: 예상치 못한 출처에서 메시지가 왔습니다:", event.origin);
                return;
            }

            if (event.data?.status === "paymentSuccess") {
                if (paymentWindow) {
                  paymentWindow.close();
                }
                // 결제 완료 후 처리
                // onPaymentComplete();
                console.log("결제 완료 후 처리")
              }
            };
            
            window.addEventListener("message", handlePaymentMessage);
            return () => window.removeEventListener("message", handlePaymentMessage);
          }, [paymentWindow]);

    if (!isOpen) return null;

    // useEffect(() => {

    //     const handlePaymentMessage = (event: MessageEvent) => {
    //         console.log("📩 쿠폰 모달에서 결제 완료 메시지 수신:", event.data, "from:", event.origin);

    //         // 신뢰할 수 있는 origin에서 메시지가 왔는지 확인
    //         if (event.origin !== "http://localhost:8080") {
    //             console.warn("알림: 예상치 못한 출처에서 메시지가 왔습니다:", event.origin);
    //             return;
    //         }

    //         // 결제 완료 메시지가 올 경우 처리
    //         if (event.data === "paymentSuccess") {
    //             console.log("결제가 성공적으로 완료되었습니다.");
    //             onClose(); // ✅ 쿠폰 모달 닫기
    //         }
    //     };

    //     console.log("handlePaymentMessage 등록");
    //     window.addEventListener("message", handlePaymentMessage);

    //     // 컴포넌트 언마운트 시 이벤트 리스너 해제
    //     return () => {
    //         console.log("handlePaymentMessage 등록 해제");
    //         window.removeEventListener("message", handlePaymentMessage);
    //     };
    // }, [onClose]);

    // // 모달이 열려 있지 않으면 null 반환
    // if (!isOpen){
    //     console.log("!isOpen")
    //     return null;
    // } 


    const userId = localStorage.getItem("userId");
    const handlePayment = async () => {
        if (totalPrice === 0) {
            setAlertMessage("최소 1개 이상 선택해야 합니다!");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/pay/ready", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // item: { name: "이용권" },
                    userId: userId,
                    itemName: "이용권", 
                    totalPrice: totalPrice,
                    ea: counts.reduce((acc, count, index) => acc + count * ((index * 2) + 1), 0),
                }),
            });

            const data = await response.json();
            localStorage.setItem("tid", data.tid); // ✅ tid 저장

            // ✅ 카카오페이 결제 페이지로 이동 (팝업)
            const paymentWindow = window.open(data.next_redirect_pc_url, "kakaopay", "width=500,height=700");

            if (paymentWindow) {
                console.log("paymentWindow 세팅")
                setPaymentWindow(paymentWindow);
              }
            else {
                setAlertMessage("팝업 창이 차단되었습니다. 팝업 차단을 해제해주세요.");
                return;
            }

            // ✅ 팝업 창에서 결제 완료 메시지 수신 후 닫힘 감지
            window.addEventListener("message", (event) => {
                console.log("📩 결제 완료 메시지 수신:", event.data, "from:", event.origin);

                if (event.data === "paymentSuccess") {
                    if (paymentWindow) {
                        console.log("팝업창 닫기 완료")
                        paymentWindow.close(); // ✅ 팝업 창 닫기
                    }
                }
            }, false);

            window.addEventListener("storage", (event) => {
                if (event.key === "paymentStatus" && event.newValue !== null) {
                    try {
                        const paymentData = JSON.parse(event.newValue);
                        console.log("결제 완료 메시지 감지:", paymentData);
                        localStorage.removeItem("paymentStatus"); // 데이터 삭제
                    } catch (error) {
                        console.error("JSON 파싱 오류:", error);
                    }
                }
            });
            

        } catch (error) {
            console.error("🚨 결제 처리 오류:", error);
            setAlertMessage("결제 처리 중 문제가 발생했습니다.");
        }
    };

    // 무료 쿠폰 받기
    // const handleFreeCoupon = async () => {
    //     try {
    //         const response = await fetch("https://peachpitch.site/api/users/coupon/login/2", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //         });
    
    //         if (!response.ok) {
    //             throw new Error("쿠폰 요청 실패");
    //         }
    
    //         const data = await response.json();
    //         alert("무료 쿠폰이 지급되었습니다!"); // 성공 메시지
    //     } catch (error) {
    //         console.error("🚨 쿠폰 요청 오류:", error);
    //         setAlertMessage("무료 쿠폰 요청 중 문제가 발생했습니다.");
    //     }
    // };
    
    return (
        <>
            {alertMessage && <RedAlert message={alertMessage} onClose={() => setAlertMessage(null)} />}

            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.modal__header}>
                        <img src={closeBtn} className={styles.modal__header__close} onClick={onClose} />
                        <p className={styles.modal__header__logo}>PeachPitch</p>
                    </div>
                    <p className={styles.modal__header__title}>이용권 구매</p>
                    <div className={styles.free}>
                        AI 무료 쿠폰 받기
                    </div>
                    <div className={styles.modal__contents}>
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className={styles.modal__contents__item}>
                                <img src={couponImg} width={"210px"} />
                                <p className={styles.modal__contents__label}>
                                    AI와 스몰토킹 {(index * 2) + 1}회권
                                </p>
                                <p className={styles.modal__contents__label}>{(index * 2) + 1},000원</p>
                                <div className={styles.modal__count}>
                                    <button className={styles.modal__count__btn} onClick={() => increment(index)}>
                                        +
                                    </button>
                                    <p id={`count_item${index + 1}`} className={styles.modal__count__label}>
                                        {counts[index]}
                                    </p>
                                    <button className={styles.modal__count__btn} onClick={() => decrement(index)}>
                                        -
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.modal__price}>
                        <div className={styles.modal__price__wrapper}>
                            <p className={styles.modal__price__label}>총</p>
                            <p className={styles.modal__price__total}>{totalPrice.toLocaleString()}</p>
                            <p className={styles.modal__price__label}>원</p>
                        </div>
                        <button className={styles.modal__price__btn} onClick={handlePayment}>
                            구매하기
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Coupon;
