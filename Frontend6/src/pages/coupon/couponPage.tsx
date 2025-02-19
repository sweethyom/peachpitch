import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles/Coupon.module.scss";
// import closeBtn from "@/assets/icons/modal__close.png";
import couponImg from "@/assets/images/coupon_img.png";
import RedAlert from '@/components/alert/redAlert';

// type ModalProps = {
//     onUpdateCoupon: () => void;
// };

function CouponPage() {
    const [counts, setCounts] = useState([0, 0, 0]);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const prices = [1000, 3000, 5000];
    const totalPrice = counts.reduce((acc, count, index) => acc + count * prices[index], 0);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

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
    const handlePayment = async () => {
        if (totalPrice === 0) {
            setAlertMessage("최소 1개 이상 선택해야 합니다!");
            return;
        }

        try {
            // 카카오페이 결제 준비 요청
            const response = await fetch("https://peachpitch.site/api/pay/ready", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: localStorage.getItem("userId"),
                    itemName: "이용권",
                    totalPrice,
                    ea: counts.reduce((acc, count, index) => acc + count * ((index * 2) + 1), 0),
                }),
            });

            const data = await response.json();

            // 카카오페이 결제 팝업 열기
            const popup = window.open(data.next_redirect_pc_url, "_blank", "width=500,height=700");

            if (!popup) {
                alert("팝업 차단이 발생했습니다. 브라우저 설정을 확인해주세요.");
                return;
            }

            // 팝업 상태 확인
            const checkPopup = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkPopup); // 팝업 닫힘 감지 시 Interval 정리
                    console.log("팝업이 닫혔습니다.");
                    // onUpdateCoupon();
                    navigate("/payment/success"); // 결제 성공 페이지로 이동
                }
            }, 500);
        } catch (error) {
            console.error("🚨 결제 처리 오류:", error);
            setAlertMessage("결제 처리 중 문제가 발생했습니다.");
        }
    };

    // 무료 쿠폰 받기
    const handleFreeCoupon = async () => {
        try {
            // const response = await fetch("https://peachpitch.site/api/users/coupon/login/free", {
            const response = await fetch("https://peachpitch.site/api/users/coupon/login/free", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId
                })
            });

            if (!response.ok) {
                alert("이미 무료쿠폰이 발급되었습니다!")
                throw new Error("쿠폰 요청 실패");
            }

            console.log(response);

            // const data = await response.json();
            alert("무료 쿠폰이 발급되었습니다!");
            // onUpdateCoupon(); // 쿠폰 개수 갱신
        } catch (error) {
            console.error("🚨 쿠폰 요청 오류:", error);
            setAlertMessage("무료 쿠폰 요청 중 문제가 발생했습니다.");
        }
    };
    return (
        <>

            {alertMessage && <RedAlert message={alertMessage} onClose={() => setAlertMessage(null)} />}
            <div className={styles.page}>
                <div className={styles.close}>
                    <Link to="/main">
                        <div className={styles.close__wrap}>
                            뒤로가기
                        </div>
                    </Link>
                </div>
                <div className={styles.modal}>

                    <div className={styles.modal__header}>
                        {/* <img src={closeBtn} className={styles.modal__header__close} onClick={onClose} /> */}
                        {/* <p className={styles.modal__header__logo}>PeachPitch</p> */}
                    </div>
                    <p className={styles.modal__header__title}>이용권 구매</p>
                    {/* {!hasReceivedCoupon && (
                    <div className={styles.free} onClick={handleFreeCoupon}>
                        AI 무료 쿠폰 받기
                    </div>
                )} */}

                    <div onClick={handleFreeCoupon} className={styles.free}>
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

export default CouponPage;
