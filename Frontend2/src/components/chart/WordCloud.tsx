import WordCloudComponent from "react-wordcloud";

// 샘플 데이터
const words = [
    { text: "날씨", value: 80 },
    { text: "여행", value: 70 },
    { text: "음식", value: 50 },
    { text: "음악", value: 40 },
    { text: "학습", value: 60 },
    { text: "책", value: 30 },
    { text: "영화", value: 40 },
    { text: "바다", value: 30 },
    { text: "스포츠", value: 20 },
    { text: "친구", value: 25 },
    { text: "골프", value: 35 },
    { text: "가족", value: 45 },
    { text: "직업", value: 80 },
    { text: "반려동물", value: 70 },
    { text: "휴가", value: 50 },
    { text: "아침", value: 40 },
    { text: "패션", value: 60 },
    { text: "영화", value: 40 },
    { text: "바다", value: 30 },
    { text: "스포츠", value: 20 },
    { text: "친구", value: 25 },
    { text: "골프", value: 35 },
    { text: "가족", value: 45 },
    { text: "직업", value: 80 },
];

// 옵션 설정
const options = {
    rotations: 4, // 단어 회전 횟수
    rotationAngles: [-90, 0] as [number, number], // 타입 명시
    fontSizes: [20, 80] as [number, number], // ✅ 튜플로 변환
    fontFamily: "sans-serif", // 글꼴
};


function WordCloud() {
    return (
        <div style={{ width: "100%", height: "400px", border: "solid #000 1px" }}>
            <WordCloudComponent words={words} options={options} />
        </div>
    );
}

export default WordCloud;
