import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography, Avatar, Paper, Grid, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchForProfile, deletePost } from "../firebase/firebaseFx"; // Import API functions
import Post from "./posts"
import { getDoc, getDocs, addDoc, doc, updateDoc, collection, onSnapshot, arrayUnion, arrayRemove, } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebaseConfig';

function ProfileTabs({ currentUser, data }) {
  const [value, setValue] = useState(0);
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [commentedPosts, setCommentedPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState({ username: "Loading...", location: "", profileImage: "" });

  const getProfileData = async () => {
    try {
      const { userPosts, likedPosts, commentedPosts } = await fetchForProfile(currentUser);

      console.log("Fetched User Posts:", userPosts);
      console.log("Fetched Liked Posts:", likedPosts);
      console.log("Fetched Commented Posts:", commentedPosts);

      setUserPosts(userPosts);
      setLikedPosts(likedPosts);
      setCommentedPosts(commentedPosts);
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    }
  };
  useEffect(() => {
    if (!currentUser) {
      console.log("No user logged in.");
      return;
    }

    console.log("Fetching profile data for:", currentUser.uid);

    

    getProfileData();
  }, [currentUser]);

  const handleDelete = async (postId) => {
    if (await deletePost(postId)) {
      setUserPosts((prev) => prev.filter((post) => post.id !== postId));
    }
  };

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
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        aria-label="profile tabs"
        variant="fullWidth"
        TabIndicatorProps={{ style: { backgroundColor: "black", height: "3px" } }}
        sx={{
          "& .MuiTab-root": { color: "gray", fontWeight: "bold", textTransform: "none", padding: "12px 16px" },
          "& .MuiTab-root:hover": { color: "black" },
          "& .Mui-selected": { color: "black !important", fontWeight: "bold" },
        }}
      >
        <Tab label="Posts" />
        <Tab label="Comments" />
        <Tab label="Likes" />
      </Tabs>

      <TabPanel value={value} index={0}>
        {userPosts.length === 0 ? (
            <Typography variant="body2">No posts available.</Typography>
        ) : (
            userPosts
            .sort((a, b) => b.timestamp - a.timestamp) // Sort from youngest to oldest
            .map((post) => (
                <Post
                key={post.id}
                post={post}
                handleLike={handleLike}
                currentUser={currentUser}
                userData={data}
                />
            ))
        )}
        </TabPanel>


        <TabPanel value={value} index={1}>
  {commentedPosts.length === 0 ? (
    <Typography variant="body2">No comments available.</Typography>
  ) : (
    commentedPosts
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((postData) => (
        console.log(postData),
      <Post
        key={postData.id}
        post={postData}
        currentUser={currentUser}
        handleLike={handleLike}
        userData={data} // Pass comment text as a prop
      />
    ))
  )}
</TabPanel>

        <TabPanel value={value} index={2}>
        {likedPosts.length === 0 ? (
            <Typography variant="body2">No liked posts available.</Typography>
        ) : (
            likedPosts
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((post) => (
            <Post
                key={post.id}
                post={post}
                currentUser={currentUser}
                handleLike={handleLike}
                userData={data}
                
            />
            ))
        )}
        </TabPanel>
    </Box>
  );
}

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default ProfileTabs;
