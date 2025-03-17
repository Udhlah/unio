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
import TopUsers from '../components/topUsers.js';
import { fetchCuratedPosts } from '../firebase/fbfyp.js'

function ForYouPage() {
  const { currentUser, userData, loading, updateUserData } = useAuth();
  const Navigate = useNavigate()
  const [curatedPosts, setCuratedPosts] = useState([]);
  const [error, setError] = useState(null);
  const loadPosts = async () => {
    try {
      const fetchedPosts = await fetchCuratedPosts(userData.uid);
      setCuratedPosts(fetchedPosts);
      console.log('fetchedposts', fetchedPosts)

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
        setCuratedPosts((prevPosts) =>
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
                {/* Posts will be mapped here */}
                {/* Example Post */}
                <Grid sx={{ padding: 0, marginBottom: 2 }}>
                <Grid sx={{ padding: 0, marginBottom: 2 }}>
                {curatedPosts.length > 0 ? (
                curatedPosts
                  .slice() // Create a copy of the array to avoid mutating the original
                  .map((post) => (
                    <Post
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      userData={userData}
                      handleLike={handleLike}
                    />
                  ))
              ) : (
                <Typography variant="body1" align="center" sx={{ padding: 2 }}>
                  Follow other SMEs and configure your profile to get recommendations.
                </Typography>
              )}
            </Grid>
                </Grid>
                {/* Add more posts here by mapping */}
            </Grid>

            {/* Trending Knowledge Sidebar */}
            <TopUsers />
        </Grid>
    </Box>
  );
}

export default ForYouPage;
