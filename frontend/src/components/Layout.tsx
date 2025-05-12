import React from "react";
import { AppBar, Toolbar, Typography, Container, Button } from "@mui/material";
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Air Monitoring System
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/charts">
            Charts
          </Button>
          <Button color="inherit" component={Link} to="/emission">
            Emission Stats
          </Button>
          <Button color="inherit" component={Link} to="/predict">
            Predict
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout;
