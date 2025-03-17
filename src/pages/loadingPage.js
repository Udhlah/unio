import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress, styled } from '@mui/material';

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100vw',
  background: 'black', // Set initial background to black
  color: 'white',
  fontFamily: theme.typography.fontFamily,
  margin: 0,
  padding: 0,
}));

const LoadingCircle = styled(CircularProgress)(({ theme }) => ({
  color: 'white',
  marginBottom: theme.spacing(3),
}));

const CompanyName = styled(Typography)(({ theme }) => ({
  fontSize: '2em',
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const Location = styled(Typography)(({ theme }) => ({
  fontSize: '1em',
}));

function LoadingPage() {
  useEffect(() => {
    // Set the background color for the entire page (body)
    document.body.style.backgroundColor = "#D1D0D0"; // Match login page
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";
    document.documentElement.style.height = "100%";

    // Cleanup function to reset styles (optional)
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.height = "";
      document.body.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, []);

  return (
    <LoadingContainer>
      <Box textAlign="center">
        <CompanyName variant="h4">unio</CompanyName>
        <Location variant="subtitle1">Based In Singapore</Location>
      </Box>
      <LoadingCircle size={60} />
    </LoadingContainer>
  );
}

export default LoadingPage;