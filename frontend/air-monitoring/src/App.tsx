import React from "react";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";

const App: React.FC = () => {
    return (
        <Layout>
            <Dashboard />
        </Layout>
    );
};

export default App;
