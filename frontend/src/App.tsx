import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AirQualityDashboard from "./components/Dashboard";
import Charts from "./components/Charts";
import AirQualityLocationsComponent from './components/EmissionStats'
import ModelPrediction from './components/ModelPrediction';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<AirQualityDashboard />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/emission" element={<AirQualityLocationsComponent />}/>
          <Route path="/predict" element={<ModelPrediction />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
