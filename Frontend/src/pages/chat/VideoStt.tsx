import { useState, useEffect } from 'react';
import "regenerator-runtime/runtime";

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VideoStt = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [previousTranscript, setPreviousTranscript] = useState<string>(""); // 이전 문장 저장
  const [isRestarting, setIsRestarting] = useState(false); // 자동 재시작 여부

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  // ✅ 문장이 완성되었는지 확인하는 정규식
  const sentenceEndRegex = /.*(했다|어요|습니다)[.!?]?$/;

  // 🎙 음성 인식이 멈추면 자동 재시작
  useEffect(() => {
    if (!listening && !isRestarting) {
      setIsRestarting(true);
      setTimeout(() => {
        SpeechRecognition.startListening({ continuous: true, language: "ko-KR" });
        setIsRestarting(false);
      }, 500); // 0.5초 후 다시 시작
    }
  }, [listening, isRestarting]);

  // 📜 STT 기록 저장 (문장이 완성되었을 때만)
  useEffect(() => {
    if (transcript && transcript !== previousTranscript) {
      // ✅ 문장이 완성된 경우 저장 (길이 10자 이상 OR 종결어미 OR 마침표 포함)
      if (transcript.length > 100 || sentenceEndRegex.test(transcript)) {
        setHistory((prevHistory) => [...prevHistory, transcript]); // 기존 기록에 추가
        setPreviousTranscript(transcript); // 이전 문장 업데이트
        resetTranscript(); // 저장 후 초기화
      }
    }
  }, [transcript, previousTranscript]);

  return (
    <div>
      <p>🎤 Microphone: {listening ? 'on' : 'off'}</p>

      <button onClick={() => SpeechRecognition.startListening({ continuous: true, language: "ko-KR" })}>
        Start
      </button>
      <button onClick={() => SpeechRecognition.stopListening()}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>

      <h3>📝 실시간 STT</h3>
      <p>{transcript}</p>

      <h3>📜 이전 대화 기록</h3>
      <div id="history">
        {history.map((item, index) => (
          <p key={index}>🗣 {item}</p>
        ))}
      </div>
    </div>
  );
};

export default VideoStt;
