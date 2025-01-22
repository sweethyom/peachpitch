import styles from './Header.module.scss'

import logoIcon from '../../assets/icons/logo.png'

function Header() {
    return (
        <div className={styles.header}>
            <div className={styles.header__logo}>
                <img src={logoIcon} alt='Logo' className={styles.header__logo__icon} />
                <span className={styles.header__logo__name}>PeachPitch</span>
            </div>

            <div className={styles.header__navi}>
                <span className={styles.header__navi__item}>report</span>
                <span className={styles.header__navi__item}>coupon</span>
                <span className={styles.header__navi__item}>login</span>
            </div>
        </div>
    )
}

export default Header