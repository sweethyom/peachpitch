import styles from './Footer.module.scss';

import logoIcon from '../../assets/icons/logo.png';
import classNames from 'classnames';

interface FooterProps {
  isDark?: boolean;
  isGreen?: boolean;
  isPink?: boolean;
  isYellow?: boolean;
}

function Footer({ isDark, isGreen, isPink, isYellow }: FooterProps) {
  // 동적으로 클래스를 생성
  const footerClass = classNames(styles.footer, {
    [styles.footerDark]: isDark,
    [styles.footerGreen]: isGreen,
    [styles.footerPink]: isPink,
    [styles.footerYellow]: isYellow,
  });

  return (
    <footer className={footerClass}>
      <div className={styles.footer__content}>
        <div className={styles.footer__box}>
          <div className={styles.footer__logo}>
            {/* <img src={logoIcon} alt="Logo" className={styles.footer__logo__icon} /> */}
            <span className={styles.footer__logo__name}>PeachPitch</span>
            <p className={styles.footer__logo__description}>
              스몰톡을 연습하고 싶지만, 사람과의 직접적인 대화는 아직 부담스러운 사용자들을 위한 스피킹 티칭 서비스를 제공합니다.
            </p>
          </div>
          <p className={styles.footer__leave}>회원탈퇴</p>
        </div>
        <hr className={styles.footer__divider} />
        <div className={styles.footer__copyright}>
          Copyright ⓒ 2025 노 피카 킵고잉 x SSAFY
        </div>
      </div>
    </footer>
  );
}

export default Footer;
