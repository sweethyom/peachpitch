import { useState, useEffect } from "react";

type VideoProps = {
  videoSrc: string;
  nextVideo: string | null;
  onVideoLoaded: () => void;
};

function VideoComponent({ videoSrc, nextVideo, onVideoLoaded }: VideoProps) {
  const [currentVideo, setCurrentVideo] = useState(videoSrc);
  const [previousVideo, setPreviousVideo] = useState<string | null>(null);
  const [thirdVideo, setThirdVideo] = useState<string | null>(null);
  const [isNewVideoLoaded, setIsNewVideoLoaded] = useState(false);
  // const [backgroundVideo, setBackgroundVideo] = useState(videoSrc); // ✅ 배경 비디오 상태 추가
  const [isLoading, setIsLoading] = useState(true); // 비디오 로딩 상태 추적


  useEffect(() => {
    if (nextVideo && nextVideo !== currentVideo) {
      console.log(`이전 비디오: ${currentVideo}, 새로운 비디오: ${nextVideo}`);

      const videoPreloader = document.createElement("video");
      videoPreloader.src = nextVideo;
      videoPreloader.preload = "auto";

      videoPreloader.onloadeddata = () => {
        setCurrentVideo(nextVideo);
        setIsNewVideoLoaded(true);
      };

      setIsNewVideoLoaded(false); // 새로운 비디오 로드 상태 초기화

      // setThirdVideo(previousVideo); // 이전 비디오를 `thirdVideo`로 이동
      // setPreviousVideo(currentVideo); // 현재 비디오를 이전 비디오로 이동
      // setCurrentVideo(nextVideo); // 새로운 비디오 설정
      // setIsNewVideoLoaded(false); // 새로운 비디오 로드 여부 초기화
      // setIsLoading(true); // 비디오 로딩 중 상태로 설정
    }
  }, [nextVideo]); // ✅ currentVideo 제거 (무한 루프 방지)

  const handleVideoLoaded = () => {
    setIsNewVideoLoaded(true);
    // setIsLoading(false); // 비디오 로드 완료
    onVideoLoaded();
  };


  return (
    <div style={{ width: "470px", height: "400px", overflow: "hidden", position: "relative", margin: "0 auto" }}>
      {/* ✅ 배경 비디오도 새로운 비디오로 변경 */}
      {/* <video
        src={backgroundVideo}
        muted
        autoPlay
        loop
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0, // 가장 뒤에 위치
          opacity: 0.5, // 배경 비디오 투명도 조절
          transition: "opacity 1s ease-in-out",
        }}
      /> */}

      {/* ✅ 세 번째 비디오 (가장 아래 비디오) */}
      {/* {thirdVideo && (
        <video
          src={thirdVideo}
          muted
          autoPlay
          loop
          playsInline
          preload="auto" // 비디오 미리 로드
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1, // 가장 아래에 위치
            opacity: 1,
          }}
        />
      )} */}



      {/* ✅ 두 번째 비디오 (이전 비디오) */}
      {/* {previousVideo && (
        <video
          src={previousVideo}
          muted
          autoPlay
          loop
          playsInline
          preload="auto" // 비디오 미리 로드
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2, // 중간에 위치
            // zIndex: 1, // 기존 비디오는 뒤로 배치
            // zIndex: isNewVideoLoaded ? 1 : 2, // isNewVideoLoaded 상태에 따라 zIndex 변경
            // opacity: isNewVideoLoaded ? 0.7 : 1,
            // opacity: isNewVideoLoaded ? 0 : 1, // 새로운 비디오가 로드되면 페이드아웃
            opacity: 1,
            transition: "opacity 1s ease-in-out",
          }}
        />
      )} */}

      {/* ✅ 첫 번째 비디오 (현재 비디오) */}
      <video
        src={currentVideo}
        muted
        autoPlay
        loop
        playsInline
        preload="auto" // 비디오 미리 로드
        onLoadedData={handleVideoLoaded} // 비디오 로드 완료 후 처리
        // onLoadedData={() => {
        //   setIsNewVideoLoaded(true);
        //   // setTimeout(() => {
        //   //   setPreviousVideo(null); // ✅ 기존 비디오 제거
        //   //   setBackgroundVideo(currentVideo); // ✅ 배경 비디오를 현재 비디오로 변경
        //   // }, 2000);
        //   onVideoLoaded();
        // }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
          // zIndex: 3, // 가장 위에 위치
          // zIndex: 2, // 가장 위에 위치
          // opacity: 1,
          // opacity: isLoading ? 0 : 1, // 로딩 중에는 opacity를 0으로 설정
          zIndex: isNewVideoLoaded ? 3 : -1, // 비디오가 로드되기 전에는 화면에 표시하지 않음
          opacity: isNewVideoLoaded ? 1 : 0, // 비디오가 로드되면 서서히 나타남
          transition: "opacity 1s ease-in-out",
        }}
      />
    </div>
  );
}

export default VideoComponent;
