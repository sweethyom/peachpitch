import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import ScrollToTop from "@/components/ScrollToTop";

import LandingPage from '@pages/landing/landingPage';
import MainPage from '@pages/main/mainPage';
import LoginPage from '@pages/login/loginPage';
import VoiceChatPage from '@pages/chat/voiceChatPage';
import VideoChatPage from '@/pages/chat/videoChatPage.tsx';
// import VideoChatPage from '@/pages/chat/openviduChatPage.tsx';
import JoinPage from '@pages/login/joinPage';
import TotalReportPage from '@pages/report/totalReportPage';
import ChatReportPage from '@pages/report/chatReportPage';
import SocialLoginProccessPage from '@pages/login/socialLoginProcessPage';

import '@assets/styles/font.scss'

function App() {
    return (
        <RecoilRoot>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    <Route index path="/" element={<LandingPage />} />
                    <Route path="/main" element={<MainPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/login/social/process" element={<SocialLoginProccessPage />} />
                    <Route path="/join" element={<JoinPage />} />
                    <Route path="/chat/ai" element={<VoiceChatPage />} />
                    <Route path="/chat/video" element={<VideoChatPage />} />
                    <Route path="/report" element={<TotalReportPage />} />
                    <Route path="/report/detail/:reportId" element={<ChatReportPage />} />
                </Routes>
            </BrowserRouter>
        </RecoilRoot>
    );
}


export default App;
