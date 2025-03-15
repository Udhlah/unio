import React, { useState } from "react"
import { Typography, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { userSignUp } from "../firebase/fblogin";
import { Snackbar, Slide } from '@mui/material';

function SignupCard() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openError, setOpenError] = useState(false)
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('')
  const handleSignInClick = () => {
    navigate("/"); // Navigate to the SignIn page
  };
  const handleUsername = (e) => {
    setUsername(e.target.value);
    console.log("Updated Username:", e.target.value);
  };
  
  const handleEmail = (e) => {
    setEmail(e.target.value);
    console.log("Updated Email:", e.target.value);
  };
  
  const handlePassword = (e) => {
    setPassword(e.target.value);
    console.log("Updated Password:", e.target.value);
  };

  const handleSignUp = async () => {
    try {
      if (username != null && email != null && password != null) {
        const result = await userSignUp(username, email, password); // Ensure userSignUp is awaited
        if (result.success) {
          console.log('SignUp Successful');
          setOpen(true); // Open the Snackbar on success
        } else {
          console.log('SignUp Failed:', result.error);
          setError(result.error)
          setOpenError(true)
        }
      } else {
        setError('Missing parameters!')
        setOpenError(true)
      }
    } catch (error) {
      console.log('Error during SignUp:', error);
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
    <div style={{ width: "350px", position: "relative" }}>
      {/* Centered Title */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
        <Typography variant="h5"
        sx = {{
          color: '#3D4127'
        }}
        ><b>Create your account
          </b></Typography>
      </div>

      {/* Input Fields */}
      <TextField fullWidth label="Company Name" margin="dense" variant="standard" 
      onChange={(e) => handleUsername(e)}/>
      <TextField fullWidth label="Email" margin="dense" variant="standard" onChange={(e) => handleEmail(e)}/>
      <TextField fullWidth label="Password" type="password" margin="dense" variant="standard" onChange={(e) => handlePassword(e)}/>

      {/* Sign Up Button (Main Focus) */}
      <Button 
        fullWidth 
        variant="contained" 
        sx={{ 
          backgroundColor: "#000000", 
          color: "white", 
          fontWeight: "bold",
          borderRadius: "8px",
          marginTop: "8px",
          "&:hover": { backgroundColor: "#5C4E4E" }
        }}
        onClick={() => handleSignUp()}
        >
        Sign Up
      </Button>
      <Snackbar
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition} // Slide transition
        message="Successfully signed up! 🎉"
        autoHideDuration={3000} // Automatically hides after 3 seconds
      />
      <Snackbar
        open={openError}
        onClose={handleCloseError}
        TransitionComponent={Transition} // Slide transition
        message={error}
        autoHideDuration={3000} // Automatically hides after 3 seconds
      />

      {/* Sign In Button - Bottom Right */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
        <Button 
          onClick={handleSignInClick} 
          sx={{ 
            backgroundColor: "transparent", 
            color: "#2B2B2B", 
            textTransform: "none", 
            fontSize: "14px",
            "&:hover": { backgroundColor: "transparent", textDecoration: "underline" }
          }}>
          Already have an account? Sign In
        </Button>
      </div>
    </div>
  );
}

export default SignupCard;
