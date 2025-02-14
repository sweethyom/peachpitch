import { ChartData } from "chart.js";
import { Bar } from "react-chartjs-2";

interface LeadProps {
    ansCount: number;
    questCount: number;
}

const Lead = ({ ansCount, questCount }: LeadProps) => {
    const total = ansCount + questCount || 1; // ✅ Prevent division by 0
    const ansPercentage = ((ansCount / total) * 100).toFixed(1);
    const questPercentage = ((questCount / total) * 100).toFixed(1);

    const data: ChartData<"bar"> = {
        labels: ["대화 주도권"],
        datasets: [
            {
                label: `${questPercentage}% 질문`,
                data: [Number(questPercentage)],
                backgroundColor: "#FAC10B",
                borderRadius: 10,
                barThickness: 45,
            },
            {
                label: `${ansPercentage}% 답변`,
                data: [Number(ansPercentage)],
                backgroundColor: "#FFF8E4",
                borderRadius: 10,
                barThickness: 45,
            },
        ],
    };

    return (
        <div style={{ width: "740px", height: "56px" }}>
            <Bar data={data} options={{
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { stacked: true, max: 100, ticks: { display: false }, grid: { display: false } },
                    y: { stacked: true, ticks: { display: false }, grid: { display: false } }
                }
            }} />
        </div>
    );
};

export default Lead;