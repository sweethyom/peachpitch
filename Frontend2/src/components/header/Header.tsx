import { Link, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { useState, useEffect, useRef } from "react";
import styles from "./Header.module.scss";

import logoIcon from "@/assets/icons/logo.png";
import CouponModal from "@/components/modal/Coupon";
import couponIcon from "@/assets/icons/coupon_icon.png";

interface HeaderProps {
    isDark?: boolean;
    isGreen?: boolean;
    isPink?: boolean;
    isYellow?: boolean;
}

function Header({ isDark, isGreen, isPink, isYellow }: HeaderProps) {
    const navigate = useNavigate();
    const headerClass = classNames(styles.header, {
        [styles.headerDark]: isDark,
        [styles.headerGreen]: isGreen,
        [styles.headerPink]: isPink,
        [styles.headerYellow]: isYellow,
    });

    const [isCouponOpen, setIsCouponOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const userRef = useRef<HTMLSpanElement>(null); // ✅ 아이디 크기 가져오기 위한 ref
    const [dropdownWidth, setDropdownWidth] = useState(100);

    // ✅ 로그인 상태 확인 함수
    const checkLoginStatus = () => {
        const token = localStorage.getItem("accessToken");
        const email = localStorage.getItem("userEmail");

        if (token && email) {
            setIsLoggedIn(true);
            // const email = localStorage.getItem("userEmail");
            // setUserId(email ? email.split("@")[0] : null);
            setUserId(email.includes("@") ? email.split("@")[0] : email);
        } else {
            setIsLoggedIn(false);
            setUserId(null);
        }
    };

    useEffect(() => {
        checkLoginStatus();
        window.addEventListener("storage", checkLoginStatus);

        return () => {
            window.removeEventListener("storage", checkLoginStatus);
        };
    }, [isLoggedIn]);


    // ✅ 아이디 크기를 가져와서 모달창 너비 설정 (최소 130px)
    useEffect(() => {
        if (userRef.current) {
            const calculatedWidth = userRef.current.offsetWidth;
            setDropdownWidth(calculatedWidth < 100 ? 100 : calculatedWidth); // ✅ 최소 너비 130px 적용
        }
    }, [userId, isDropdownOpen]);

    // ✅ 로그아웃 처리
    const handleLogout = async () => {
        await fetch("https://peachpitch.site/api/users/logout", {
            method: "POST",
            credentials: "include",
        });

        document.cookie = "refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userId");
        setIsLoggedIn(false);
        setUserId(null);
        navigate("/login");
        window.dispatchEvent(new Event("storage"));
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
                    {isLoggedIn ? (
                        <>
                            <Link
                                to="/report"
                                onClick={() => (document.body.style.backgroundColor = 'var(--color-white-000)')}
                            >
                                <span className={styles.header__navi__item}>report</span>
                            </Link>

                            <div className={styles.header__navi__coupon} onClick={() => setIsCouponOpen(true)}>
                                <img src={couponIcon} width={"30px"} />
                                <p className={styles.header__navi__item}>1개</p>
                            </div>

                            {/* ✅ 아이디 클릭 시 드롭다운 모달 열기 */}
                            <div className={styles.header__user}>
                                <span
                                    ref={userRef} // ✅ 아이디 크기를 가져오기 위한 ref 설정
                                    className={styles.header__navi__item}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    style={{ cursor: "pointer" }}
                                >
                                    {userId}
                                </span>

                                {/* ✅ 작은 모달창 (로그아웃 버튼) */}
                                {isDropdownOpen && (
                                    <div
                                        onClick={() => (document.body.style.backgroundColor = 'var(--color-white-000)')}
                                        className={styles.header__dropdown}
                                        style={{ width: `${dropdownWidth}px` }} // ✅ 아이디 너비와 동일하게 설정
                                    >
                                        <div
                                            onClick={handleLogout}
                                            className={styles.header__logout}>
                                            로그아웃
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => (document.body.style.backgroundColor = 'var(--color-white-000)')}>
                            <span className={styles.header__navi__item}>login</span>
                        </Link>
                    )}
                </div>
            </div>

            <CouponModal isOpen={isCouponOpen} onClose={() => setIsCouponOpen(false)} />
        </div>
    );
}

export default Header;
