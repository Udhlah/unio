import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from "@mui/material";
import { Snackbar, Slide } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { userSignIn } from '../firebase/fblogin';

function SigninCard() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleSignIn = async () => {
    try {
      if (email && password) {
        const result = await userSignIn(email, password);
        if (result.success) {
          navigate('/dashboard');
          setOpen(true);
        } else {
          console.log('SignIn failed:', result.error);
          setErrorMessage(result.error);
          setOpenError(true);
        }
      } else {
        setErrorMessage("Please enter both email and password.");
        setOpenError(true);
      }
    } catch (error) {
      console.error('Error in handleSignIn:', error);
      setErrorMessage("An unexpected error occurred.");
      setOpenError(true);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSignIn();
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  const Transition = (props) => {
    return <Slide {...props} direction="right" />;
  };

  return (
    <div style={{
      width: "350px",
      position: "absolute",
      top: "50%",
      right: "10%",
      transform: "translateY(-50%)",
      padding: "16px",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
    }}>
      <Box
        sx={{
          padding: '8px 16px',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '-10px',
        }}
      >
        <Typography variant="h5" sx={{ color: 'black' }}><b>Sign In</b></Typography>
      </Box>

      <Box
        sx={{
          padding: 3,
          borderRadius: 2,
          color: 'black',
        }}
      >
        <TextField fullWidth label="Email" margin="dense" variant="standard"
          onChange={(e) => handleEmail(e)}
          InputLabelProps={{ style: { color: 'black' } }}
          InputProps={{ style: { color: 'black' } }}
        />
        <TextField fullWidth label="Password" type="password" margin="dense" variant="standard"
          onChange={(e) => handlePassword(e)}
          onKeyPress={handleKeyPress}
          InputLabelProps={{ style: { color: 'black' } }}
          InputProps={{ style: { color: 'black' } }}
        />

        <div style={{ display: "flex", marginTop: '8px' }}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              width: "100%",
              backgroundColor: "#000000",
              color: "white",
              fontWeight: "bold",
              fontSize: "1rem",
              borderRadius: "8px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              "&:hover": {
                backgroundColor: "#5C4E4E",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)"
              }
            }}
            onClick={() => handleSignIn()}
          >
            Sign In
          </Button>

          <Snackbar
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
            message='Welcome back!'
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} // Bottom left
          />
          <Snackbar
            open={openError}
            onClose={handleCloseError}
            TransitionComponent={Transition}
            message={errorMessage}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} // Bottom left
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
          <Button
            onClick={handleSignUpClick}
            sx={{
              backgroundColor: "transparent",
              color: "black",
              textTransform: "none",
              fontSize: "14px",
              "&:hover": { backgroundColor: "transparent", textDecoration: "underline" }
            }}
          >
            If you don't have an account? Sign Up
          </Button>
        </div>
      </Box>
    </div>
  );
}

export default SigninCard;