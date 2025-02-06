import { useState } from "react";
import styles from "./styles/Coupon.module.scss";

import closeBtn from "@/assets/icons/modal__close.png";
import couponImg from "@/assets/images/coupon_img.png";

type ModalProps = {
    isOpen: boolean; // 모달 열림 상태
    onClose: () => void; // 닫기 버튼 클릭 이벤트
};

function Coupon({ isOpen, onClose }: ModalProps) {
    const [counts, setCounts] = useState([0, 0, 0]); // 아이템 개수 배열로 관리
    const prices = [1000, 3000, 5000]; // 각 아이템의 가격
    const totalPrice = counts.reduce((acc, count, index) => acc + count * prices[index], 0); // 총 금액 계산

    // 증가 버튼 클릭 이벤트
    const increment = (index: number) => {
        setCounts((prevCounts) =>
            prevCounts.map((count, i) => (i === index ? count + 1 : count))
        );
    };

    // 감소 버튼 클릭 이벤트
    const decrement = (index: number) => {
        setCounts((prevCounts) =>
            prevCounts.map((count, i) => (i === index && count > 0 ? count - 1 : count))
        );
    };

    if (!isOpen) return null;
    // 결제 처리 함수
    const handlePayment = async () => {
        try {
            // counts 배열의 합계 계산
            const totalCount = counts.reduce((acc, count, index) => {
                const usage = (index * 2) + 1;  // 1회권, 3회권, 5회권
                return acc + (count * usage);
            }, 0);

            console.log('결제 요청 시작');
            const response = await fetch('http://localhost:8080/api/pay/ready', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'  // Content-Type 헤더 명시적 설정
                },
                body: JSON.stringify({
                    item: {
                        name: "이용권",
                    },
                    totalPrice: totalPrice,
                    ea: totalCount
                })
            });

            console.log('응답 상태:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('응답 데이터:', data);

            window.location.href = data.next_redirect_pc_url;
        } catch (error) {
            console.error('상세 에러:', error);
            alert('결제 처리 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <img src={closeBtn} className={styles.modal__header__close} onClick={onClose}/>
                    <p className={styles.modal__header__logo}>PeachPitch</p>
                </div>
                <p className={styles.modal__header__title}>이용권 구매</p>

                {/* 이용권 아이템들 */}
                <div className={styles.modal__contents}>
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className={styles.modal__contents__item}>
                            <img src={couponImg} width={"210px"}/>
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

                {/* 총 금액 표시 */}
                <div className={styles.modal__price}>
                    <div className={styles.modal__price__wrapper}>
                        <p className={styles.modal__price__label}>총</p>
                        <p className={styles.modal__price__total}>{totalPrice.toLocaleString()}</p>
                        <p className={styles.modal__price__label}>원</p>
                    </div>
                    <button
                        className={styles.modal__price__btn}
                        onClick={handlePayment}
                    >
                        구매하기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Coupon;
