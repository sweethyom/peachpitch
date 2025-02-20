import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

import styles from './styles/Word.module.scss'

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

interface WordChartProps {
    keywords: string[];  // Receive keywords array
}

const WordChart: React.FC<WordChartProps> = ({ keywords }) => {
    const [chartData, setChartData] = useState<any>(null);

    // ✅ Function to calculate frequency and get top 5 keywords + 기타
    const processKeywords = (keywords: string[]) => {
        const frequency: { [key: string]: number } = {};
        keywords.forEach(keyword => {
            frequency[keyword] = (frequency[keyword] || 0) + 1;
        });

        // Sort by frequency
        const sortedKeywords = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const topKeywords = sortedKeywords.map(item => item[0]);
        const topValues = sortedKeywords.map(item => item[1]);

        // Add "기타" category
        const otherKeywords = Object.entries(frequency)
            .filter(item => !topKeywords.includes(item[0]))
            .reduce((acc, item) => acc + item[1], 0);

        if (otherKeywords > 0) {
            topKeywords.push("기타");
            topValues.push(otherKeywords);
        }

        return { topKeywords, topValues };
    };

    useEffect(() => {
        if (keywords.length === 0) return; // Avoid unnecessary state updates
        const { topKeywords, topValues } = processKeywords(keywords);

        setChartData({
            labels: topKeywords,
            datasets: [
                {
                    label: "Keyword Frequency",
                    data: topValues,
                    backgroundColor: [
                        "#8B5D33", "#D9A34A", "#8B5D33", "#F3D181", "#FAC10B", "#D9A34A"
                    ],
                    borderWidth: 1,
                    barThickness: 40,
                },
            ],
        });
    }, [keywords]);  // Only run when `keywords` change

    if (!chartData) return <p>Loading...</p>;

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // Hide legend
            },
            tooltip: {
                enabled: false, // Disable tooltip
            },
            datalabels: {
                display: false, // Disable data labels
            },
        },
        scales: {
            x: {
                grid: {
                    display: false, // Hide x-axis grid lines
                    // drawBorder:false,
                    // drawTicks:false,
                },
                ticks:{
                    // display:false,
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    display: false, // Hide y-axis ticks
                },
                grid: {
                    display: false, // Hide y-axis grid lines
                    drawTicks:false,
                },
            },
        },
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.back}></div>
            <Bar data={chartData} options={options} className={styles.chart} />
        </div>
    );
};

export default WordChart;
