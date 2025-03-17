import * as React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, TextField, Stack, InputAdornment } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from '@mui/icons-material/Logout';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SearchBar from './searchBar';
import { useAuth } from '../context/AuthContext'

export default function TopNavBar() {
    const { currentUser, userData, updateUserData } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Get current location

    // Navigation function
    const handleNavigation = async (path) => {
        await navigate(path);
        navigate(0)
    };

    // Helper function to check if the current path matches the button's path
    const isCurrentPath = (path) => {
        return location.pathname === path;
    };

    return (
        <AppBar position="fixed" sx={{ backgroundColor: "#2B2B2B", paddingX: 2 }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* Left side: Logo or App Name */}
                <Typography variant="h5" sx={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => handleNavigation('/dashboard')}>
                    unio
                </Typography>
                <SearchBar />
                {/* Center: Navigation Links */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                        onClick={() => handleNavigation("/dashboard")}
                        sx={{
                            color: isCurrentPath("/dashboard") ? "black" : "white",
                            backgroundColor: isCurrentPath("/dashboard") ? "white" : "transparent",
                            textTransform: "none",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            fontSize: "12px",
                            '&:hover': {
                                backgroundColor: 'white',
                                color: 'black',
                            },
                        }}
                    >
                        <HomeWorkIcon sx={{ fontSize: 24, marginTop: "2px" }} />
                        home.
                    </Button>
                    <Button
                        onClick={() => handleNavigation("/for-you-page")}
                        sx={{
                            color: isCurrentPath("/for-you-page") ? "black" : "white",
                            backgroundColor: isCurrentPath("/for-you-page") ? "white" : "transparent",
                            textTransform: "none",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            fontSize: "12px",
                            '&:hover': {
                                backgroundColor: 'white',
                                color: 'black',
                            },
                        }}
                    >
                        <WhatshotIcon sx={{ fontSize: 24, marginTop: "2px" }} />
                        fyp.
                    </Button>

                    <Button
                        onClick={() => handleNavigation("/skills")}
                        sx={{
                            color: isCurrentPath("/skills") ? "black" : "white",
                            backgroundColor: isCurrentPath("/skills") ? "white" : "transparent",
                            textTransform: "none",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            fontSize: "12px",
                            '&:hover': {
                                backgroundColor: 'white',
                                color: 'black',
                            },
                        }}
                    >
                        <SchoolIcon sx={{ fontSize: 24, marginTop: "2px" }} />
                        skills.
                    </Button>

                    <Button
                        onClick={() => handleNavigation("/profile")}
                        sx={{
                            color: isCurrentPath("/profile") ? "black" : "white",
                            backgroundColor: isCurrentPath("/profile") ? "white" : "transparent",
                            textTransform: "none",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            fontSize: "12px",
                            '&:hover': {
                                backgroundColor: 'white',
                                color: 'black',
                            },
                        }}
                    >
                        <AccountBoxIcon sx={{ fontSize: 24, marginTop: "2px" }} />
                        me.
                    </Button>
                </Box>

                {/* Right side: Logout or Profile Button */}
                <Button
                    onClick={() => handleNavigation("/")}
                    sx={{
                        color: "white",
                        textTransform: "none",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        fontSize: "12px",
                        '&:hover': {
                            backgroundColor: 'white',
                            color: 'black',
                        },
                    }}
                >
                    <LogoutIcon sx={{ fontSize: 24, marginTop: "2px" }} />
                    {userData.username}
                </Button>
            </Toolbar>
        </AppBar>
    );
}