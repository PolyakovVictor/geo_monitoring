import React from "react";
import { AppBar, Toolbar, Typography, Container } from "@mui/material";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">Air Monitoring System</Typography>
                </Toolbar>
            </AppBar>
            <Container style={{ marginTop: "20px" }}>{children}</Container>
        </>
    );
};

export default Layout;
