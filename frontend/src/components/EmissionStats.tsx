import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Container, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Grid,
  Chip,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import FilterListIcon from '@mui/icons-material/FilterList';
import { format } from 'date-fns';

interface AirQualityLocation {
  location_id: number;
  air_quality: {
    score: number;
    description: string;
    health_recommendation: string;
  };
}

const getChipColor = (description: string) => {
  switch (description) {
    case 'Відмінна': return 'success';
    case 'Добра': return 'primary';
    case 'Задовільна': return 'warning';
    case 'Погана': return 'error';
    case 'Небезпечна': return 'error';
    default: return 'default';
  }
};

export const AirQualityLocationsComponent: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [locations, setLocations] = useState<AirQualityLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      
      // Отримання списку локацій
      const locationsResponse = await axios.get('http://localhost:8000/api/locations');
      const locationIds = locationsResponse.data.map((loc: any) => loc.id);

      // Перевірка, чи є locationIds
      if (locationIds.length === 0) {
        console.error('Не знайдено жодної локації');
        return;
      }

      // Формування параметрів запиту
      const params = new URLSearchParams();
      locationIds.forEach((location_id: any) => params.append('location_ids', location_id));
      
      if (startDate) {
        params.append('start_date', format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
      }
      if (endDate) {
        params.append('end_date', format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
      }

      // Виконання запиту з правильними параметрами
      const airQualityResponse = await axios.get(
        'http://localhost:8000/api/air-quality/comparative-analysis', 
        { params }
      );

      setLocations(airQualityResponse.data.comparative_analysis);
    } catch (error) {
      console.error('Помилка завантаження даних:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleFilter = () => {
    fetchLocations();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Моніторинг забруднення атмосфери
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: 'center', 
          gap: 2, 
          mb: 3 
        }}>
          <DatePicker 
            label="Початкова дата" 
            value={startDate} 
            onChange={(newValue) => setStartDate(newValue)} 
            slotProps={{ 
              textField: { 
                fullWidth: true,
                variant: 'outlined'
              } 
            }} 
          />
          <DatePicker 
            label="Кінцева дата" 
            value={endDate} 
            onChange={(newValue) => setEndDate(newValue)} 
            slotProps={{ 
              textField: { 
                fullWidth: true,
                variant: 'outlined'
              } 
            }} 
          />
          <Button 
            variant="contained" 
            startIcon={<FilterListIcon />}
            onClick={handleFilter}
            disabled={isLoading}
            sx={{ 
              height: '56px', 
              minWidth: '120px' 
            }}
          >
            {isLoading ? 'Завантаження...' : 'Фільтр'}
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Локації</TableCell>
                  <TableCell>Рівень забруднення</TableCell>
                  <TableCell>Опис</TableCell>
                  <TableCell>Рекомендації</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.location_id}>
                    <TableCell>{location.location_id}</TableCell>
                    <TableCell>
                      <Chip 
                        label={location.air_quality.score.toFixed(2)} 
                        color={getChipColor(location.air_quality.description)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography>{location.air_quality.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {location.air_quality.health_recommendation}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default AirQualityLocationsComponent;