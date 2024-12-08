import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Реєстрація модулів Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface EmissionData {
  region: string;
  year: number;
  emissions: number;
}

const EmissionStats: React.FC = () => {
  const [emissions, setEmissions] = useState<EmissionData[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Отримання даних із бекенду
    axios.get("http://localhost:8000/api/emissions").then((response) => {
      const data: EmissionData[] = response.data;
      setEmissions(data);

      // Групування даних для графіка
      const groupedByRegion = data.reduce((acc: any, item) => {
        if (!acc[item.region]) acc[item.region] = 0;
        acc[item.region] += item.emissions;
        return acc;
      }, {});

      setChartData({
        labels: Object.keys(groupedByRegion),
        datasets: [
          {
            label: "Emissions by Region (thousands of tons)",
            data: Object.values(groupedByRegion),
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });
    });
  }, []);

  return (
    <Box>
      {/* Заголовок */}
      <Typography variant="h4" gutterBottom>
        Emission Statistics
      </Typography>

      {/* Графік */}
      {chartData ? (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Total Emissions by Region
          </Typography>
          <Bar data={chartData} />
        </Box>
      ) : (
        <Typography>Loading chart...</Typography>
      )}

      {/* Таблиця */}
      <Typography variant="h5" gutterBottom>
        Detailed Emission Data
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Region</strong></TableCell>
              <TableCell><strong>Year</strong></TableCell>
              <TableCell><strong>Emissions (thousands of tons)</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emissions.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.region}</TableCell>
                <TableCell>{row.year}</TableCell>
                <TableCell>{row.emissions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmissionStats;
