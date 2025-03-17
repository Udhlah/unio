import React, { useEffect, useState } from "react";
import { Box, Avatar, Typography, Button, Grid, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Paper, IconButton } from "@mui/material";
import NavBar from "../components/navBar.js"; // Import the navbar
import { useAuth } from "../context/AuthContext.js";
import EditIcon from '@mui/icons-material/Edit';
import { editProfile } from '../firebase/fbprofile.js';
import { uploadImage } from '../supabase/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import ProfileTabs from '../components/profileTabs.js';
import EditProfileDialog from "../components/editProfileDialog.js";
import Divider from '@mui/material/Divider';
import { useLoaderData } from "react-router-dom";
import CollaborationCard from '../components/collaborationCard.js'

function Profile() {
  const { currentUser, userData, loading, updateUserData } = useAuth();
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newAbout, setNewAbout] = useState("");
  const [userUid, setUserUid] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newSocials, setNewSocials] = useState("");
  const [newDomain, setNewDomain] =useState("");
  const [newIndustries, setNewIndustries] = useState([]);
  const [newCategories, setNewCategories] = useState([]);
  const [error, setError] = useState('');
  const [helperText, setHelperText] = useState('');

  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  useEffect(() => {
    // Set the background color for the entire page (body)
    document.body.style.backgroundColor = "#D1D0D0";  // Match login page
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.height = "100vh";
    document.body.style.overflow = "auto";
    document.documentElement.style.height = "100%";

    if (userData) {
      setNewUsername(userData.username);
      setNewEmail(userData.email);
      setNewLocation(userData.location);
      setNewAddress(userData.address);
      setNewNumber(userData.number);
      setNewAbout(userData.about);
      setNewWebsite(userData.website);
      setNewSocials(userData.socials);
      setNewDomain(userData.domain);
      setNewIndustries(userData.industries);
      setNewCategories(userData.categories);
      const createdAtDate = new Date(userData.createdAt);
      const formattedDate = createdAtDate.toLocaleDateString("en-US");
      setDate(formattedDate);
      setUserUid(userData.uid)
      setBannerUrl(userData.bannerImage);
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
    const handleNewUsername = (e) => {
      const username = e.target.value; // Get the value from the event
      setNewUsername(username); // Update the username state
      const generatedDomain = username // Use the updated username
          .toLowerCase()
          .replace(/\s+/g, '-');
      setNewDomain(generatedDomain); // Update the domain state
  };
  const handleCloseEditProfile = () => {
    setOpenEditProfile(false);
  };

  const handleEditProfile = async (updatedData) => {
    try {
      const updatedProfileData = {
        ...updatedData,
        username: newUsername,
        location: newLocation,
        address: newAddress,
        number: newNumber,
        about: newAbout,
        website: newWebsite,
        socials: newSocials,
        domain: newDomain,
      };
      await editProfile(currentUser.uid, updatedProfileData);
      updateUserData(updatedProfileData);
      setOpenEditProfile(false);
      console.log("Profile saved successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };
  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const userId = currentUser?.uid;
      const uniqueFilename = `${uuidv4()}`;
      const extension = file.name.split('.').pop();
      const filePath = `profile-images/users/${userId}/${uniqueFilename}.${extension}`;
      const uploadedUrl = await uploadImage(file, 'profile-images', filePath, userId);
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
        if (currentUser) {
          updateUserData({ profileImage: uploadedUrl });
        }
      } else {
        console.log('image upload failed');
      }
    } else {
      console.log('No file selected.');
    }
  };

  const handleBannerUpload = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const userId = currentUser?.uid;
      const uniqueFilename = `${uuidv4()}`;
      const extension = file.name.split('.').pop();
      const filePath = `banner-images/users/${userId}/${uniqueFilename}.${extension}`;
      const uploadedUrl = await uploadImage(file, 'banner-images', filePath, userId);
      if (uploadedUrl) {
        setBannerUrl(uploadedUrl);
        if (currentUser) {
          updateUserData({ bannerImage: uploadedUrl });
        }
      } else {
        console.log('Banner upload failed');
      }
    } else {
      console.log('No file selected.');
    }
  };

  const formatCategoriesAndIndustries = (categories, industries) => {
    const formattedCategories = categories?.map((category) => `#${category}`).join(' ');
    const formattedIndustries = industries?.map((industry) => `#${industry}`).join(' ');

    if (formattedCategories && formattedIndustries) {
      return `${formattedCategories} ${formattedIndustries}`;
    } else if (formattedCategories) {
      return formattedCategories;
    } else if (formattedIndustries) {
      return formattedIndustries;
    } else {
      return '';
    }
  };

  const formattedTags = formatCategoriesAndIndustries(userData?.categories, userData?.industries);


  return (
    <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* Sidebar */}
      <NavBar />

      {/* Profile Content */}
      <Box sx={{ backgroundColor: '#D1D0D0', padding: '20px', marginTop: '20px', flexGrow: 1 }}>
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
          {/* Banner Image */}
          <Box
            sx={{
              width: '100%',
              height: '250px',
              backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none', // Use backgroundImage for URL
              backgroundColor: bannerUrl ? 'transparent' : '#D3D3D3', 
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '8px',
              marginBottom: '20px',
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={() => document.getElementById('banner-upload').click()}
          >
            <input
              type="file"
              id="banner-upload"
              style={{ display: 'none' }}
              onChange={handleBannerUpload}
            />
          </Box>
          <Grid container alignItems="flex-start" spacing={2}>
            <Grid item xs={3} sm={2} md={1}>
              <Box
                sx={{
                  width: '210px', // Adjusted to match image
                  height: '210px', // Adjusted to match image
                  backgroundColor: '#f0f0f0',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid black',
                  position: 'relative',
                  marginTop: '-130px', // Adjust to overlap banner
                  marginLeft: '50px',
                }}
              >
                <Avatar
                  src={userData && userData.profileImage ? userData.profileImage : '/default-avatar.jpg'}
                  alt={userData && userData.username ? userData.username : ''}
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                  }}
                  onClick={() => document.getElementById('image-upload').click()}
                />
                <input
                  type="file"
                  id="image-upload"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </Box>
            </Grid>
          <Grid container alignItems="center">
            <Grid item xs={7} sm={8} md={9} sx={{marginLeft: '300px' , marginTop: '-100px'}}>
              <Typography variant="h6" fontWeight="bold">
                {userData.username}
              </Typography>
              <Typography variant="body2">Based in {userData.location}</Typography>
              <Typography variant="body2">{userData.email}</Typography>
            </Grid>

            <Grid item xs={2} sm={2} md={2} textAlign="right" sx={{marginTop: '-140px', marginLeft:'auto', display: 'flex', justifycontent: 'flex-end'}}>
              <IconButton onClick={() => setOpenEditProfile(true)}>
                <EditIcon />
              </IconButton>
            </Grid>

            <Grid item xs={12} sx={{ marginTop: '20px', marginLeft:'100px' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: '10px' }}>
                About Us
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {userData.about}
              </Typography>
              {formattedTags && (
                <Typography variant="body2" sx={{ marginTop: '10px' }}>
                  {formattedTags}
                </Typography>
        )}
            </Grid>
          </Grid>
          </Grid>

          {/* Edit Profile Dialog */}
          <EditProfileDialog
              openEditProfile={openEditProfile}
              handleCloseEditProfile={handleCloseEditProfile}
              handleEditProfile={handleEditProfile}
              userData={userData}
              newUsername={newUsername}
              handleNewUsername={handleNewUsername}
              newLocation={newLocation}
              setNewLocation={setNewLocation}
              newAddress={newAddress}
              setNewAddress={setNewAddress}
              newNumber={newNumber}
              setNewNumber={setNewNumber}
              newWebsite={newWebsite}
              setNewWebsite={setNewWebsite}
              newSocials={newSocials}
              setNewSocials={setNewSocials}
              newAbout={newAbout}
              setNewAbout={setNewAbout}
              newDomain={userData?.domain} // or pass the domain from somewhere
            />

          {/* Tabs Container */}
          <Divider variant="middle" sx={{borderWidth: '1px', marginTop: '50px'}}/>
          <Grid container spacing={2} sx={{ paddingTop: 1 }}>
            <Grid item xs={12} md={8}>
            <ProfileTabs currentUser={userUid} data={userData} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ backgroundColor: '#f0f0f0', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
                <Typography variant="h6">Contacts</Typography>
                <Typography variant="body2">{userData.email}</Typography>
                <Typography variant="body2">{userData.number}</Typography>
                <Typography variant="body2">{userData.address}</Typography>
                <Typography variant="body2">
                  <a href={userData.website} target="_blank" rel="noopener noreferrer">
                    {userData.website}
                  </a>
                </Typography>
                <Typography variant="body2">{userData.socials}</Typography>
              </Paper>
              <Paper>
              <CollaborationCard userData={userData}/>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}

export default Profile;