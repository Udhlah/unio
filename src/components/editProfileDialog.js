import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  FormControl,
  Grid,
  Divider
} from '@mui/material';

export default function EditProfileDialog ({ openEditProfile, handleCloseEditProfile, handleEditProfile, userData, newUsername, handleNewUsername, newLocation, setNewLocation, newAddress, setNewAddress, newNumber, setNewNumber, newWebsite, setNewWebsite, newSocials, setNewSocials, newAbout, setNewAbout, newDomain }) {
    const categories = [
        'Manufacturing',
        'Other',
        'Research and Development',
        'Retail',
        'Service',
        'Mining'
      ].sort((a, b) => {
        if (a === "Other") return 1;  // Push "Other" to the end
        if (b === "Other") return -1; // Push "Other" to the end
        return a.localeCompare(b);    // Normal alphabetical sorting
      });
      
      const industries = [
        'Agriculture',
        'Architectural',
        'Automotive',
        'Banking and Finance',
        'Marketing and Sales',
        'Digital',
        'Education',
        'Entertainment',
        'Food and Beverages',
        'Hospitality and Accommodation',
        'Legal',
        'Livestock',
        'Medical',
        'Other',
        'Real Estate',
        'Technology',
        'Environment',
        'Textile',
        'Transportation',
        'Aquaculture',
      ].sort((a, b) => {
        if (a === "Other") return 1;  
        if (b === "Other") return -1; 
        return a.localeCompare(b);
      });

  const [selectedCategories, setSelectedCategories] = useState(userData?.categories || []);
  const [selectedIndustries, setSelectedIndustries] = useState(userData?.industries || []);

  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleIndustryChange = (industry) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== industry));
    } else {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  const handleSave = () => {
    handleEditProfile({
      ...userData,
      categories: selectedCategories,
      industries: selectedIndustries,
    });
    console.log(selectedCategories, selectedIndustries)
    handleCloseEditProfile();
  };

  return (
    <Dialog open={openEditProfile} 
    onClose={handleCloseEditProfile} 
    fullWidth 
    maxWidth="lg"  // Options: 'xs', 'sm', 'md', 'lg', 'xl'
    sx={{
      '& .MuiDialog-paper': {
        width: '90vw',  // Make the dialog take 90% of viewport width
        maxWidth: '1200px',  // Set a max width for large screens
      }
    }}>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent sx={{ padding: '20px' }}>
        <TextField label="Username" value={newUsername} onChange={(e) => handleNewUsername(e)} fullWidth required margin="normal" />
        <TextField label="Domain" value={newDomain} fullWidth margin="normal" required disabled />
        <TextField label="Email" value={userData.email} fullWidth margin="normal" disabled />
        <Grid container spacing={2} alignItems="flex-start">
            {/* Categories Column (1/5 of the width) */}
            <Grid item xs={12} md={2.5}> 
                <FormControl component="fieldset" margin="normal" fullWidth>
                    <FormLabel component="legend">Categories</FormLabel>
                    <FormGroup>
                        {categories.map((category) => (
                            <FormControlLabel
                                key={category}
                                control={<Checkbox checked={selectedCategories.includes(category)} onChange={() => handleCategoryChange(category)} />}
                                label={category}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
            </Grid>

            {/* Divider */}
            <Grid item xs={12} md={0.5}>
                <Divider orientation="vertical" flexItem />
            </Grid>

            {/* Industries Column (4/5 of the width, split into 4 sub-columns) */}
            <Grid item xs={12} md={9}>
                <FormControl component="fieldset" margin="normal" fullWidth>
                    <FormLabel component="legend">Industries</FormLabel>
                    <Grid container spacing={1}> 
                        {industries.map((industry) => (
                            <Grid item xs={12} sm={6} md={3} key={industry}> {/* Now divided into 4 columns */}
                                <FormControlLabel
                                    control={<Checkbox checked={selectedIndustries.includes(industry)} onChange={() => handleIndustryChange(industry)} />}
                                    label={industry}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </FormControl>
            </Grid>
        </Grid>

        <TextField label="Location" value={newLocation} required onChange={(e) => setNewLocation(e.target.value)} fullWidth margin="normal" />
        <TextField label="Address" value={newAddress} required onChange={(e) => setNewAddress(e.target.value)} fullWidth margin="normal" />
        <TextField label="Contact Number" value={newNumber} required onChange={(e) => setNewNumber(e.target.value)} fullWidth margin="normal" type="tel" />
        <TextField label="Website" value={newWebsite} onChange={(e) => setNewWebsite(e.target.value)} fullWidth margin="normal" />
        <TextField label="Socials Handles" value={newSocials} onChange={(e) => setNewSocials(e.target.value)} fullWidth margin="normal" />
        <TextField label="About" required value={newAbout} onChange={(e) => setNewAbout(e.target.value)} fullWidth margin="normal" multiline rows={4} />

        

      </DialogContent>
      <DialogActions sx={{ padding: '20px' }}>
        <Button onClick={handleCloseEditProfile} color="secondary" sx={{ marginRight: '10px' }}>
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};