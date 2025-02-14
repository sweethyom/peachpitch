import { Link } from "react-router-dom";
import classNames from "classnames";
import { useState, useEffect, useRef } from "react";
import styles from "./Header.module.scss";

import logoIcon from "@/assets/icons/logo.png";
import CouponModal from "@/components/modal/Coupon";
import couponIcon from "@/assets/icons/coupon_icon.png";
import axios from "axios";

interface HeaderProps {
    isDark?: boolean;
    isGreen?: boolean;
    isPink?: boolean;
    isYellow?: boolean;
}

function Header({ isDark, isGreen, isPink, isYellow }: HeaderProps) {
    // const navigate = useNavigate();
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
        try {
            // ✅ 브라우저에서 refreshToken 가져오기
            const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
                const [name, value] = cookie.split("=");
                acc[name] = value;
                return acc;
            }, {} as Record<string, string>);

            const refreshToken = cookies["refresh"];

            if (!refreshToken) {
                console.error("🚨 Refresh token이 없습니다. 로그아웃 불가능.");
                return;
            }

            // ✅ 로그아웃 요청 (refreshToken을 헤더에 포함)
            await axios.post(
                "http://localhost:8080/api/users/logout",
                {},
                {
                    withCredentials: true, // ✅ 쿠키 자동 포함
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        "refresh": refreshToken, // ✅ refreshToken을 명시적으로 추가
                    },
                }
            );

            console.log("✅ 로그아웃 성공");

            // ✅ 로컬 스토리지 삭제
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userId");

            // ✅ 쿠키 삭제 (refresh 토큰 제거)
            document.cookie = "refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure;";

            // ✅ 로그인 페이지로 이동
            window.location.href = "/login";
        } catch (error) {
            console.error("❌ 로그아웃 실패:", error);
        }
    };


    // 쿠폰 확인
    const [couponCount, setCouponCount] = useState<number>(0);
    useEffect(() => {
        const fetchCouponCount = async () => {
            try {
                const storedUserId = localStorage.getItem("userId");

                if (!storedUserId) {
                    // console.error("User ID가 없습니다.");
                    return;
                }

                const response = await axios.get(`http://localhost:8080/api/users/coupon/${storedUserId}`);
                setCouponCount(response.data);
            } catch (error) {
                console.error("쿠폰 수 조회 실패:", error);
            }
        };

        fetchCouponCount();
    }, []);
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
                                <p className={styles.header__navi__item}>{couponCount}개</p>
                                {/* <p className={styles.header__navi__item}>1개</p> */}
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
