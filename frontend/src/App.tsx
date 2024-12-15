import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PollutionComparisonChart from "./components/Dashboard";
import Charts from "./components/Charts";
import EmissionStats from './components/EmissionStats'

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<PollutionComparisonChart />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/emission" element={<EmissionStats />}/>
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
