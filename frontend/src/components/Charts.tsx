import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  SelectChangeEvent, 
  MenuItem,
  Button,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// TypeScript interfaces for our data structures
interface Location {
  id: number;
  name: string;
}

interface SensorData {
  id: number;
  timestamp: string;
  nitrogen_dioxide: number;
  sulfur_dioxide: number;
  pm2_5: number;
  carbon_monoxide: number;
}

// Utility function to format date
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export const PollutionChart: React.FC = () => {
  // State management
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/locations');
        setLocations(response.data);
      } catch (error) {
        console.error('Failed to fetch locations', error);
      }
    };
    fetchLocations();
  }, []);

  // Fetch sensor data when location and dates are selected
  const fetchSensorData = async () => {
    if (!selectedLocation || !startDate || !endDate) return;

    try {
      const response = await axios.get(`http://localhost:8000/api/sensor-data/location/${selectedLocation}`, {
        params: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }
      });
      setSensorData(response.data.sensor_data);
    } catch (error) {
      console.error('Failed to fetch sensor data', error);
    }
  };

  // Prepare chart data
  const chartData = sensorData.map(data => ({
    date: formatDate(new Date(data.timestamp)),
    'Nitrogen Dioxide': data.nitrogen_dioxide,
    'Sulfur Dioxide': data.sulfur_dioxide,
    'PM 2.5': data.pm2_5,
    'Carbon Monoxide': data.carbon_monoxide
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" gutterBottom>
            Environmental Pollution Monitoring
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={selectedLocation}
                label="Location"
                onChange={(e: SelectChangeEvent<number>) => 
                  setSelectedLocation(e.target.value as number)
                }
              >
                {locations.map(location => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slots={{ textField: TextField }}
            />

            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slots={{ textField: TextField }}
            />

            <Button 
              variant="contained" 
              onClick={fetchSensorData}
              disabled={!selectedLocation || !startDate || !endDate}
            >
              Load Data
            </Button>
          </Box>

          {sensorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Nitrogen Dioxide" stroke="#8884d8" />
                <Line type="monotone" dataKey="Sulfur Dioxide" stroke="#82ca9d" />
                <Line type="monotone" dataKey="PM 2.5" stroke="#ffc658" />
                <Line type="monotone" dataKey="Carbon Monoxide" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body1" color="textSecondary" align="center">
              Select location and date range to view pollution data
            </Typography>
          )}
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default PollutionChart;