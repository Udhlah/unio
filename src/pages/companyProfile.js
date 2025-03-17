import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Grid,
  Paper,
  Button,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import NavBar from "../components/navBar.js";
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig.js'; // Adjust path as needed
import { doc, getDoc } from 'firebase/firestore';
import { fetchCompanyProfile, checkFollowingStatus, handleFollowToggle } from '../firebase/firebaseFx.js'; // Assuming you have this file
import ProfileTabs from "../components/profileTabs.js";
import Divider from "@mui/material/Divider";
import NotFound from './notFound.js';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PeopleIcon from '@mui/icons-material/People';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import {useAuth} from '../context/AuthContext.js';
import emailjs from "@emailjs/browser"; 
import {reqCollaborate} from '../firebase/fbCollaborate.js'
import { followUser, unfollowUser } from '../firebase/firebaseFx.js';

function CompanyProfile() {
const {currentUser, userData } = useAuth()
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState("");
  const { domain } = useParams();
    const navigate = useNavigate();
    const [myDomain, setMyDomain] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [openCollaborate, setOpenCollaborate] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [files, setFiles] = useState([]);
    const [filePreview, setFilePreview] = useState(null);
    const [followers, setFollowers] = useState(0)
    const [subject, setSubject] = useState(`Collaboration Opportunity: {{your_company_name}} & {{their_company_name}}` || '')
    const [message, setMessage] = useState(`
        Dear {{their_company_email}},
    
        My name is {{your_name}} and I'm the {{your_title}} at {{your_company_name}}. We at {{your_company_name}} specialize in {{your_company_specialization}} and have been following the work of {{their_company_name}} with great interest, particularly your {{specific_mention}}.
    
        We believe there's a strong potential for collaboration between {{your_company_name}} and {{their_company_name}}. At {{your_company_name}}, we've developed expertise in {{your_company_strengths}}. We see a clear synergy with {{their_company_name}}'s {{their_company_strengths}}, and we believe a partnership between our two companies could create significant value for both.
    
        Specifically, we at {{your_company_name}} are interested in exploring opportunities in {{potential_collaboration_areas}}. We believe our combined strengths at {{your_company_name}} and {{their_company_name}} could lead to {{potential_benefits}}.
    
        Would you be open to a brief introductory call sometime next week to discuss potential collaboration opportunities between {{your_company_name}} and {{their_company_name}} in more detail? Please let me know what time works best for you.
    
        Thank you for your time and consideration. We at {{your_company_name}} look forward to the possibility of working together with {{their_company_name}}.
    
        Sincerely,
        {{your_name}}
        {{your_title}}
    
        {{your_company_name}}
        {{your_website}}
        {{your_phone_number}}` || '');
        const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    const checkFollowingStatus = () => {
      if (userData && companyData && companyData.follower) {
        setIsFollowing(companyData.follower.includes(userData.uid));
        setFollowerCount(companyData.follower.length);
      }
    };

    checkFollowingStatus();
  }, [companyData, userData]);

  const toggleFollow = async () => {
    if (!userData) {
      console.error("User data is not available.");
      return;
    }

    try {
        if (isFollowing) {
            await unfollowUser(userData.uid, companyData.id);
            setFollowerCount(prevCount => prevCount - 1); // Update local state
            setIsFollowing(false);
          } else {
            await followUser(userData.uid, companyData.id);
            setFollowerCount(prevCount => prevCount + 1); // Update local state
            setIsFollowing(true);
          }

      // Fetch updated company data after follow/unfollow
      const updatedCompanyDoc = await getDoc(doc(db, 'companies', companyData.id));
      if (updatedCompanyDoc.exists()) {
        const updatedCompanyData = updatedCompanyDoc.data();
        setFollowerCount(updatedCompanyData.follower.length);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

        useEffect(() => {
            if (companyData) {
                setMessage(
`Dear ${companyData.email},

My name is {{your_name}} and I'm the {{your_title}} at ${userData.username}. We at ${userData.username} specialize in {{your_company_specialization}} and have been following the work of ${companyData.username} with great interest, particularly your {{specific_mention}}.

We believe there's a strong potential for collaboration between ${userData.username} and ${companyData.username}. At ${userData.username}, we've developed expertise in {{your_company_strengths}}. We see a clear synergy with ${companyData.username}'s {{their_company_strengths}}, and we believe a partnership between our two companies could create significant value for both.

Specifically, we at ${userData.username} are interested in exploring opportunities in {{potential_collaboration_areas}}. We believe our combined strengths at ${userData.username} and ${companyData.username} could lead to {{potential_benefits}}.

Would you be open to a brief introductory call sometime next week to discuss potential collaboration opportunities between ${userData.username} and ${companyData.username} in more detail? Please let me know what time works best for you.

Thank you for your time and consideration. We at ${userData.username} look forward to the possibility of working together with ${companyData.username}.

Sincerely,
{{your_name}}
{{your_title}}

${userData.username}
${userData.website}
${userData.number}` || '');
                setSubject(`Collaboration Opportunity: ${userData.username} & ${companyData.username}`)
            }
            
        }, [companyData, userData]); 


    useEffect(() => {
        const fetchMyDomain = async () => {
            if (auth.currentUser) {
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (userDoc.exists()) {
                    setMyDomain(userDoc.data().domain);
                }
            }
            setIsLoading(false);
        };

        fetchMyDomain();
    }, []);
    useEffect(() => {
        if (auth.currentUser && companyData) {
            checkFollowingStatus(auth.currentUser.uid, companyData.uid, setIsFollowing);
          }
        if (!isLoading) {
            if (myDomain && domain === myDomain) {
                navigate('/profile', { replace: true });
            } else if (domain) {
                console.log('domain', domain);
                // Fetch company profile logic here
            }
        }
    }, [domain, myDomain, navigate, isLoading, companyData]);

  useEffect(() => {
    document.body.style.backgroundColor = "#D1D0D0";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.height = "100vh";
    document.body.style.overflow = "auto";
    document.documentElement.style.height = "100%";
    console.log('domain', domain)

    const fetchProfile = async () => {
      try {
        setLoading(true);
       
        const fetchedData = await fetchCompanyProfile(domain);
        if(fetchedData){
          setCompanyData(fetchedData);
          setFollowers(fetchedData.follower.length)
          setBannerUrl(fetchedData.bannerImage);
        } else {
          setCompanyData(null);
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
        setCompanyData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.height = "";
      document.body.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, [domain]); // Fetch data when companyUsername changes

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!companyData) {
    return <NotFound/>;
  }

  
  const StyledButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#1976d2', // Primary blue color
    color: 'white',
    padding: theme.spacing(1, 2),
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: '#1565c0', // Darker blue on hover
    },
    '& .MuiSvgIcon-root': {
      marginLeft: theme.spacing(1), // Changed to marginLeft
    },
    textTransform: 'none', // Prevent uppercase text transformation
  }));

  const handleOpenCollaborate = () => {
    setOpenCollaborate(true)
  }
  const handleCloseCollaborate = () => {
    setOpenCollaborate(false)
  }

  const handleMessageChange = (e) => {
    setMessage(e.target.value)
  }

  const handleSubjectChange = (e) => {
    setSubject(e.target.value)
  }
const handleSend = async () => {
    if (!subject || !message) {
        alert("Subject and Message are required.");
        return;
    }

    const templateParams = {
        subject: subject,
        message: message,
        toEmail: companyData.email,
    };

    try {
        const response = await emailjs.send(
            "service_7g69lc2",
            "template_0latvm9",
            templateParams,
            "jTM8uckvxfQ4_fg4W"
        );
        alert("Email sent successfully!");
        console.log("Email sent successfully", response);
        handleCloseCollaborate()
        reqCollaborate(userData.uid, companyData.uid)
    } catch (error) {
        console.error("Error sending email:", error);
        alert("Failed to send email.");
    }
}

const formatFollowerCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  
  return (
    <Box sx={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      <NavBar />
      <Box sx={{ backgroundColor: "#D1D0D0", padding: "20px", marginTop: "20px", flexGrow: 1 }}>
        <Paper
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "30px",
            margin: "20px auto",
            width: "90%",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "250px",
              backgroundImage: `url(${bannerUrl || "/default-banner.jpg"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "8px",
              marginBottom: "20px",
              position: "relative",
            }}
          />
          <Grid container alignItems="flex-start" spacing={2}>
            <Grid item xs={3} sm={2} md={1}>
              <Box
                sx={{
                  width: "210px",
                  height: "210px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid black",
                  position: "relative",
                  marginTop: "-130px",
                  marginLeft: "50px",
                }}
              >
                <Avatar
                  src={companyData && companyData.profileImage ? companyData.profileImage : "/default-avatar.jpg"}
                  alt={companyData && companyData.username ? companyData.username : ""}
                  sx={{ width: "100%", height: "100%", borderRadius: "50%" }}
                />
              </Box>
            </Grid>
            <Grid container alignItems="center">
              <Grid item xs={7} sm={8} md={9} sx={{ marginLeft: "300px", marginTop: "-100px" }}>
                <Typography variant="h6" fontWeight="bold">
                  {companyData.username}
                </Typography>
                <Typography variant="body2">Based in {companyData.location}</Typography>
                <Typography variant="body2">{companyData.email}</Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                sx={{
                    display: "flex",
                    justifyContent: "flex-end", // Aligns buttons left
                    gap: 2, // Adds space between buttons
                    mt: -14, // Adjusted for banner overlap
                    ml: 3, // Adds left margin to position properly
                }}
                >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={toggleFollow}
                        sx={{
                            width: { xs: "140px", sm: "180px" },
                            backgroundColor: isFollowing ? "#ff4d4d" : "#1976d2",
                            "&:hover": { backgroundColor: isFollowing ? "#cc0000" : "#155a9f" },
                            fontSize: { xs: "14px", sm: "16px" },
                            fontWeight: "bold",
                        }}
                        endIcon={<PeopleIcon />}
                    >
                        {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    <Typography
                        variant="body2"
                        sx={{
                            marginTop: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '1.2rem',
                            gap: '4px', // Add gap between text and icon
                        }}
                    >
                        {formatFollowerCount(followerCount)}
                        <PeopleIcon sx={{ fontSize: '0.9rem' }} /> {/* Adjust icon size */}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    sx={{
                    height: "50%",
                    width: { xs: "140px", sm: "180px" },
                    backgroundColor: "#2e7d32",
                    "&:hover": { backgroundColor: "#1b5e20" },
                    fontSize: { xs: "14px", sm: "16px" },
                    fontWeight: "bold",
                    }}
                    onClick={handleOpenCollaborate}
                    endIcon={<WorkspacesIcon />}
                >
                    Collaborate
                </Button>
                <Dialog open={openCollaborate} onClose={handleCloseCollaborate} maxWidth="md" fullWidth>
                    <DialogTitle>Collaborate</DialogTitle>
                    <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Subject Field with Attachment Icon */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Subject"
                                type="text"
                                value={subject}
                                onChange={handleSubjectChange}
                                sx={{ flexGrow: 1 }} // Makes the text field take up most space
                            />
                        </Box>

                        {/* Message Field */}
                        <TextField
                            margin="dense"
                            label="Message"
                            value={message}
                            type="text"
                            multiline
                            rows={15}
                            fullWidth
                            onChange={handleMessageChange}
                        />
                    </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseCollaborate} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSend} color="primary">
                            Send
                        </Button>
                    </DialogActions>
                </Dialog>
                </Grid>
              <Grid item xs={12} sx={{ marginTop: "20px", marginLeft: "100px" }}>
                <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: "10px" }}>
                  About Us
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {companyData.about}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Divider variant="middle" sx={{ borderWidth: "1px" }} />
          <Grid container spacing={2} sx={{ paddingTop: 1 }}>
            <Grid item xs={12} md={8}>
              <ProfileTabs currentUser={companyData.uid} data={companyData} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ backgroundColor: "#f0f0f0", borderRadius: "8px", padding: "15px", marginBottom: "15px" }}>
                <Typography variant="h6">Contacts</Typography>
                <Typography variant="body2">{companyData.email}</Typography>
                <Typography variant="body2">{companyData.number}</Typography>
                <Typography variant="body2">{companyData.address}</Typography>
                <Typography variant="body2">
                  <a href={companyData.website} target="_blank" rel="noopener noreferrer">
                    {companyData.website}
                  </a>
                </Typography>
                <Typography variant="body2">{companyData.socials}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}

export default CompanyProfile;