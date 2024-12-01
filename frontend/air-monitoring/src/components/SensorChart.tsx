import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface SensorData {
    sensor_id: string;
    pollutant: string;
    value: number;
    timestamp: string;
}

interface SensorChartProps {
    data: SensorData[];
}

const SensorChart: React.FC<SensorChartProps> = ({ data }) => {
    return (
        <LineChart width={800} height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" name="Value" />
        </LineChart>
    );
};

export default SensorChart;
