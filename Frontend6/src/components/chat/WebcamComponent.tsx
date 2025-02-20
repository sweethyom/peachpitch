import { useRef } from "react";
import Webcam from "react-webcam";

const WebcamComponent = () => {
    // 웹캠 Ref 생성
    const webcamRef = useRef<Webcam>(null);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            {/* 웹캠 화면 */}
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={500}
                height={460}
                videoConstraints={{
                    width: 470,
                    height: 400,
                    facingMode: "user", // 전면 카메라 (후면 카메라 사용 시 "environment")
                }}
                // style={{ borderRadius: "10px", border: "2px solid #ccc" }}
            />
        </div>
    );
};

export default WebcamComponent;
