import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';
import axios from 'axios';

const ModelPrediction: React.FC = () => {
  const [inputData, setInputData] = useState({
    pm2_5: '',
    pm10: '',
    nitrogen_dioxide: '',
    sulfur_dioxide: '',
    carbon_monoxide: '',
    ozone: '',
    lead: '',
    cadmium: '',
    radiation_level: '',
  });
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/predict/', {
        pm2_5: parseFloat(inputData.pm2_5),
        pm10: parseFloat(inputData.pm10),
        nitrogen_dioxide: parseFloat(inputData.nitrogen_dioxide),
        sulfur_dioxide: parseFloat(inputData.sulfur_dioxide),
        carbon_monoxide: parseFloat(inputData.carbon_monoxide),
        ozone: parseFloat(inputData.ozone),
        lead: parseFloat(inputData.lead),
        cadmium: parseFloat(inputData.cadmium),
        radiation_level: parseFloat(inputData.radiation_level),
      });
      setPrediction(response.data.prediction[0]);
    } catch (error) {
      console.error('Error making prediction:', error);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Model Prediction
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
        {Object.keys(inputData).map((key) => (
          <TextField
            key={key}
            label={key.replace('_', ' ').toUpperCase()}
            name={key}
            value={inputData[key as keyof typeof inputData]}
            onChange={handleChange}
            type="number"
            fullWidth
          />
        ))}
        <Button variant="contained" onClick={handlePredict} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Predict'}
        </Button>
      </Box>
      {prediction !== null && (
        <Box mt={4}>
          <Typography variant="h6">Prediction Result</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Predicted Air Quality Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{prediction}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default ModelPrediction;
