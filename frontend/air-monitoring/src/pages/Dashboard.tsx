import React, { useState, useEffect } from "react";
import { fetchSensorData } from "../services/api";
import SensorTable from "../components/SensorTable";
import SensorChart from "../components/SensorChart";
import RegionsChart from "../components/RegionsChart";
import { Container, Typography } from "@mui/material";

const Dashboard: React.FC = () => {
    const [sensorData, setSensorData] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchSensorData();
            setSensorData(data);
        };
        loadData();
    }, []);

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Air Pollution Monitoring Dashboard
            </Typography>
            <SensorTable data={sensorData} />
            <SensorChart data={sensorData} />
            <RegionsChart />
        </Container>
    );
};

export default Dashboard;
