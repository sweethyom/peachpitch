import { Doughnut } from "react-chartjs-2";
import styles from './styles/Habits.module.scss';
import { useEffect, useState } from "react";

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
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// ✅ Define Type for Speaking Habits
interface SpeakingHabit {
    wordId: number;
    word: string;
    count: number;
}

// ✅ Props Type Definition
interface HabitsProps {
    speakingHabits: SpeakingHabit[];
}

const Habits: React.FC<HabitsProps> = ({ speakingHabits }) => {
    // ✅ Ensure Proper Type Definition for State
    const [chartData, setChartData] = useState<ChartData<"doughnut">>({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: [],
                borderWidth: 3,
            },
        ],
    });

    // ✅ Function to Process Data
    const processHabitsData = (habits: SpeakingHabit[]) => {
        if (!habits || habits.length === 0) return { labels: ["데이터 없음"], data: [1] };

        // 빈도순으로 정렬
        const sortedHabits = [...habits].sort((a, b) => b.count - a.count);

        // 상위 3개 추출
        const top3 = sortedHabits.slice(0, 3);
        const otherTotal = sortedHabits.slice(3).reduce((sum, item) => sum + item.count, 0);

        // 차트용 데이터 생성
        const labels = top3.map(item => item.word);
        const data = top3.map(item => item.count);

        if (otherTotal > 0) {
            labels.push("기타");
            data.push(otherTotal);
        }

        return { labels, data };
    };

    // ✅ Update Chart Data when `speakingHabits` changes
    useEffect(() => {
        const { labels, data } = processHabitsData(speakingHabits);

        // ✅ Ensure there is always data to prevent empty charts
        const finalData = data.length > 0 ? data : [1];
        const finalLabels = labels.length > 0 ? labels : ["데이터 없음"];

        setChartData({
            labels: finalLabels,
            datasets: [
                {
                    data: finalData,
                    backgroundColor: ["#7C4D00", "#B57D30", "#FAC10B", "#FFDB6E"],
                    hoverBackgroundColor: ["#6F4826", "#B17E36", "#D9B067", "#F2C266"],
                    borderWidth: 3,
                },
            ],
        });
    }, [speakingHabits]);

    const options: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
            datalabels: { display: false },
        },
    };

    // ✅ Custom Legend (Fix Undefined Errors)
    const colors = chartData.datasets[0].backgroundColor as string[]; // Ensure it's an array

    const customLegend = chartData.labels?.map((label, index) => {
        const color = colors?.[index] ?? "#CCCCCC"; // Default color if undefined
        const value = (chartData.datasets[0].data[index] as number) ?? 0; // Ensure value is always a number
        const total = chartData.datasets[0].data.reduce((acc, cur) => acc + (cur as number), 0) ?? 1;
        const percentage = total ? Math.round((value / total) * 100) : 0;


        const key = String(label);

        return (
            <div key={String(key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "8px" }}>
                <div className={styles.box}>
                    <div className={styles.legend__item}>
                        <div style={{
                            width: "30px",
                            height: "30px",
                            backgroundColor: color,
                            marginRight: "8px",
                            borderRadius: "50%",
                        }}></div>
                        <span className={styles.legend__item__label}>{key}</span>
                    </div>
                    <span className={styles.legend__item__explain}>
                        대화마다 <strong>평균 {value}회</strong> 사용 ({percentage}%)
                    </span>
                </div>
                <hr className={styles.legend__item__divider} />
            </div>
        );
    });

    return (
        <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div className={styles.chart}>
                {chartData.datasets[0].data.length > 0 ? (
                    <Doughnut data={chartData} options={options} />
                ) : (
                    <p>📊 데이터 없음</p>
                )}
            </div>
            <div className={styles.legend}>{customLegend}</div>
        </div>
    );
};

export default Habits;
