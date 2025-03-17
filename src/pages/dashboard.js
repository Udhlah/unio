import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Typography,
  TextField,
  Box,
  Button,
  Paper,
  Toolbar,
  Tooltip,} from '@mui/material';
import { useAuth } from "../context/AuthContext.js";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NavBar from "../components/navBar.js"; // Import the navbar
import CloseIcon from '@mui/icons-material/Close';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {publishPost, fetchPosts} from '../supabase/supabaseClient.js';
import { ImageCarousel } from '../components/imageCarousel.js';
import { getDoc, getDocs, addDoc, doc, updateDoc, collection, onSnapshot, arrayUnion, arrayRemove, } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebaseConfig'; // Import your Firestore config
import Post from '../components/posts.js'
import TrendingKnowledge from '../components/trendingKnowledge.js';

function Dashboard() {
  const { currentUser, userData, loading, updateUserData } = useAuth();
  const [openUpload, setOpenUpload] = useState(false)
  const [postText, setPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const Navigate = useNavigate()
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const loadPosts = async () => {
    try {
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);

    } catch (err) {
      console.log('FetchPosts', error)
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);


  useEffect(() => {
    // Set the background color for the entire page (body)
    document.body.style.backgroundColor = "#D1D0D0";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.height = "100vh";
    document.body.style.overflow = "auto";
    document.documentElement.style.height = "100%";

    // Cleanup when component unmounts
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.height = "";
      document.body.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, []);

  const handleCloseUpload = () => {
    setOpenUpload(false);
  };

  const handlePostTextChange = (event) => {
    setPostText(event.target.value);
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files); // Get all selected files as an array
    if (files && files.length > 0) {
      const imageUrls = files.map((file) => ({
        preview: URL.createObjectURL(file),
        name: file.name,
      }));
      setSelectedImages(imageUrls); // Set selectedImages with an array of objects
    } else {
      setSelectedImages([]); // Clear selected images if no files are selected
    }
  };

  const handlePublishPost = async () => {
    try {
      await publishPost(postText, selectedImages, currentUser);
      setOpenUpload(false)
      setPostText('')
      setSelectedImages(null)
      loadPosts()
    } catch (error) {
      console.log('HandlePublishPost', error)
    }
  }
//   useEffect(() => {
//   const unsubscribeRefs = useRef([]); // Use useRef to store unsubscribe functions

//   // Clean up previous listeners
//   unsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
//   unsubscribeRefs.current = [];

//   const newUnsubscribeListeners = posts.map((post) => {
//     const unsubscribe = onSnapshot(doc(db, 'posts', post.id), (docSnapshot) => {
//       if (docSnapshot.exists()) {
//         setPosts((prevPosts) =>
//           prevPosts.map((p) => {
//             if (p.id === post.id) {
//               const newLikedBy = docSnapshot.data().likedBy;
//               if (JSON.stringify(p.likedBy) !== JSON.stringify(newLikedBy)) {
//                 // Only update if likedBy has changed
//                 return { ...p, likedBy: newLikedBy };
//               }
//             }
//             return p;
//           })
//         );
//       }
//     });

//     unsubscribeRefs.current.push(unsubscribe); // Store unsubscribe function
//     return unsubscribe;
//   });

//   return () => {
//     // Clean up listeners when component unmounts or posts change
//     unsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
//   };
// }, [posts]);
  const handleLike = async (postId) => {
    if (!currentUser) {
      alert("Please log in to like posts.");
      return;
    }
  
    const postDocRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postDocRef);
  
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const isLiked = postData.likedBy?.includes(currentUser.uid);
  
      try {
        if (isLiked) {
          // Remove user from likedBy array
          await updateDoc(postDocRef, { likedBy: arrayRemove(currentUser.uid) });
        } else {
          // Add user to likedBy array
          await updateDoc(postDocRef, { likedBy: arrayUnion(currentUser.uid) });
        }
  
        // Optimistically update the UI
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likedBy: isLiked
                    ? post.likedBy.filter((uid) => uid !== currentUser.uid)
                    : [...(post.likedBy || []), currentUser.uid],
                }
              : post
          )
        );
      } catch (error) {
        console.error("Error updating likes:", error);
      }
    }
  };

  return (
    <Box 
      sx={{
        height: "100vh", // Full viewport height
        display: "flex",
      }}
    >
      <NavBar />
      <Grid container spacing={2} sx={{ padding: 2, marginTop: "45px" }}>
            {/* Main Content Area */}
            <Grid item xs={12} md={8}>
                {/* Post creation box */}
                <Paper sx={{ padding: 2, marginBottom: 2 }}>
                    <Box display="flex" alignItems="center" >
                        <Avatar sx={{ marginRight: 1 }} src={userData.profileImage} onClick={() => Navigate('/profile')} />
                        <Button
                          onClick={() => setOpenUpload(true)}
                          sx={{
                            width: "100%",
                            display: "block",
                            textAlign: "left",
                            justifyContent: "flex-start",
                            padding: "10px 16px",
                            border: "1px solid gray",
                            backgroundColor: "transparent",
                            color: "gray",
                            textTransform: "none",
                            "&:hover": { backgroundColor: "transparent" },
                            "&:focus": { border: "1px solid gray" },
                          }}
                        >
                          Share your story!
                        </Button>
                        
                        <IconButton onClick={() => setOpenUpload(true)}>
                            <AttachFileIcon />
                        </IconButton>
                    </Box>
                    <Dialog open={openUpload} onClose={handleCloseUpload} fullWidth maxWidth="sm">
        <Toolbar sx={{ justifyContent: "space-between", padding: "8px 16px" }}>
          <Box display="flex" alignItems="center">
            <Avatar alt="User Avatar" src={userData.profileImage} sx={{ width: 32, height: 32, marginRight: 1 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">{userData.username}</Typography>
              <Typography variant="caption">Broadcasting...</Typography>
            </Box>
          </Box>
          <IconButton edge="end" color="inherit" onClick={handleCloseUpload} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>

        <DialogContent sx={{ padding: "16px" }}>
          <TextField
            multiline
            fullWidth
            placeholder="Publish something incredible!"
            value={postText}
            onChange={handlePostTextChange}
            variant="outlined"
            minRows={4}
            maxRows={8}
            sx={{ marginBottom: 2 }}
          />

          {/* Image Preview */}
          <Box display="flex" flexWrap="wrap" sx={{ marginBottom: 2 }}>
      {selectedImages && selectedImages.map((image, index) => (
        <Box
          key={index}
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{ marginRight: 2, marginBottom: 2 }} // Add marginRight for spacing
        >
          <img
            src={image.preview}
            alt={`Preview ${index}`}
            style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: 8 }} // Adjust maxWidth
          />
          <Typography variant="caption" sx={{ marginTop: 1 }}>
            {image.name}
          </Typography>
        </Box>
      ))}
    </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Tooltip title="Add Image">
                <IconButton component="label">
                  <ImageOutlinedIcon />
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    hidden 
                    onChange={handleImageChange} 
                  />
                </IconButton>
              </Tooltip>
            </Box>
            <Box display="flex" alignItems="center">
              <Button variant="contained" color="primary" onClick={() => handlePublishPost()}>Post</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
                </Paper>

                {/* Posts will be mapped here */}
                {/* Example Post */}
                <Grid sx={{ padding: 0, marginBottom: 2 }}>
                <Grid sx={{ padding: 0, marginBottom: 2 }}>
                {posts.length > 0 && posts
                .slice() // Create a copy of the array to avoid mutating the original
                .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate()) // Sort from newest to oldest
                .map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    userData={userData}
                    handleLike={handleLike}
                  />
                ))}
            </Grid>
                </Grid>
                {/* Add more posts here by mapping */}
            </Grid>

            {/* Trending Knowledge Sidebar */}
              <TrendingKnowledge />
            
        </Grid>
    </Box>
  );
}

export default Dashboard;
