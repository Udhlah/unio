import * as React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, TextField, Stack, InputAdornment  } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from "@mui/icons-material/Search";


export default function TopNavBar() {
  const navigate = useNavigate();

  // Navigation function
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#2B2B2B", paddingX: 2 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left side: Logo or App Name */}
        <Typography variant="h5" sx={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => handleNavigation('/dashboard')}>
          unio
        </Typography>
        <TextField
            variant="outlined"
            placeholder="Search..."
            size="small"
            sx={{ width: "80%", maxWidth: 300, backgroundColor: "white", borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        {/* Center: Navigation Links */}
        <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          onClick={() => handleNavigation("/dashboard")}
          sx={{
            color: "white",
            textTransform: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: "12px",
          }}
        >
          <HomeWorkIcon sx={{ fontSize: 24, marginTop: "2px" }} />
          home.
        </Button>

        <Button
          onClick={() => handleNavigation("/profile")}
          sx={{
            color: "white",
            textTransform: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: "12px",
          }}
        >
          <SchoolIcon sx={{ fontSize: 24, marginTop: "2px" }} />
          skills.
        </Button>

        <Button
          onClick={() => handleNavigation("/profile")}
          sx={{
            color: "white",
            textTransform: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: "12px",
          }}
        >
          <AccountBoxIcon sx={{ fontSize: 24, marginTop: "2px" }} />
          me.
        </Button>

        </Box>

        {/* Right side: Logout or Profile Button */}
        <Button onClick={() => handleNavigation('/logout')} sx={{ color: "white", textTransform: "none", fontWeight: "bold" }}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
