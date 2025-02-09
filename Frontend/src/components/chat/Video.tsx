import { useState, useEffect } from "react";

type VideoProps = {
  videoSrc: string;
  nextVideo: string | null;
  onVideoLoaded: () => void;
};

function VideoComponent({ videoSrc, nextVideo, onVideoLoaded }: VideoProps) {
  const [currentVideo, setCurrentVideo] = useState(videoSrc);
  const [previousVideo, setPreviousVideo] = useState<string | null>(null);
  const [isNewVideoLoaded, setIsNewVideoLoaded] = useState(false);
  const [backgroundVideo, setBackgroundVideo] = useState(videoSrc); // ✅ 배경 비디오 상태 추가

  useEffect(() => {
    if (nextVideo && nextVideo !== currentVideo) {
      console.log(`이전 비디오: ${currentVideo}, 새로운 비디오: ${nextVideo}`);

      setPreviousVideo(currentVideo);
      setCurrentVideo(nextVideo);
      setIsNewVideoLoaded(false);
    }
  }, [nextVideo]); // ✅ currentVideo 제거 (무한 루프 방지)


  return (
    <div style={{ width: "470px", height: "400px", overflow: "hidden", position: "relative", margin: "0 auto" }}>
      {/* ✅ 배경 비디오도 새로운 비디오로 변경 */}
      <video
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
      />

      {/* ✅ 기존 비디오 */}
      {previousVideo && (
        <video
          src={previousVideo}
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
            zIndex: isNewVideoLoaded ? 1 : 2, // isNewVideoLoaded 상태에 따라 zIndex 변경
            opacity: isNewVideoLoaded ? 0.7 : 1,
            transition: "opacity 1s ease-in-out",
          }}
        />
      )}

      {/* ✅ 새로운 비디오 */}
      <video
        src={currentVideo}
        muted
        autoPlay
        loop
        playsInline
        onLoadedData={() => {
          setIsNewVideoLoaded(true);
          setTimeout(() => {
            setPreviousVideo(null); // ✅ 기존 비디오 제거
            setBackgroundVideo(currentVideo); // ✅ 배경 비디오를 현재 비디오로 변경
          }, 2000);
          onVideoLoaded();
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 2, // 가장 위에 위치
          opacity: 1,
        }}
      />
    </div>
  );
}

export default VideoComponent;
