import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import styles from './Header.module.scss';

import logoIcon from '../../assets/icons/logo-dark.png';

interface HeaderProps {
    isDark?: boolean;
    isGreen?: boolean;
    isPink?: boolean;
    isYellow?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isDark, isGreen, isPink, isYellow }) => {
    // 동적으로 클래스를 생성
    const headerClass = classNames(styles.header, {
        [styles.headerDark]: isDark,
        [styles.headerGreen]: isGreen,
        [styles.headerPink]: isPink,
        [styles.headerYellow]: isYellow,
    });

    return (
        <div className={headerClass}>
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
                <span className={styles.header__navi__item}>coupon</span>
                <Link to="/login">
                    <span className={styles.header__navi__item}>login</span>
                </Link>
            </div>
        </div>
    );
};

export default Header;
