import { Doughnut } from "react-chartjs-2";

import styles from './styles/Habits.module.scss';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; // 플러그인 import

// Chart.js 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels); // 플러그인 등록

const Habits = (): JSX.Element => {
    const data: ChartData<"doughnut"> = {
        labels: ["이제", "쓰읍", "으음", "기타"],
        datasets: [
            {
                data: [33, 20, 13, 34], // 각 섹션의 값
                backgroundColor: ["#7C4D00", "#B57D30", "#FAC10B", "#FFDB6E"], // 색상
                hoverBackgroundColor: ["#6F4826", "#B17E36", "#D9B067", "#F2C266"], // hover 시 색상
                borderWidth: 3,
            },
        ],
    };

    const options: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // 기본 Legend 숨기기
            },
            tooltip: {
                enabled: false, // 툴팁 활성화
            },
            datalabels: {
                display: false, // 데이터 라벨 숨기기
            },
        },
    };

    // 커스텀 Legend 구성
    const customLegend = data.labels?.map((label, index) => {
        const color = data.datasets[0].backgroundColor[index];
        const value = data.datasets[0].data[index];
        const total = data.datasets[0].data.reduce((acc, cur) => acc + cur, 0);
        const percentage = Math.round((value / total) * 100);

        return (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "8px" }}>
                <div className={styles.box}>
                    <div className={styles.legend__item}>
                        <div
                            style={{
                                width: "30px",
                                height: "30px",
                                backgroundColor: color as string,
                                marginRight: "8px",
                                borderRadius: "50%",
                            }}
                        ></div>
                        <span className={styles.legend__item__label}>
                            {label}
                        </span>
                    </div>
                    <span className={styles.legend__item__explain}>
                        대화마다 <strong>평균 {value}회</strong> 사용({percentage}%)
                    </span>
                </div>
                <hr className={styles.legend__item__divider} />
            </div >
        );
    });

    return (
        <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div className={styles.chart}>
                <Doughnut data={data} options={options} />
            </div>
            <div className={styles.legend}>
                {customLegend}
            </div>
        </div>
    );
};

export default Habits;
