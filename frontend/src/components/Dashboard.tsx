import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import { startOfYear, subYears } from 'date-fns';

// Updated TypeScript interfaces to match the new API response
interface Location {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
}

interface PollutionSummary {
  location_id: number;
  location_name: string;
  avg_nitrogen_dioxide: number;
  avg_sulfur_dioxide: number;
  avg_pm2_5: number;
}

interface ChartData {
  name: string;
  'Nitrogen Dioxide': number;
  'Sulfur Dioxide': number;
  'PM 2.5': number;
}

export const PollutionComparisonChart: React.FC = () => {
  // State management
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [pollutionData, setPollutionData] = useState<PollutionSummary[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default date range
  useEffect(() => {
    const defaultStartDate = startOfYear(subYears(new Date(), 1));
    const defaultEndDate = new Date();
    
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
  }, []);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get<Location[]>('http://localhost:8000/api/locations');
        setLocations(response.data);
      } catch (error) {
        setError('Не вдалося завантажити локації');
        console.error('Failed to fetch locations', error);
      }
    };
    fetchLocations();
  }, []);

  // Fetch pollution comparison data
  const fetchPollutionComparison = async () => {
    if (selectedLocations.length === 0 || !startDate || !endDate) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      selectedLocations.forEach(locId => params.append('location_ids', locId.toString()));
      console.log(params)
      params.append('start_date', startDate.toISOString());
      params.append('end_date', endDate.toISOString());

      const response = await axios.get<PollutionSummary[]>(
        'http://localhost:8000/api/locations/pollution-summary/', 
        { params: Object.fromEntries(params) }
      );
      setPollutionData(response.data);
    } catch (error) {
      setError('Не вдалося отримати дані про забруднення');
      console.error('Failed to fetch pollution comparison', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const chartData = useMemo<ChartData[]>(() => {
    return pollutionData.map(data => ({
      name: data.location_name,
      'Nitrogen Dioxide': data.avg_nitrogen_dioxide,
      'Sulfur Dioxide': data.avg_sulfur_dioxide,
      'PM 2.5': data.avg_pm2_5
    }));
  }, [pollutionData]);

  // Handle location selection
  const handleLocationChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setSelectedLocations(
      typeof value === 'string' ? value.split(',').map(Number) : value
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" gutterBottom>
            Порівняння забруднення за локаціями
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Локації</InputLabel>
              <Select
                multiple
                value={selectedLocations}
                label="Локації"
                onChange={handleLocationChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const location = locations.find(loc => loc.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={location ? location.name : value} 
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {locations.map((location) => (
                  <MenuItem 
                    key={location.id} 
                    value={location.id}
                  >
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker
              label="Початкова дата"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slots={{ textField: TextField }}
            />

            <DatePicker
              label="Кінцева дата"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slots={{ textField: TextField }}
            />

            <Button 
              variant="contained" 
              onClick={fetchPollutionComparison}
              disabled={selectedLocations.length === 0 || !startDate || !endDate || isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Порівняти забруднення'}
            </Button>
          </Box>

          {isLoading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : pollutionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Рівень забруднення', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Nitrogen Dioxide" fill="#8884d8" />
                <Bar dataKey="Sulfur Dioxide" fill="#82ca9d" />
                <Bar dataKey="PM 2.5" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body1" color="textSecondary" align="center">
              Виберіть локації та діапазон дат для порівняння рівнів забруднення
            </Typography>
          )}
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default PollutionComparisonChart;