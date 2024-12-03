import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Typography, Box } from "@mui/material";
import axios from "axios";

// Реєстрація модулів Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RegionData {
  region: string;
  data: Array<{
    pollutant: string;
    value: number;
    timestamp: string;
  }>;
}

const Charts: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/simulation/regions")
      .then((response) => {
        const data: RegionData[] = response.data;

        // Генерація даних для графіку
        const regionNames = data.map((item) => item.region);
        const pollutantLevels = data.map((item) =>
          item.data.reduce((acc, curr) => acc + curr.value, 0)
        );

        setChartData({
          labels: regionNames,
          datasets: [
            {
              label: "Pollution Levels",
              data: pollutantLevels,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (!chartData) return <Typography>Error loading chart data.</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pollution Levels by Region
      </Typography>
      <Bar data={chartData} />
    </Box>
  );
};

export default Charts;
