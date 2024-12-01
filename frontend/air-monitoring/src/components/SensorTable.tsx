import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography } from "@mui/material";

interface SensorData {
    sensor_id: string;
    pollutant: string;
    value: number;
    timestamp: string;
}

interface SensorTableProps {
    data: SensorData[];
}

const SensorTable: React.FC<SensorTableProps> = ({ data }) => {
    return (
        <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
            <Typography variant="h6" gutterBottom>
                Sensor Data Table
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Sensor ID</TableCell>
                        <TableCell>Pollutant</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Timestamp</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell>{row.sensor_id}</TableCell>
                            <TableCell>{row.pollutant}</TableCell>
                            <TableCell>{row.value}</TableCell>
                            <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default SensorTable;
