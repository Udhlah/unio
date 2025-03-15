import React, { useEffect } from "react";
import { Box } from "@mui/material";
import NavBar from "../components/navBar.js"; // Import the navbar

function Dashboard() {
  useEffect(() => {
    // Set the background color for the entire page (body)
    document.body.style.backgroundColor = "#D1D0D0";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";
    document.documentElement.style.height = "100%";

    // Cleanup when component unmounts
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
    <Box 
      sx={{
        height: "100vh", // Full viewport height
        display: "flex",
      }}
    >
      <NavBar />
      <Box
        sx={{
          flexGrow: 1, // Expands to fill remaining space
          padding: "20px", // Optional padding
        }}
      >
        <p>Dashboard</p>
      </Box>
    </Box>
  );
}

export default Dashboard;
