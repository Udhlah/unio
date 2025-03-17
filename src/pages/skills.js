import React, { useState, useEffect } from 'react';
import { Grid, FormControl, FormGroup, FormLabel, Paper, Typography, Box, Avatar, IconButton, Checkbox, FormControlLabel, Container, Fab, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Input} from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useAuth } from "../context/AuthContext.js";
import NavBar from '../components/navBar.js';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { useNavigate } from 'react-router-dom';
import { uploadPdfToFirebase, fetchPdfsFromFirebase, updatePdfLikesFirebase, deletePdfFromFirebase, db } from '../firebaseConfig.js'; // Import updatePdfLikesFirebase
import { uploadPdfToSupabase } from '../supabase/supabaseClient.js';
import { getDoc, doc, collection, addDoc } from 'firebase/firestore';
import AddCircleIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';

function Skills(){
    const { currentUser, userData, updateUserData } = useAuth();
    const navigate = useNavigate();
    const [pdfUploadOpen, setPdfUploadOpen] = useState(false);
    const [pdfTitle, setPdfTitle] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [uploadedPdfs, setUploadedPdfs] = useState([]);
    const [filterByDate, setFilterByDate] = useState(true);
    const [filterByPopularity, setFilterByPopularity] = useState(false);
    const [loading, setLoading] = useState(true);
    const [likes, setLikes] = useState({});
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pdfToDelete, setPdfToDelete] = useState(null);
    const [pdfCategory, setPdfCategory] = useState([]);
    const [pdfIndustry, setPdfIndustry] = useState([]);
    const [pdfSkills, setPdfSkills] = useState([]);


    useEffect(() => {
        // Set the background color for the entire page (body)
        document.body.style.backgroundColor = "#D1D0D0";  // Match login page
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.height = "100vh";
        document.body.style.overflow = "hidden";
        document.documentElement.style.height = "100%";


        const loadPdfs = async () => {
            setLoading(true);
            try {
                const fetchedPdfs = await fetchPdfsFromFirebase(); // Assuming this function gets the PDF list
                if (fetchedPdfs) {
                    // Fetch user information for each PDF
                    const postsWithUsernames = await Promise.all(
                        fetchedPdfs.map(async (pdf) => {
                            if (pdf.uploaderId) {
                                // Fetch user info from Firebase
                                const userDoc = await getDoc(doc(db, 'users', pdf.uploaderId));
                                if (userDoc.exists()) {
                                    // If the user exists, add user information to the PDF
                                    return {
                                        ...pdf,
                                        uploadedBy: userDoc.data().username || 'Unknown User',
                                        domain: userDoc.data().domain,
                                        location: userDoc.data().location,
                                        profileImage: userDoc.data().profileImage,
                                    };
                                }
                            }
                            // If uploaderId is not found, fallback to email or 'Unknown User'
                            return {
                                ...pdf,
                                uploadedBy: pdf.uploaderEmail || 'Unknown User',
                            };
                        })
                    );
                    setUploadedPdfs(postsWithUsernames); // Set updated PDFs with uploader info
                    const initialLikes = {};
                    postsWithUsernames.forEach((pdf) => {
                        initialLikes[pdf.id] = pdf.likes || [];
                    });
                    setLikes(initialLikes);
                }
            } catch (error) {
                console.error("Error fetching PDFs:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPdfs();
    }, []);

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

      const skills = [
        'Financial Management',
        'Marketing and Sales',
        'Communication',
        'Customer Service',
        'Leadership and Management',
        'Problem-Solving',
        'Time Management',
        'Project Management',
        'Adaptability',
        'Networking',
        'Creativity and Innovation',
        'Technological Literacy',
        'Industry-Specific Skills',
      ].sort((a, b) => {
        if (a === "Other") return 1;  // Push "Other" to the end
        if (b === "Other") return -1; // Push "Other" to the end
        return a.localeCompare(b);    // Normal alphabetical sorting
      });

    const handleOpenPdfUpload = () => {
        setPdfUploadOpen(true);
    };

    const handleClosePdfUpload = () => {
        setPdfUploadOpen(false);
        setPdfTitle('');
        setPdfFile(null);
        setPdfCategory([]);  // Reset category selections
        setPdfIndustry([]);  // Reset industry selections
        setPdfSkills([]);    // Reset skills selections
    };

    const handlePdfTitleChange = (event) => {
        setPdfTitle(event.target.value);
    };

    const handlePdfFileChange = (event) => {
        setPdfFile(event.target.files[0]);
    };

    const handleCategoryChange = (category) => {
        setPdfCategory((prev) =>
            prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
        );
    };

    const handleIndustryChange = (industry) => {
        setPdfIndustry((prev) =>
            prev.includes(industry) ? prev.filter((item) => item !== industry) : [...prev, industry]
        );
    };

    const handleSkillsChange = (skill) => {
        setPdfSkills((prev) =>
            prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill]
        );
    };

    const handleUploadPdf = async () => {
        if (pdfFile && pdfTitle && pdfCategory.length && pdfIndustry.length && pdfSkills.length) {
            setLoading(true);
            try {
                const uploadedPdf = await uploadPdfToSupabase(pdfFile, pdfTitle, currentUser, pdfCategory, pdfIndustry, pdfSkills);
                if (uploadedPdf) {
                    setUploadedPdfs((prevPdfs) => [...prevPdfs, uploadedPdf]);
                    setLikes(prevLikes => ({ ...prevLikes, [uploadedPdf.id]: [] })); // Initialize likes as an empty array
                    handleClosePdfUpload();
                } else {
                    alert('Failed to upload PDF.');
                }
            } catch (error) {
                console.error("Error uploading PDF:", error);
                alert('Failed to upload PDF.');
            } finally {
                setLoading(false);
            }
        } else {
            alert('Please provide a title, category, industry, skills, and select a PDF file.');
        }
    };

    const handlePdfClick = (pdf) => {
        if (pdf.url) {
            window.open(pdf.url, '_blank');
        } else {
            alert("PDF URL is missing.");
        }
    };


    const handleFilterByDateChange = (event) => {
        setFilterByDate(event.target.checked);
        if (event.target.checked) {
            setFilterByPopularity(false);
        }
    };

    const handleFilterByPopularityChange = (event) => {
        setFilterByPopularity(event.target.checked);
        if (event.target.checked) {
            setFilterByDate(false);
        }
    };

    const handleLike = async (pdfId) => {
        console.log("userdata", userData);
        const userId = userData?.uid; // Replace with actual user ID logic
        const currentLikes = likes[pdfId] || [];

        if (currentLikes.includes(userId)) {
            // User already liked, remove like
            const updatedLikes = currentLikes.filter(id => id !== userId);
            setLikes(prevLikes => ({ ...prevLikes, [pdfId]: updatedLikes }));
            await updatePdfLikesFirebase(pdfId, updatedLikes);
        } else {
            // User hasn't liked, add like
            const updatedLikes = [...currentLikes, userId];
            setLikes(prevLikes => ({ ...prevLikes, [pdfId]: updatedLikes }));
            await updatePdfLikesFirebase(pdfId, updatedLikes);
        }
    };

    const sortAndFilterPdfs = (pdfs) => {
        // Filter PDFs based on categories, industries, and skills
        const filteredPdfs = pdfs.filter((pdf) => {
            const categoryMatch = pdfCategory.length === 0 || pdf.category.some(cat => pdfCategory.includes(cat));
            const industryMatch = pdfIndustry.length === 0 || pdf.industry.some(ind => pdfIndustry.includes(ind));
            const skillsMatch = pdfSkills.length === 0 || pdf.skills.some(skill => pdfSkills.includes(skill));
            return categoryMatch && industryMatch && skillsMatch;
        });
    
        // Sort PDFs by date or popularity
        if (filterByDate) {
            return filteredPdfs.sort((a, b) => new Date(b.time) - new Date(a.time)); // Sort by date, newest first
        }
    
        if (filterByPopularity) {
            return filteredPdfs.sort((a, b) => (b.likes || []).length - (a.likes || []).length); // Sort by popularity, most liked first
        }
    
        return filteredPdfs; // Return filtered PDFs if no sorting is applied
    };

    const sortedPdfs = sortAndFilterPdfs(uploadedPdfs); // Define sortedPdfs here
            
const handleDeletePdf = (pdfId, pdfUrl) => {
    setPdfToDelete({ id: pdfId, url: pdfUrl });  // Store the PDF to delete
    setDeleteDialogOpen(true);  // Open the delete confirmation dialog
};

const handleNavigate = (domain) => {
    navigate(`/${domain}`)
}

return (
    <div style={{ backgroundColor: '#ddd', minHeight: '100vh', display: 'flex', flexDirection: 'column', margin: 0, overflow: 'hidden' }}>
        <NavBar />
        <Box sx={{ marginTop: 8}} />
        <Container style={{ flexGrow: 1, padding: 0, height: 'calc(100vh - 90px)', overflow: 'hidden' }}>
            <Grid container spacing={2} style={{ margin: 0, width: '100%', height: '100%' }}>
                <Grid item xs={12} sm={3} style={{ height: '100%' }}>
                    {/* Dashboard-like filter section with scrollable content */}
                    <Paper
                        sx={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '20px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            height: '90%',
                            overflowY: 'auto', // Only enable vertical scrolling for the filter section
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            The Skills Network
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            Filter By
                        </Typography>
                        <FormControlLabel
                            control={<Checkbox checked={filterByDate} onChange={handleFilterByDateChange} />}
                            label="Date"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={filterByPopularity} onChange={handleFilterByPopularityChange} />}
                            label="Popularity"
                        />
                        {/* Category Filter */}
                        <FormControl component="fieldset" sx={{ mt: 2 }}>
                            <FormLabel component="legend">Category</FormLabel>
                            <FormGroup>
                                {categories.map((category) => (
                                    <FormControlLabel
                                        key={category}
                                        control={<Checkbox checked={pdfCategory.includes(category)} onChange={() => handleCategoryChange(category)} />}
                                        label={category}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>

                        {/* Industry Filter */}
                        <FormControl component="fieldset" sx={{ mt: 2 }}>
                            <FormLabel component="legend">Industry</FormLabel>
                            <FormGroup>
                                {industries.map((industry) => (
                                    <FormControlLabel
                                        key={industry}
                                        control={<Checkbox checked={pdfIndustry.includes(industry)} onChange={() => handleIndustryChange(industry)} />}
                                        label={industry}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>

                        {/* Skills Filter */}
                        <FormControl component="fieldset" sx={{ mt: 2 }}>
                            <FormLabel component="legend">Skills Taught</FormLabel>
                            <FormGroup>
                                {skills.map((skill) => (
                                    <FormControlLabel
                                        key={skill}
                                        control={<Checkbox checked={pdfSkills.includes(skill)} onChange={() => handleSkillsChange(skill)} />}
                                        label={skill}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={9} style={{ height: '100%', overflowY: 'auto' }}>
                    <Grid container spacing={2} style={{ height: '100%', overflowY: 'auto' }}>
                        {loading ? (
                            <Grid item xs={12}>
                                <Typography variant="body1">Loading...</Typography>
                            </Grid>
                        ) : (
                            // Apply filters and sorting before rendering PDFs
                            sortAndFilterPdfs(uploadedPdfs).map((pdf, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Paper
                                        sx={{
                                            height: '400px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                            padding: '16px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                        }}
                                    >
                                        {/* Delete Button */}
                                        {currentUser?.uid === pdf.uploaderId && (
                                            <IconButton
                                                onClick={() => handleDeletePdf(pdf.id, pdf.url)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    backgroundColor: 'white',
                                                    '&:hover': { backgroundColor: '#f8d7da' },
                                                }}
                                            >
                                                <DeleteForeverIcon color="black" />
                                            </IconButton>
                                        )}

                                        {/* Content: User info at the top, title and date at the bottom */}
                                        <div>
                                            {/* Upper Section: Profile Image, Posted by, Location */}
                                            <Box display="flex" alignItems="center" mb={2} onClick={()=>handleNavigate(pdf.domain)}>
                                                {pdf.profileImage && (
                                                    <Avatar
                                                        src={pdf.profileImage}
                                                        alt={pdf.uploadedBy}
                                                        sx={{ width: 32, height: 32, marginRight: 1, borderRadius: '50%', border: '2px solid black' }}
                                                    />
                                                )}
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {pdf.uploadedBy}
                                                    </Typography>
                                                    {pdf.location && (
                                                        <Typography variant="caption" color="textSecondary">
                                                            Based in {pdf.location}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>

                                            {/* PDF Title and Date */}
                                            <div>
                                                <Typography
                                                    variant="body1"
                                                    fontWeight="bold"
                                                    noWrap
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handlePdfClick(pdf)}
                                                >
                                                    {pdf.title}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {pdf.time && !isNaN(Date.parse(pdf.time))
                                                        ? new Date(pdf.time).toLocaleString()
                                                        : 'Invalid Date'}
                                                </Typography>
                                            </div>
                                        </div>

                                        {/* Preview */}
                                        {pdf.url && (
                                            <Box
                                                sx={{
                                                    marginTop: '8px',
                                                    height: '250px',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {pdf.url.endsWith('.pdf') ? (
                                                    <iframe
                                                        src={pdf.url}
                                                        title="PDF Preview"
                                                        style={{ width: '100%', height: '100%' }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={pdf.url}
                                                        alt="PDF Preview"
                                                        style={{
                                                            maxWidth: '100%',
                                                            maxHeight: '100%',
                                                            objectFit: 'contain',
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        )}

                                        {/* Display Category, Industry, Skills Taught Tags */}
                                        <Box display="flex" justifyContent="space-between" sx={{ mt: 2, flexWrap: 'nowrap' }}>
                                            {pdf.category && (
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        display: 'inline',
                                                        marginRight: 1,
                                                        wordBreak: 'break-word',
                                                    }}
                                                >
                                                    <span style={{ fontWeight: 'bold' }}>Category:</span> {pdf.category.join(', ')}
                                                </Typography>
                                            )}
                                            {pdf.industry && (
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        display: 'inline',
                                                        marginRight: 1,
                                                        wordBreak: 'break-word',
                                                    }}
                                                >
                                                    <span style={{ fontWeight: 'bold' }}>Industry:</span> {pdf.industry.join(', ')}
                                                </Typography>
                                            )}
                                            {pdf.skills && (
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        display: 'inline',
                                                        wordBreak: 'break-word',
                                                    }}
                                                >
                                                    <span style={{ fontWeight: 'bold' }}>Skills Taught:</span> {pdf.skills.join(', ')}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Like Button */}
                                        <Box display="flex" justifyContent="flex-end" mt={2}>
                                            <IconButton onClick={() => handleLike(pdf.id)}>
                                                {likes[pdf.id]?.includes(userData?.uid) ? (
                                                    <ThumbUpIcon style={{ color: '#4d76e4' }} />
                                                ) : (
                                                    <ThumbUpOffAltIcon style={{ color: '#4d76e4' }} />
                                                )}
                                                <Typography variant="caption" sx={{ ml: 0.5 }}>
                                                    {likes[pdf.id]?.length || 0}
                                                </Typography>
                                            </IconButton>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    
            {/* Floating Action Button */}
            <IconButton
                color="default"
                aria-label="add"
                sx={{
                    position: 'fixed',
                    bottom:  35,
                    right: 35,
                    backgroundColor: '#2B2B2B',
                    color: 'white', // Ensure the icon is white
                    '&:hover': {
                    backgroundColor: '#444444', // Darker background on hover
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)', // Subtle shadow on hover
                    transform: 'translateY(-2px)', // slightly move the button upwards on hover
                    },
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease', // Smooth transition
                    width: '45px', // Adjust the size
                    height: '45px', // Adjust the size
                }}
                onClick={() => setPdfUploadOpen(true)}
                >
                <AddCircleIcon sx={{ fontSize: 30 }} /> {/* Increase icon size */}
                </IconButton>
    
            {/* Dialog for PDF upload */}
            <Dialog open={pdfUploadOpen} onClose={handleClosePdfUpload}>
                <DialogTitle>Upload PDF</DialogTitle>
                <DialogContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="PDF Title"
                        type="text"
                        fullWidth
                        value={pdfTitle}
                        onChange={handlePdfTitleChange}
                    />
                    <IconButton
                        color="default"
                        aria-label="attach file"
                        onClick={() => document.getElementById('file-upload').click()} // Trigger hidden input
                        sx={{ marginLeft: '8px' }} // Add some spacing
                    >
                        <AttachFileIcon />
                    </IconButton>
                    <input
                        type="file"
                        id="file-upload"
                        style={{ display: 'none' }}
                        onChange={handlePdfFileChange}
                    />
                    </Box>
                        {/* Categories Checklist */}
                        <FormControl component="fieldset" margin="normal" fullWidth>
                            <FormLabel component="legend">Categories</FormLabel>
                            <FormGroup>
                                {categories.map((category) => (
                                    <FormControlLabel
                                        key={category}
                                        control={<Checkbox checked={pdfCategory.includes(category)} onChange={() => handleCategoryChange(category)} />}
                                        label={category}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>
    
                        {/* Industries Checklist */}
                        <FormControl component="fieldset" margin="normal" fullWidth>
                            <FormLabel component="legend">Industries</FormLabel>
                            <FormGroup>
                                {industries.map((industry) => (
                                    <FormControlLabel
                                        key={industry}
                                        control={<Checkbox checked={pdfIndustry.includes(industry)} onChange={() => handleIndustryChange(industry)} />}
                                        label={industry}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>
    
                        {/* Skills Checklist */}
                        <FormControl component="fieldset" margin="normal" fullWidth>
                            <FormLabel component="legend">Skills Taught</FormLabel>
                            <FormGroup>
                                {skills.map((skill) => (
                                    <FormControlLabel
                                        key={skill}
                                        control={<Checkbox checked={pdfSkills.includes(skill)} onChange={() => handleSkillsChange(skill)} />}
                                        label={skill}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>
                    <Typography variant="caption" color="error" sx={{ marginTop: '8px' }}>
                        Please note that only PDFs are accepted in the Skills Network. Any other file types will be removed.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePdfUpload} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleUploadPdf} color="primary">
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
    
            {/*Dialog for PDF Delete*/}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Are you sure you want to delete this PDF?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
                    <Button
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const success = await deletePdfFromFirebase(pdfToDelete.id, pdfToDelete.url);
                                if (success) {
                                    setUploadedPdfs((prevPdfs) => prevPdfs.filter((pdf) => pdf.id !== pdfToDelete.id));
                                } else {
                                    alert("Failed to delete PDF.");
                                }
                            } catch (error) {
                                console.error("Error deleting PDF:", error);
                                alert("Failed to delete PDF.");
                            } finally {
                                setLoading(false);
                                setDeleteDialogOpen(false);  // Close dialog after action
                            }
                        }}
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
    }
    
    export default Skills;
    