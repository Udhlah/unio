import React, { useEffect, useState } from "react";
import { Box, Avatar, Typography, Button, Grid, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Paper, IconButton } from "@mui/material";
import NavBar from "../components/navBar.js"; // Import the navbar
import { useAuth } from "../context/AuthContext.js";
import EditIcon from '@mui/icons-material/Edit';
import { editProfile } from '../firebase/fbprofile.js';
import { uploadImage } from '../supabase/supabaseClient.js'

function Profile() {
  const { currentUser, userData, loading, updateUserData } = useAuth();
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newAbout, setNewAbout] = useState("");
  const [date, setDate] = useState('')
  const [imageUrl, setImageUrl] = useState("");

    
  useEffect(() => {
    // Set the background color for the entire page (body)
    document.body.style.backgroundColor = "#D1D0D0";  // Match login page
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.height = "100vh";
    document.body.style.overflow = "auto";
    document.documentElement.style.height = "100%";
    console.log(userData)
    if (userData) {
      setNewUsername(userData.username);
      setNewEmail(userData.email);
      setNewLocation(userData.location);
      setNewAddress(userData.address);
      setNewNumber(userData.number);
      setNewAbout(userData.about);
      const createdAtDate = new Date(userData.createdAt); // Use 'new' keyword
        const formattedDate = createdAtDate.toLocaleDateString("en-US"); // Corrected locale
        setDate(formattedDate);
    }

    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.height = "";
      document.body.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, [userData]);

  const handleCloseEditProfile = () => {
    setOpenEditProfile(false);
  };

  const handleEditProfile = async () => {
    try {
      const updatedData = {
        username: newUsername,
        location: newLocation,
        address: newAddress,
        number: newNumber,
        about: newAbout,
        profileImage: imageUrl, // Save the image URL after uploading to Google Drive
      };
      
      await editProfile(currentUser.uid, updatedData);
      updateUserData(updatedData);
      setOpenEditProfile(false);
      console.log("Profile saved successfully");
    } catch (error) {
      console.log('Error', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const filePath = `public/${file.name}`; // Define the path in your bucket
      const uploadedUrl = await uploadImage(file, 'profile-images', filePath);

      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
        //update the user data with the new image url.
        if (currentUser) {
          updateUserData({profileImage: uploadedUrl});
        }
      } else {
        console.log("image upload failed");
      }
    }
    } 

  return (
    <Box sx={{ height: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <NavBar />

      {/* Profile Content */}
      <Box sx={{ backgroundColor: '#D1D0D0', minHeight: '100vh', padding: '20px', marginTop: '20px', width: '1' }}>
      {/* Main Content Container */}
      <Paper
        sx={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          margin: '20px auto',
          width: '90%',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Profile Header Container */}
        <Grid container alignItems="center" sx={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <Grid item xs={3}>
          <Avatar
                src={userData && userData.profileImage ? userData.profileImage : '/default-avatar.jpg'}
                alt={userData && userData.username ? userData.username : ''}
                sx={{ width: 100, height: 100, backgroundColor: '#f0f0f0', cursor: 'pointer' }}
                onClick={() => document.getElementById('image-upload').click()} // Trigger file input
            />
            <input
                type="file"
                id="image-upload"
                style={{ display: 'none' }}
                onChange={handleImageUpload} // Attach the upload handler
            />
          </Grid>
          <Grid item xs={7}>
            <Typography variant="h6" fontWeight="bold">
              {userData.username}
            </Typography>
            <Typography variant="body2">Based in {userData.location}</Typography>
            <Typography variant="body2">{userData.email}</Typography>
          </Grid>
          <Grid item xs={2} textAlign="right">
            <IconButton onClick={() => setOpenEditProfile(true)}>
                <EditIcon  />
            </IconButton>    
          </Grid>
          <Grid item xs={12} sx={{ marginTop: '10px' }}>
            <Typography variant="body2">
              {userData.about}
            </Typography>
          </Grid>
        </Grid>
        <Dialog open={openEditProfile} onClose={handleCloseEditProfile}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent sx={{ padding: '20px' }}> {/* Add padding to DialogContent */}
            <TextField
            label="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            fullWidth
            margin="normal"
            />
            <TextField
            label="Email"
            value={userData.email}
            fullWidth
            margin="normal"
            disabled
            />
            <TextField
            label="Location"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            fullWidth
            margin="normal"
            />
            <TextField
            label="Address"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            fullWidth
            margin="normal"
            />
            <TextField
            label="Contact Number"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            fullWidth
            margin="normal"
            type="tel"
            />
            <TextField
            label="About"
            value={newAbout}
            onChange={(e) => setNewAbout(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            />
        </DialogContent>
        <DialogActions sx={{ padding: '20px' }}> {/* Add padding to DialogActions */}
            <Button onClick={handleCloseEditProfile} color="secondary" sx={{ marginRight: '10px' }}> {/* Add right margin to Cancel */}
            Cancel
            </Button>
            <Button onClick={handleEditProfile} color="primary">
            Save
            </Button>
        </DialogActions>
        </Dialog>

        {/* Tabs Container */}
        <Box sx={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
          <Typography sx={{ padding: '10px 15px', cursor: 'pointer' }}>Posts</Typography>
          <Typography sx={{ padding: '10px 15px', cursor: 'pointer' }}>Comments</Typography>
          <Typography sx={{ padding: '10px 15px', cursor: 'pointer' }}>Likes</Typography>
        </Box>

        {/* Example Post and Contacts */}
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Paper sx={{ backgroundColor: '#f0f0f0', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
              <Grid container alignItems="center" sx={{ marginBottom: '10px' }}>
                <Grid item xs={2}>
                  <Avatar sx={{ width: 40, height: 40, backgroundColor: '#d0d0d0' }} />
                </Grid>
                <Grid item xs={10}>
                  <Typography variant="subtitle2" fontWeight="bold">{userData.username}</Typography>
                  <Typography variant="caption">Based In {userData.location}</Typography>
                  <Typography variant="caption" sx={{ marginLeft: '5px' }}></Typography>
                </Grid>
              </Grid>
              <Typography variant="body2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eleifend dolor urna, quis tincidunt ante consectetur non. Mauris congue neque vestibulum, semper metus et, accumsan felis. Proin luctus leo arcu, vitae ultrices mauris consequat quis. Aliquam fringilla mi quam, ut placerat risus auctor eu. Nunc et vestibulum ex. Vivamus eu viverra metus.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ backgroundColor: '#f0f0f0', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
              <Typography variant="h6">Contacts</Typography>
              <Typography variant="body2">{userData.email}</Typography>
              <Typography variant="body2">{userData.number}</Typography>
              <Typography variant="body2">{userData.address}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
    </Box>
  );
}

export default Profile;
