import React, {useState} from 'react'
import { TextField, Button, Typography } from "@mui/material";
import { Snackbar, Slide } from '@mui/material';
import { useNavigate } from "react-router-dom";
import {userSignIn} from '../firebase/fblogin';
function SigninCard() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false)
  const [openError, setOpenError] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const handleSignUpClick = () => {
    navigate("/signup"); // Navigate to the SignUp page
  };

  const handleEmail = (e) => {
    setEmail(e.target.value)
  }
  const handlePassword = (e) => {
    setPassword(e.target.value)
  }

  const handleSignIn = async () => {
    try {
      if (email != null && password != null) {
        const result = await userSignIn(email, password);  // Call your sign-in function
        if (result.success) {
          navigate('/dashboard')
        } else {
          console.log('SignIn failed:', result.error);
        }
      } else {
        setOpenError(false)
      }
    } catch (error) {
      console.error('Error in handleSignIn:', error);
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
    <div style={{ width: "350px" }}>
      {/* Centered Typography */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "8px" }}>
      <Typography variant="h5"
        sx = {{
          color: '#3D4127'
        }}
        ><b>Sign In
          </b></Typography>
      </div>

      {/* Input Fields */}
      <TextField fullWidth label="Email" margin="dense" variant="standard" 
      onChange={(e) => handleEmail(e)}
      />
      <TextField fullWidth label="Password" type="password" margin="dense" variant="standard" 
      onChange={(e) => handlePassword(e)}
      />

      {/* Buttons */}
      <div style={{ display: "flex", marginTop: '8px' }}>
        {/* Sign In - More Prominent */}
        <Button 
          fullWidth 
          variant="contained" 
          sx={{ 
            width: "100%", // Slightly larger than Sign Up
            backgroundColor: "#000000",
            color: "white",
            fontWeight: "bold", // Bolder text
            fontSize: "1rem", // Slightly bigger text
            borderRadius: "8px", // Slightly rounded
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", // Subtle shadow
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
        TransitionComponent={Transition} // Slide transition
        message='Welcome back!'
        autoHideDuration={3000} // Automatically hides after 3 seconds
      />
      <Snackbar
        open={openError}
        onClose={handleCloseError}
        TransitionComponent={Transition} // Slide transition
        message="Missing Parameters!"
        autoHideDuration={3000} // Automatically hides after 3 seconds
      />

      </div>

      {/* New Text - 'If you don't have an account' */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
        <Button 
          onClick={handleSignUpClick} 
          sx={{ 
            backgroundColor: "transparent", 
            color: "#2B2B2B", 
            textTransform: "none", 
            fontSize: "14px",
            "&:hover": { backgroundColor: "transparent", textDecoration: "underline" }
          }}>
          If you don't have an account? Sign Up
        </Button>
      </div>
    </div>
  );
}

export default SigninCard;
