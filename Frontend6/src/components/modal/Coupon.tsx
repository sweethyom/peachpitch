import { useState, useEffect } from "react";
import styles from "./styles/Coupon.module.scss";
import closeBtn from "@/assets/icons/modal__close.png";
import couponImg from "@/assets/images/coupon_img.png";

import RedAlert from "../alert/redAlert";
import GreenAlert from '@/components/alert/greenAlert';


type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

function Coupon({ isOpen, onClose }: ModalProps) {
    const [counts, setCounts] = useState([0, 0, 0]);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [greenAlertMessage, setGreenAlertMessage] = useState<string | null>(null);
    const prices = [1000, 3000, 5000];
    const totalPrice = counts.reduce((acc, count, index) => acc + count * prices[index], 0);
    const [hasReceivedCoupon, setHasReceivedCoupon] = useState<boolean>(false);

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

    useEffect(() => {
        const fetchCouponStatus = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) return;

            try {
                const response = await fetch(`https://peachpitch.site/api/users/coupon/status?userId=${userId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                const data = await response.json();
                setHasReceivedCoupon(data.data); // 서버에서 Boolean 값을 받음
            } catch (error) {
                console.error("🚨 무료 쿠폰 상태 확인 오류:", error);
            }
        };

        fetchCouponStatus();
    }, []);

    // ✅ 결제 완료 메시지를 감지하여 모달 닫기
    useEffect(() => {

        const handlePaymentMessage = (event: MessageEvent) => {
            console.log("📩 쿠폰 모달에서 결제 완료 메시지 수신:", event.data, "from:", event.origin);

            if (event.origin !== "https://peachpitch.site") return;

            if (event.data === "paymentSuccess") {
                onClose(); // ✅ 쿠폰 모달 닫기
            }
        };

        window.addEventListener("message", handlePaymentMessage);

        return () => {
            window.removeEventListener("message", handlePaymentMessage);
        };
    }, []);

    if (!isOpen) return null;


    const userId = localStorage.getItem("userId");
    const handlePayment = async () => {
        if (totalPrice === 0) {
            setAlertMessage("최소 1개 이상 선택해야 합니다!");
            return;
        }

        try {
            const response = await fetch("https://peachpitch.site/api/pay/ready", {
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

            if (!paymentWindow) {
                setAlertMessage("팝업 창이 차단되었습니다. 팝업 차단을 해제해주세요.");
                return;
            }

            // ✅ 팝업 창에서 결제 완료 메시지 수신 후 닫힘 감지
            window.addEventListener("message", (event) => {
                console.log("📩 결제 완료 메시지 수신:", event.data, "from:", event.origin);

                if (event.data === "paymentSuccess") {
                    if (paymentWindow) {
                        paymentWindow.close(); // ✅ 팝업 창 닫기
                    }
                }
            }, false);

        } catch (error) {
            console.error("🚨 결제 처리 오류:", error);
            setAlertMessage("결제 처리 중 문제가 발생했습니다.");
        }
    };

    // 무료 쿠폰 받기
    const handleFreeCoupon = async () => {
        const userId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("access"); // Assuming access token is stored

        if (!userId) {
            setAlertMessage("로그인이 필요합니다!");
            return;
        }

        try {
            const response = await fetch("https://peachpitch.site/api/users/coupon/login/free", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}` // Add access token if required
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error("무료 쿠폰 요청 실패");
            }

            // const data = await response.json();

            // ✅ 모달 닫기 및 메인 페이지 이동
            onClose();
            window.location.href = "/main"; // ✅ 이동 후 새로고침

            // ✅ 3초 후에 GreenAlert 메시지 표시
            setTimeout(() => {
                setGreenAlertMessage("무료 쿠폰이 지급되었습니다!");
            }, 3000);
        } catch (error) {
            console.error("🚨 쿠폰 요청 오류:", error);
            setAlertMessage("무료 쿠폰 요청 중 문제가 발생했습니다.");
        }
    };



    return (
        <>
            {alertMessage && <RedAlert message={alertMessage} onClose={() => setAlertMessage(null)} />}
            {greenAlertMessage && <GreenAlert message={greenAlertMessage} onClose={() => setGreenAlertMessage(null)} />}


            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.modal__header}>
                        <img src={closeBtn} className={styles.modal__header__close} onClick={onClose} />
                        <p className={styles.modal__header__logo}>PeachPitch</p>
                    </div>
                    <p className={styles.modal__header__title}>이용권 구매</p>
                    {!hasReceivedCoupon && (
                        <div className={styles.free} onClick={handleFreeCoupon}>
                            AI 무료 쿠폰 받기
                        </div>
                    )}

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
