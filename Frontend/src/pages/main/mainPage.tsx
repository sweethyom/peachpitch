import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

import styles from './styles/main.module.scss';

const MainPage: React.FC = () => {
  return (
    <>
      <Header isDark={true} />
      <div className={styles.page}>
        <p>main Page</p>
        <h4>메인인페이지</h4>
      </div>
      <Footer isDark={true} />
    </>
  );
};

export default MainPage;
