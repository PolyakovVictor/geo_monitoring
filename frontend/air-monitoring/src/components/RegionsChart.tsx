import React, { useEffect, useState } from "react";
import { fetchRegionsData } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const RegionsChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const regionsData = await fetchRegionsData();
        // Обробка даних для графіку
        const chartData = regionsData.map((region: any) => ({
          name: region.region,
          avgPollution: region.data.reduce((sum: number, item: any) => sum + item.value, 0) / region.data.length,
        }));
        setData(chartData);
      } catch (error) {
        console.error("Error fetching region data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h2>Average Pollution Levels by Region</h2>
      <BarChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="avgPollution" fill="#82ca9d" />
      </BarChart>
    </div>
  );
};

export default RegionsChart;
