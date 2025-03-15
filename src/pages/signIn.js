import React, { useEffect } from "react";
import { Container } from "@mui/material";
import SigninCard from "../components/signinCard";
import backgroundImage from "../unio-login.png";

function SignIn() {
  useEffect(() => {
    // Set the background image for the entire page (body)
    document.body.style.backgroundImage = `url(${backgroundImage})`; // Add your image URL here
    document.body.style.backgroundSize = "cover"; // Ensure the image covers the entire background
    document.body.style.backgroundPosition = "center"; // Center the image
    document.body.style.backgroundAttachment = "fixed"; // Ensure the image stays fixed while scrolling
    document.body.style.margin = 0;  // Remove default margin
    document.body.style.padding = 0; // Remove default padding
    document.body.style.height = "100vh"; // Ensure body takes full height
    document.body.style.overflow = "hidden"; // Prevent scrolling

    // Set html to take full height as well
    document.documentElement.style.height = "100%"; // Ensure full height for html

    // Clean up the effect when the component unmounts
    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundAttachment = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.height = "";
      document.body.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, []);

  return (
    <Container maxWidth="sm" sx={{
      marginTop: '10%', 
      marginLeft: '55%'
    }}>
      <SigninCard />
    </Container>
  );
}

export default SignIn;
