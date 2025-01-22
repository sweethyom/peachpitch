import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import LandingPage from '@pages/landing/landingPage';
import MainPage from '@pages/main/mainPage';
import LoginPage from '@pages/login/loginPage';
import VoiceChatPage from '@pages/chat/voiceChatPage';
import VideoChatPage from '@/pages/chat/videoChatPage';
import JoinPage from '@pages/login/joinPage';
import TotalReportPage from '@pages/report/totalReportPage';
import ChatReportPage from '@pages/report/chatReportPage';

import '@assets/styles/font.scss'

function App() {
    const location = useLocation();
    const isMainPage = location.pathname === '/main';
    const pageColor = isMainPage ? 'pageColor main-background' : 'pageColor';

    return (
        <div className={pageColor}>
          <div style={{ width: '1100px', margin: '0 auto' }}>
            <Routes>
                <Route index path="/index" element={<LandingPage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/join" element={<JoinPage />} />
                <Route path="/voice_chat" element={<VoiceChatPage />} />
                <Route path="/video_chat" element={<VideoChatPage />} />
                <Route path="/report" element={<TotalReportPage />} />
                <Route path="/report/detail" element={<ChatReportPage />} />
            </Routes>
            </div>
        </div>
    );
}

function RootApp() {
    return (
        <RecoilRoot>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </RecoilRoot>
    );
}

export default RootApp;
