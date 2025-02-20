import { useState, useEffect } from "react";

type VideoProps = {
  videoSrc: string[]; // 비디오 URL 배열
  currentIndex: number | null; // 현재 재생 중인 비디오의 인덱스
};

const VideoComponent: React.FC<VideoProps> = ({ videoSrc, currentIndex }) => {
  const [videoStack, setVideoStack] = useState<string[]>(videoSrc); // 비디오 스택 관리
  const [isNewVideoLoaded, setIsNewVideoLoaded] = useState(false);

  useEffect(() => {
    if (currentIndex !== null && currentIndex >= 0 && currentIndex < videoSrc.length) {
      const nextVideo = videoSrc[currentIndex]; // 다음 비디오 URL 가져오기
      console.log(`새로운 비디오 로드: ${nextVideo}`);

      // 새로운 비디오를 미리 로드
      const videoPreloader = document.createElement("video");
      videoPreloader.src = nextVideo;
      videoPreloader.preload = "auto";

      // 비디오 로드 성공 시
      videoPreloader.oncanplaythrough = () => {
        console.log("비디오 로드 완료");
        setIsNewVideoLoaded(true);
        setVideoStack((prevStack) => {
          // 스택 업데이트: 맨 앞의 비디오 제거 후 새 비디오 추가
          const updatedStack = [...prevStack.slice(1), nextVideo];
          return updatedStack;
        });
      };

      // 비디오 로드 실패 시
      videoPreloader.onerror = () => {
        console.error("비디오 로드 실패");
      };

      setIsNewVideoLoaded(false); // 새로운 비디오 로드 상태 초기화
    }
  }, [currentIndex, videoSrc]); // currentIndex와 videoSrc를 의존성 배열에 추가

  const handleVideoLoaded = () => {
    setIsNewVideoLoaded(true);
  };

  return (
    <div
      style={{
        width: "530px",
        height: "500px",
        overflow: "hidden",
        position: "relative",
        margin: "0 auto",
      }}
    >
      {/* 스택에 있는 모든 비디오 렌더링 */}
      {videoStack.map((video, index) => (
        <video
          key={index}
          src={video}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          onLoadedData={index === videoStack.length - 1 ? handleVideoLoaded : undefined} // 마지막 비디오만 로드 이벤트 처리
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: videoStack.length - index, // 스택 순서대로 zIndex 설정
            opacity:
              index === videoStack.length - 1 && !isNewVideoLoaded ? 0 : 1, // 마지막 비디오는 로드 전까지 숨김
            transition: "opacity 1s ease-in-out", // 부드러운 전환 효과 추가
          }}
        />
      ))}
    </div>
  );
};

export default VideoComponent;
