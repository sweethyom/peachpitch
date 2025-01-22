import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

// 페이지 컴포넌트
import LandingPage from '@pages/landing/landingPage';
import MainPage from '@pages/main/mainPage';
import LoginPage from '@pages/login/loginPage';
import VoiceChatPage from '@pages/chat/voiceChatPage';
import VideoChatPage from '@/pages/chat/videoChatPage';
import JoinPage from '@pages/login/joinPage';
import TotalReportPage from '@pages/report/totalReportPage';
import ChatReportPage from '@pages/report/chatReportPage';


import '@assets/styles/font.scss'; // Pretendard 폰트 SCSS 추가

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <div className="container">
          <Routes>
            <Route index path="/" element={<LandingPage />} />
            <Route index path="/main" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/chat" element={<VoiceChatPage />} />
            <Route path="/chat" element={<VideoChatPage />} />
            <Route path="/chat" element={<TotalReportPage />} />
            <Route path="/chat" element={<ChatReportPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
