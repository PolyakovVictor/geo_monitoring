// import React, { useState, useEffect } from 'react';
// import { Line, Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
// import { Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
// import axios from 'axios';

// // Register chart.js components
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// const AirQualityTrendChart: React.FC<{ locationId: number }> = ({ locationId }) => {
//   const [chartData, setChartData] = useState<any>(null);
//   const [detailedParameters, setDetailedParameters] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTrendData = async () => {
//       try {
//         const response = await axios.get(`http://localhost:8000/api/air-quality/location/${locationId}`);
//         const data = response.data.detailed_results;

//         setChartData({
//           labels: data.map((reading: any) => new Date(reading.timestamp).toLocaleDateString()),
//           datasets: [
//             {
//               label: 'Air Quality Score',
//               data: data.map((reading: any) => reading.air_quality_result.score),
//               fill: false,
//               backgroundColor: 'rgba(255, 99, 132, 0.2)',
//               borderColor: 'rgba(255, 99, 132, 1)',
//               borderWidth: 2,
//             },
//           ],
//         });

//         setDetailedParameters(
//           data.map((reading: any) => ({
//             timestamp: reading.timestamp,
//             ...reading.air_quality_result.detailed_parameters,
//           }))
//         );

//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching trend data', error);
//         setLoading(false);
//       }
//     };

//     fetchTrendData();
//   }, [locationId]);

//   if (loading) return <CircularProgress />;

//   return (
//     <Box>
//       <Typography variant="h5" gutterBottom>
//         Air Quality Trends for Location {locationId}
//       </Typography>
//       <Line
//         data={chartData}
//         options={{
//           responsive: true,
//           plugins: {
//             legend: {
//               position: 'top',
//             },
//             title: {
//               display: true,
//               text: `Air Quality Over Time for Location ${locationId}`,
//             },
//           },
//         }}
//       />
//       <Box mt={4}>
//         <Typography variant="h6" gutterBottom>
//           Detailed Parameters
//         </Typography>
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Date</TableCell>
//                 <TableCell>PM10</TableCell>
//                 <TableCell>NO2</TableCell>
//                 <TableCell>SO2</TableCell>
//                 <TableCell>CO</TableCell>
//                 <TableCell>Ozone</TableCell>
//                 <TableCell>Lead</TableCell>
//                 <TableCell>Cadmium</TableCell>
//                 <TableCell>Radiation</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {detailedParameters.map((param: any, index: number) => (
//                 <TableRow key={index}>
//                   <TableCell>{new Date(param.timestamp).toLocaleDateString()}</TableCell>
//                   <TableCell>{param.PM10}</TableCell>
//                   <TableCell>{param.NO2}</TableCell>
//                   <TableCell>{param.SO2}</TableCell>
//                   <TableCell>{param.CO}</TableCell>
//                   <TableCell>{param.Ozone}</TableCell>
//                   <TableCell>{param.Lead}</TableCell>
//                   <TableCell>{param.Cadmium}</TableCell>
//                   <TableCell>{param.Radiation}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Box>
//     </Box>
//   );
// };

// const AirQualityDashboard: React.FC = () => {
//   return (
//     <Box sx={{ padding: 4 }}>
//       <AirQualityTrendChart locationId={1} /> {/* Replace with dynamic location ID */}
//     </Box>
//   );
// };

// export default AirQualityDashboard;
