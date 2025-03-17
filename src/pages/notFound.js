import React, { useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import backgroundImage from "../unio-login.png";
import { Link } from 'react-router-dom';

function NotFound() {
  useEffect(() => {
    document.body.style.backgroundImage = `url(${backgroundImage})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.transformOrigin = "center";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.margin = 0;
    document.body.style.padding = 0;
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";

    document.documentElement.style.height = "100%";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.transformOrigin = "";
      document.body.style.backgroundAttachment = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.height = "";
      document.body.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, []);

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        height: '100vh',
        color: 'black',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)', // 75% opacity black background
          padding: 3,
          borderRadius: 2,
          width: 'auto',  // Make the width auto to fit the text
          maxWidth: '90%', // Optional: Control the max width
        }}
      >
        <Typography variant="h5" gutterBottom style={{ color: 'white' }}>
          404 - Oops!
        </Typography>
        <Typography variant="h7" paragraph style={{ color: 'white' }}>
          Unio thought it was algae and ate the page. 🐚  
        </Typography>
        <Link to="/" style={{ color: 'lightblue' }}>
          Let's swim back to the main stream.
        </Link>
      </Box>
    </Container>
  );
}

export default NotFound;