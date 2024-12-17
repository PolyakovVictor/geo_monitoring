import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  Box, CircularProgress, Typography, 
  FormControl, InputLabel, Select, MenuItem, 
  Button, TextField, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import axios from 'axios';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AirQualityTrendChart: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [detailedParameters, setDetailedParameters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataWithDetails, setDataWithDetails] = useState<any[]>([]);


  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/locations');
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations', error);
      }
    };
    fetchLocations();
  }, []);

  // Fetch air quality data
  const fetchTrendData = async () => {
    if (!selectedLocation || !startDate || !endDate) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/air-quality/location/${selectedLocation}`,
        { 
          params: { 
            start_date: startDate.toISOString(), 
            end_date: endDate.toISOString() 
          } 
        }
      );
      const data = response.data.detailed_results;
      setDataWithDetails(data);

      // Chart data
      setChartData({
        labels: data.map((item: any) => new Date(item.timestamp).toLocaleDateString()),
        datasets: [
          {
            label: 'Air Quality Score',
            data: data.map((item: any) => item.air_quality_result.score),
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            pointRadius: 5,
            pointHoverRadius: 8,
          },
        ],
      });
      // Table data
      
      setDetailedParameters(
        data.map((reading: any) => ({
          timestamp: reading.timestamp,
          description: reading.air_quality_result.description,
          ...reading.air_quality_result.detailed_parameters,
        }))
      );
    } catch (error) {
      console.error('Error fetching trend data', error);
    }
    setLoading(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Air Quality Trends
        </Typography>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              value={selectedLocation}
              label="Location"
              onChange={(e) => setSelectedLocation(e.target.value as number)}
            >
              {locations.map((location) => (
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
            onClick={fetchTrendData}
            disabled={!selectedLocation || !startDate || !endDate}
          >
            Load Data
          </Button>
        </Box>

        {/* Chart */}
        {loading ? (
          <CircularProgress />
        ) : chartData ? (
          <>
            <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  // Кастомізуємо контент для tooltip
                  label: (context: any) => {
                    const index = context.dataIndex;
                    const details = dataWithDetails[index];

                    return [
                      `Score: ${context.formattedValue}`,
                      `Description: ${details.air_quality_result.description}`,
                      `PM10: ${details.air_quality_result.detailed_parameters.PM10}`,
                      `NO2: ${details.air_quality_result.detailed_parameters.NO2}`,
                      `SO2: ${details.air_quality_result.detailed_parameters.SO2}`,
                      `CO: ${details.air_quality_result.detailed_parameters.CO}`,
                    ];
                  },
                },
              },
              title: {
                display: true,
                text: 'Air Quality Trends with Details',
              },
            },
          }}
        />
            {/* Table */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Detailed Parameters
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>PM10</TableCell>
                      <TableCell>NO2</TableCell>
                      <TableCell>SO2</TableCell>
                      <TableCell>CO</TableCell>
                      <TableCell>Ozone</TableCell>
                      <TableCell>Lead</TableCell>
                      <TableCell>Cadmium</TableCell>
                      <TableCell>Radiation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailedParameters.map((param: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(param.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell>{param.description}</TableCell>
                        <TableCell>{param.PM10}</TableCell>
                        <TableCell>{param.NO2}</TableCell>
                        <TableCell>{param.SO2}</TableCell>
                        <TableCell>{param.CO}</TableCell>
                        <TableCell>{param.Ozone}</TableCell>
                        <TableCell>{param.Lead}</TableCell>
                        <TableCell>{param.Cadmium}</TableCell>
                        <TableCell>{param.Radiation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        ) : (
          <Typography variant="body1" color="textSecondary" align="center">
            Select location and date range to load data
          </Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AirQualityTrendChart;
