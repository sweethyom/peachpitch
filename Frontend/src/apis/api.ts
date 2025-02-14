import axios from 'axios';

// ✅ Axios 인스턴스 생성 (토큰 자동 추가)
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 요청 인터셉터 추가 (토큰 포함)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;


// import axios from "axios";

// const api = axios.create({
//   baseURL: "/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true, // ✅ 쿠키 포함
// });
// const accessToken = localStorage.getItem("accessToken");
// // ✅ 요청 인터셉터 (API 요청 전에 accessToken 자동 추가)
// api.interceptors.request.use(
//   (config) => {

//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ✅ 응답 인터셉터 (Access Token이 만료되었을 때 자동 재발급)
// api.interceptors.response.use(
//   (response) => response, // 정상 응답은 그대로 반환
//   async (error) => {
//     const originalRequest = error.config;

//     // ✅ 401 Unauthorized (Access Token 만료)
//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true; // ✅ 무한 루프 방지

//       try {
//         // ✅ Refresh Token 가져오기
//         const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
//           const [name, value] = cookie.split("=");
//           acc[name] = value;
//           return acc;
//         }, {} as Record<string, string>);

//         const refreshToken = cookies["refresh"];
//         if (!refreshToken) {
//           console.error("🚨 Refresh token이 없습니다.");
//           window.location.href = "/login"; // 로그인 페이지로 이동
//           return Promise.reject(error);
//         }

//         // ✅ Access Token 재발급 요청
//         const res = await axios.post("/api/users/reissue", {}, {
//           withCredentials: true,
//           headers: {
//             access: accessToken,
//             Cookie: `refresh=${refreshToken}`,
//           },
//         });

//         const newAccessToken = res.data.accessToken; // ✅ 새 토큰 받아오기
//         localStorage.setItem("accessToken", newAccessToken); // ✅ 새 토큰 저장

//         // ✅ 기존 요청 헤더에 새 토큰 추가 후 재시도
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } catch (reissueError) {
//         console.error("❌ 토큰 재발급 실패:", reissueError);
//         localStorage.removeItem("accessToken"); // ✅ 만료된 토큰 삭제
//         window.location.href = "/login"; // ✅ 로그인 페이지로 리디렉트
//         return Promise.reject(reissueError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;
