import styles from './Footer.module.scss';

import classNames from 'classnames';
import { useEffect, useState } from 'react';

import AccountRemoveModal from '@/components/modal/AccountRemove'

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

  const [isRemoveOpen, setIsRemoveOpen] = useState(false); // 모달 열림 상태 관리

  const toggleRemove = () => {
    setIsRemoveOpen(!isRemoveOpen);
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // ✅ localStorage에서 accessToken 확인
    setIsLoggedIn(localStorage.getItem('accessToken') !== null);

    // ✅ storage 이벤트 감지하여 로그인 상태 업데이트
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('accessToken') !== null);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <>
      <footer className={footerClass}>
        <div className={styles.footer__content}>
          <div className={styles.footer__box}>
            <div className={styles.footer__logo}>
              <span className={styles.footer__logo__name}>PeachPitch</span>
              <p className={styles.footer__logo__description}>
                스몰톡을 연습하고 싶지만, 사람과의 직접적인 대화는 아직 부담스러운 사용자들을 위한 스피킹 티칭 서비스를 제공합니다.
              </p>
            </div>
            {/* {isLoggedIn && (
              <p onClick={toggleRemove} className={styles.footer__leave}>
                회원탈퇴
              </p>
            )} */}
          </div>
          <hr className={styles.footer__divider} />
          <div className={styles.footer__copyright}>
            Copyright ⓒ 2025 노 피카 킵고잉 x SSAFY
          </div>
        </div>
      </footer>

      {/* 회원탈퇴 모달 */}
      <AccountRemoveModal isOpen={isRemoveOpen} onClose={toggleRemove} />
    </>
  );
}

export default Footer;
