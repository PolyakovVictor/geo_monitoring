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
  const [modelPredictions, setModelPredictions] = useState<number[]>([]);

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
      const scores = data.map((item: any) => item.air_quality_result.score);
      setChartData({
        labels: data.map((item: any) => new Date(item.timestamp).toLocaleDateString()),
        datasets: [
          {
            label: 'Air Quality Score',
            data: scores,
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

      // Analyze data with the model
      const predictions = await Promise.all(
        data.map(async (reading: any) => {
          const response = await axios.post('http://localhost:8000/api/predict/', {
            pm2_5: reading.air_quality_result.detailed_parameters['PM2.5'],
            pm10: reading.air_quality_result.detailed_parameters.PM10,
            nitrogen_dioxide: reading.air_quality_result.detailed_parameters.NO2,
            sulfur_dioxide: reading.air_quality_result.detailed_parameters.SO2,
            carbon_monoxide: reading.air_quality_result.detailed_parameters.CO,
            ozone: reading.air_quality_result.detailed_parameters.Ozone,
            lead: reading.air_quality_result.detailed_parameters.Lead,
            cadmium: reading.air_quality_result.detailed_parameters.Cadmium,
            radiation_level: reading.air_quality_result.detailed_parameters.Radiation,
          });
          return response.data.prediction[0];
        })
      );

      setModelPredictions(predictions);

      // Add model predictions to the chart
      setChartData((prevData: any) => ({
        ...prevData,
        datasets: [
          ...prevData.datasets,
          {
            label: 'Model Prediction',
            data: predictions,
            fill: false,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            pointRadius: 5,
            pointHoverRadius: 8,
          },
        ],
      }));
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
                      label: (context: any) => {
                        const index = context.dataIndex;
                        const details = dataWithDetails[index];
                        return [
                          `Score: ${context.formattedValue}`,
                          `Description: ${details.air_quality_result.description}`,
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
                      <TableCell>PM2.5</TableCell>
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
                        <TableCell>{param['PM2.5']}</TableCell>
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
