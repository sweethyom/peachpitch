import { Link } from "react-router-dom";
import classNames from "classnames";
import { useState } from "react";
import styles from "./Header.module.scss";

import logoIcon from "@/assets/icons/logo.png";
import CouponModal from "@/components/modal/Coupon";
import couponIcon from '@/assets/icons/coupon_icon.png'

interface HeaderProps {
    isDark?: boolean;
    isGreen?: boolean;
    isPink?: boolean;
    isYellow?: boolean;
}

function Header({ isDark, isGreen, isPink, isYellow }: HeaderProps) {
    // 동적으로 클래스를 생성
    const headerClass = classNames(styles.header, {
        [styles.headerDark]: isDark,
        [styles.headerGreen]: isGreen,
        [styles.headerPink]: isPink,
        [styles.headerYellow]: isYellow,
    });

    const [isCouponOpen, setIsCouponOpen] = useState(false); // 모달 열림 상태 관리

    const toggleCoupon = () => {
        setIsCouponOpen(!isCouponOpen);
    };

    return (
        <div className={headerClass}>
            <div className={styles.header__content}>
                <Link to="/main">
                    <div className={styles.header__logo}>
                        <img src={logoIcon} alt="Logo" className={styles.header__logo__icon} />
                        <span className={styles.header__logo__name}>PeachPitch</span>
                    </div>
                </Link>

                <div className={styles.header__navi}>
                    <Link to="/report">
                        <span className={styles.header__navi__item}>report</span>
                    </Link>

                    <div
                        className={styles.header__navi__coupon}
                        onClick={toggleCoupon}
                        style={{ cursor: "pointer" }}>
                        <img src={couponIcon} width={'30px'} />
                        <p className={styles.header__navi__item}>1개</p>
                    </div>

                    <Link to="/login">
                        <span className={styles.header__navi__item}>login</span>
                    </Link>
                </div>
            </div>

            {/* 쿠폰 모달 */}
            <CouponModal isOpen={isCouponOpen} onClose={toggleCoupon} />
        </div>
    );
}

export default Header;
