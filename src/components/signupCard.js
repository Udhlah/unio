import React, { useState } from "react";
import { Typography, TextField, Button, Snackbar, Slide } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { userSignUp } from "../firebase/fblogin";

function SignupCard() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [openSignUp, setSignUp] = useState(false);

  const handleSignInClick = () => {
    navigate("/"); // Navigate to the SignIn page
  };

  const handleUsername = (e) => {
    setUsername(e.target.value);
  };

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleSignUp = async () => {
    try {
      if (username && email && password) {
        setSignUp(true);
        const result = await userSignUp(username, email, password);
        if (result.success) {
          setOpen(true); // Open Snackbar on success
        } else {
          setError(result.error);
          setOpenError(true);
        }
      } else {
        setError("Missing parameters!");
        setOpenError(true);
      }
    } catch (error) {
      setError("An error occurred during sign up.");
      setOpenError(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const handleCloseError = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenError(false);
  };

  const Transition = (props) => {
    return <Slide {...props} direction="right" />;
  };

  return (
    <div
      style={{
        width: "350px",
        position: "absolute",
        top: "50%",
        right: "10%",
        transform: "translateY(-50%)",
        padding: "16px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Centered Title */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
        <Typography variant="h5">
          <b>Create your account</b>
        </Typography>
      </div>

      {/* Input Fields */}
      <TextField
        fullWidth
        label="Company Name"
        margin="dense"
        variant="outlined"
        onChange={handleUsername}
        sx={{ marginBottom: "12px" }}
      />
      <TextField
        fullWidth
        label="Email"
        margin="dense"
        variant="outlined"
        onChange={handleEmail}
        sx={{ marginBottom: "12px" }}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="dense"
        variant="outlined"
        onChange={handlePassword}
        sx={{ marginBottom: "12px" }}
      />

      {/* Sign Up Button (Main Focus) */}
      <Button
        fullWidth
        variant="contained"
        sx={{
          backgroundColor: "#000000",
          color: "white",
          fontWeight: "bold",
          borderRadius: "8px",
          marginTop: "12px",
          "&:hover": { backgroundColor: "#5C4E4E" },
        }}
        onClick={handleSignUp}
      >
        Sign Up
      </Button>

      <Snackbar
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        message="Successfully signed up! 🎉"
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} // Bottom left
      />
      <Snackbar
        open={openError}
        onClose={handleCloseError}
        TransitionComponent={Transition}
        message={error}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} // Bottom left
      />
      <Snackbar
        open={openSignUp}
        onClose={handleCloseError}
        TransitionComponent={Transition}
        message="Verification email sent. Please check your inbox."
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} // Bottom left
      />
      {/* Sign In Button - Bottom Right */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
        <Button
          onClick={handleSignInClick}
          sx={{
            backgroundColor: "transparent",
            color: "#2B2B2B",
            textTransform: "none",
            fontSize: "14px",
            "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
          }}
        >
          Already have an account? Sign In
        </Button>
      </div>
    </div>
  );
}

export default SignupCard;