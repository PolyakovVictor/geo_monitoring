import React, { useEffect, useState } from "react";
import { Typography, Box, Card, CardContent } from "@mui/material";
import axios from "axios";

const Dashboard: React.FC = () => {
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/simulation/regions").then((response) => {
      setRegions(response.data);
    });
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Regional Pollution Overview
      </Typography>
      {regions.map((region, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{region.region}</Typography>
            <Typography>
              Pollutants:{" "}
              {region.data.map((item: any) => item.pollutant).join(", ")}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default Dashboard;
