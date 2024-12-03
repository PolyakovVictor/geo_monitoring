import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Charts from "./components/Charts";
import EmissionStats from './components/EmissionStats'

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/emission" element={<EmissionStats />}/>
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
