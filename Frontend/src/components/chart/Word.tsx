import styles from './styles/Word.module.scss'

import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Word = () => {
    // 데이터 설정
    const data = {
        labels: ["날씨", "동물", "영화", "책", "드라마", "기타"], // x축 라벨
        datasets: [
            {
                label: "2025",
                data: [80.61, 22.88, 20.98, 14.6, 56.74, 94.26], // 데이터 값
                backgroundColor: [
                    "#8B5D33", // 날씨
                    "#D9A34A", // 동물
                    "#8B5D33", // 영화
                    "#F3D181", // 책
                    "#FAC10B", // 드라마
                    "#D9A34A", // 기타
                ],
                borderWidth: 1, // 막대 테두리 두께
                barThickness: 40, // 막대 굵기
            },
        ],
    };

    // 옵션 설정
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // 범례 숨기기
            },
            tooltip: {
                enabled: false, // 툴팁 비활성화
            },
            datalabels: {
                display: false, // 데이터 라벨 숨기기
            },
        },
        scales: {
            x: {
                grid: {
                    display: false, // x축 격자선 숨기기
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    display: false, // y축 눈금 숫자 숨기기
                },
                grid: {
                    display: false, // y축 격자선 숨기기
                },
            },
        },
    };

    return (
        <div className={styles.chart} style={{ width: "400px", height: "400px", margin: "0 auto", border: "solid #000 1px" }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default Word;
