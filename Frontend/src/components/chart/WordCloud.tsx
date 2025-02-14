import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import "echarts-wordcloud"; // 🔹 플러그인 추가

// 워드 클라우드 데이터 타입 정의
interface Word {
    text: string;
    value: number;
}

interface WordCloudProps {
    words?: Word[];  // `words`를 옵셔널로 설정하여 기본값 제공 가능
}

const WordCloudComponent: React.FC<WordCloudProps> = ({ words = [] }) => { // 기본값 설정
    if (!words.length) {
        return <p>데이터를 불러오는 중...</p>;
    }

    const option = {
        tooltip: {},
        series: [
            {
                type: "wordCloud", // 🔹 이 부분을 사용하기 위해 플러그인 필요
                shape: "circle",
                sizeRange: [10, 50],
                rotationRange: [-90, 90],
                gridSize: 2,
                drawOutOfBound: true,
                textStyle: {
                    fontFamily: "Arial",
                    fontWeight: "bold",
                    color: () => `hsl(${Math.random() * 360}, 100%, 50%)`,
                },
                data: words.map(word => ({
                    name: word.text,
                    value: word.value,
                })),
            },
        ],
    };

    return (
        <ReactECharts
            echarts={echarts} // 🔹 ECharts 객체를 명시적으로 전달
            option={option}
            style={{ height: "400px", width: "100%" }}
        />
    );
};

export default WordCloudComponent;
