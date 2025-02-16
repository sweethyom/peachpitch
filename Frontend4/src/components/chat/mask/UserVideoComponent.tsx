import { useEffect, useRef, useState } from "react";
import OpenViduVideoComponent from "../OvVideo";
import { StreamManager } from "openvidu-browser";
import { FaceDetector, FilesetResolver, Detection } from "@mediapipe/tasks-vision";
import Mask from "./CatMask";

// import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

type UserVideoComponentProps = {
    streamManager: StreamManager | null;
    selectedMask: string | null;
    isLocalUser:boolean;
};

const maskOptions = ["mask1", "mask2", "mask3", "mask4"];

function UserVideoComponent({ streamManager, selectedMask, isLocalUser }: UserVideoComponentProps) {

    console.log("현재 적용된 필터 " + selectedMask)

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const faceDetectorRef = useRef<FaceDetector | null>(null);
    const [detectedFaces, setDetectedFaces] = useState<{ x: number; y: number; width: number; height: number }[]>([]);

    const [randomMask, _setRandomMask] = useState<string>(maskOptions[Math.floor(Math.random() * maskOptions.length)])

    useEffect(() => {
        if (!streamManager) return;

        const videoElement = document.createElement("video");
        videoElement.autoplay = true;
        videoElement.playsInline = true;

        streamManager.addVideoElement(videoElement);

        videoRef.current = videoElement;

        // ✅ 얼굴 감지 모델 초기화
        const initializeFaceDetector = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );
                const detector = await FaceDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                });
                faceDetectorRef.current = detector;
                console.log("✅ Face Detector 초기화 완료");
                requestAnimationFrame(processFrame);
            } catch (error) {
                console.error("🚨 Face Detector 초기화 오류:", error);
            }
        };

        initializeFaceDetector();

        return () => {
            faceDetectorRef.current = null;
        };
    }, [streamManager]);

    // ✅ 얼굴 감지 실행
    const processFrame = async () => {
        if (!videoRef.current || !faceDetectorRef.current) return;
        const video = videoRef.current;

        if (video.readyState < 2) {
            requestAnimationFrame(processFrame);
            return;
        }

        // 얼굴 감지
        const detections: Detection[] = faceDetectorRef.current.detectForVideo(video, performance.now()).detections;
        const faces = detections
            .map((detection) => {
                if (!detection.boundingBox) return null;

                const { originX, originY, width, height } = detection.boundingBox;

                // 🚨 ROI 크기 검증 (너무 작으면 감지 무시)
                if (width <= 0 || height <= 0) return null;

                return {
                    x: originX + width / 7,
                    y: originY + height / 8,
                    width: Math.max(width * 2.1, 50), // 최소 크기 50px 이상
                    height: Math.max(height * 2.1, 50),
                };
            })
            .filter((face): face is { x: number; y: number; width: number; height: number } => face !== null);

        setDetectedFaces(faces);

        requestAnimationFrame(processFrame);
    };

    return (
        <div style={{ position: "relative", width: "500px", height: "460px" }}>
            <div
                className="streamcomponent"
                style={{
                    width: "500px",
                    height: "460px",
                    borderRadius: "10px",
                    border: "2px solid #ccc",
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                }}
            >
                <OpenViduVideoComponent streamManager={streamManager} />
                <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
            </div>

            {/* 감지된 얼굴 위에 CatFace 추가 */}
            {detectedFaces.map((face, index) => (
                <Mask key={index} x={face.x} y={face.y} width={face.width} height={face.height} selectedMask={isLocalUser ? selectedMask : randomMask} />
            ))}
        </div>
    );
}

export default UserVideoComponent;
