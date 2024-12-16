import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box 
} from '@mui/material';

// Types for Air Quality Data
interface AirQualityData {
  timestamp: string;
  airQualityScore: number;
  description: string;
  detailedParameters: {
    PM2_5: number;
    PM10: number;
    NO2: number;
    SO2: number;
    CO: number;
    Ozone: number;
    Lead: number;
    Cadmium: number;
    Radiation: number;
  };
}

// Mock data generation function (replace with actual API call)
const generateMockAirQualityData = (): AirQualityData[] => {
  const mockData: AirQualityData[] = [];
  const pollutants = [
    { PM2_5: 73.07, PM10: 119.04, NO2: 109.27, SO2: 383.24, 
      CO: 13.67, Ozone: 111.43, Lead: 0.4096, Cadmium: 0.1545, Radiation: 2.39 },
    { PM2_5: 62.15, PM10: 95.33, NO2: 87.54, SO2: 312.76, 
      CO: 10.22, Ozone: 89.76, Lead: 0.3212, Cadmium: 0.1123, Radiation: 1.87 },
    { PM2_5: 85.42, PM10: 135.67, NO2: 128.91, SO2: 425.33, 
      CO: 16.54, Ozone: 132.15, Lead: 0.5234, Cadmium: 0.2345, Radiation: 3.12 }
  ];

  pollutants.forEach((pollution, index) => {
    // Simulate fuzzy logic air quality evaluation
    const simulatedScore = Math.min(Math.max(
      (pollution.PM2_5 / 100 + 
       pollution.NO2 / 500 + 
       pollution.SO2 / 500 + 
       pollution.Ozone / 300) / 4 * 10, 
    0), 10);

    mockData.push({
      timestamp: `2024-01-${15 + index}`,
      airQualityScore: simulatedScore,
      description: simulatedScore <= 2 ? 'Excellent' : 
                   simulatedScore <= 4 ? 'Good' : 
                   simulatedScore <= 6 ? 'Moderate' : 
                   simulatedScore <= 8 ? 'Poor' : 'Hazardous',
      detailedParameters: pollution
    });
  });

  return mockData;
};

// Air Quality Score Line Chart Component
export const AirQualityScoreChart: React.FC = () => {
  const airQualityData = generateMockAirQualityData();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Air Quality Score Over Time
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={airQualityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis 
              domain={[0, 10]} 
              ticks={[0, 2, 4, 6, 8, 10]} 
              label={{ value: 'Air Quality Score', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              formatter={(value, name, props) => {
                // Type-safe conversion
                const numValue = typeof value === 'number' 
                  ? value 
                  : typeof value === 'string' 
                    ? parseFloat(value) 
                    : 0;
                
                const data = props.payload as AirQualityData;
                return [`${numValue.toFixed(2)} (${data.description})`, 'Air Quality Score'];
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="airQualityScore" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Pollutant Levels Radar Chart Component
export const PollutantLevelsRadarChart: React.FC = () => {
  const airQualityData = generateMockAirQualityData();
  const latestData = airQualityData[airQualityData.length - 1].detailedParameters;

  // Normalize data for radar chart
  const radarData = [
    { 
      pollutant: 'PM2.5', 
      value: Math.min(latestData.PM2_5 / 3, 100),
      fullMark: 100 
    },
    { 
      pollutant: 'PM10', 
      value: Math.min(latestData.PM10 / 3, 100),
      fullMark: 100 
    },
    { 
      pollutant: 'NO2', 
      value: Math.min(latestData.NO2 / 5, 100),
      fullMark: 100 
    },
    { 
      pollutant: 'SO2', 
      value: Math.min(latestData.SO2 / 5, 100),
      fullMark: 100 
    },
    { 
      pollutant: 'CO', 
      value: Math.min(latestData.CO * 3.33, 100),
      fullMark: 100 
    },
    { 
      pollutant: 'Ozone', 
      value: Math.min(latestData.Ozone / 3, 100),
      fullMark: 100 
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pollutant Levels Comparison
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="pollutant" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar 
              name="Pollutant Levels" 
              dataKey="value" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.6} 
            />
            <Tooltip 
              formatter={(value, name, props) => {
                // Type-safe conversion
                const numValue = typeof value === 'number' 
                  ? value 
                  : typeof value === 'string' 
                    ? parseFloat(value) 
                    : 0;
                
                const data = props.payload.payload;
                return [`${numValue.toFixed(2)}`, data.pollutant];
              }}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
export const AirQualityDashboard: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <AirQualityScoreChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <PollutantLevelsRadarChart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AirQualityDashboard;