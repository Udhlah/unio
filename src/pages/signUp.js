import React, { useEffect } from "react";
import { Container } from "@mui/material";
import SignupCard from "../components/signupCard";
import backgroundImage from "../unio-login.png"

function SignUp() {
  useEffect(() => {
    // Set the background image
    document.body.style.backgroundImage = `url(${backgroundImage})`; // Ensure the image is in the public folder
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.backgroundImage = "";
    };
  }, []);

  return (
    <Container maxWidth="sm" sx={{
      marginTop: '10%', 
      marginLeft: '55%'
    }}>
      <SignupCard />
    </Container>
  );
}

export default SignUp;
