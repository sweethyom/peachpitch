import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; // 플러그인 import

// Chart.js 요소 및 플러그인 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const Lead = (): JSX.Element => {
    // 데이터 구성: 100% 기준
    const data: ChartData<"bar"> = {
        labels: ["비교"], // x축 라벨
        datasets: [
            {
                label: "30%", // 첫 번째 부분
                data: [30], // 값 (30%)
                backgroundColor: "#FAC10B", // 노란색
                borderRadius: 10, // 둥근 모서리
                barThickness: 45, // 막대 두께
            },
            {
                label: "70%", // 두 번째 부분
                data: [70], // 값 (70%)
                backgroundColor: "#FFF8E4", // 밝은 색상
                borderRadius: 10, // 둥근 모서리
                barThickness: 45, // 막대 두께
            },
        ],
    };

    // 옵션 설정
    const options: ChartOptions<"bar"> = {
        indexAxis: "y", // 가로 방향 막대 차트
        responsive: true,
        maintainAspectRatio: false, // 비율 유지 비활성화
        plugins: {
            tooltip: {
                enabled: false, // 툴팁 활성화
            },
            legend: {
                display: false, // 범례 숨기기
            },
            datalabels: {
                anchor: "center", // 데이터 라벨의 앵커 위치
                align: "center", // 데이터 라벨 텍스트 정렬
                color: "#000", // 라벨 색상
                font: {
                    weight: "bold",
                    size: 14,
                },
                formatter: (value) => `${value}%`, // 데이터 값을 %로 표시
            },
        },
        scales: {
            x: {
                stacked: true, // x축 누적 설정
                max: 100, // 100% 기준으로 설정
                ticks: {
                    display: false, // x축 값 숨기기
                },
                grid: {
                    display: false, // x축 격자선 숨기기
                },
            },
            y: {
                stacked: true, // y축 누적 설정
                ticks: {
                    display: false, // y축 값 숨기기
                },
                grid: {
                    display: false, // y축 격자선 숨기기
                },
            },
        },
    };

    return (
        <div style={{ width: "740px", height: "56px" }}> {/* 가로 길이 조정 */}
            <Bar data={data} options={options} />
        </div>
    );
};

export default Lead;
