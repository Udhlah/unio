import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  ImageList,
  ImageListItem,
  Card,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ImageCarousel from './imageCarousel';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon
import EditNoteIcon from '@mui/icons-material/EditNote';
import { addComment, likeComment } from '../supabase/supabaseClient';
import { fetchComments } from '../firebase/firebaseFx';
import { deletePostFromFirebase, updatePostInDatabase, deleteCommentFromFirebase } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

export default function Post({ post, currentUser, handleLike, userData, onDelete }) {
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.postText);
  const [openDeleteCommentDialog, setOpenDeleteCommentDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

    const handleNavigate = useCallback(() => {
        navigate(`/${post.domain}`);
    }, [navigate, post.domain]);

  const handleCommentClick = () => {
    setCommentsVisible(!commentsVisible);
    if (commentsVisible) {
      // Clear attached files when closing the comment section
      setAttachedFiles([]);
      if(fileInputRef.current){
          fileInputRef.current.value = null;
      }
    }
  };

  const fetchAndSortComments = async () => {
    try {
      const fetchedComments = await fetchComments(post.id);
      setComments(fetchedComments);
      console.log(fetchedComments)
    } catch (error) {
      console.error('Error fetching comments in component:', error);
    }
  };

  useEffect(() => {
    console.log('Domain', userData.domain)
    if (commentsVisible) {
      fetchAndSortComments();
    }
  }, [commentsVisible, post.id]);

  const visibleComments = () => {
    return comments.sort((a, b) => {
      if (a.uploaderId === currentUser?.uid) return -1;
      if (b.uploaderId === currentUser?.uid) return 1;

      // Add safety check for likedBy
      const likedByA = a.likedBy || [];
      const likedByB = b.likedBy || [];

      return likedByB.length - likedByA.length;
    });
  };

  const handleAddComment = async () => {
    try {
      await addComment(newComment, currentUser.uid, post.id, attachedFiles);
      setNewComment('')
      setAttachedFiles([])
      // ... update local state and reset form
    } catch (error) {
      // Handle error (e.g., show a message to the user)
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddComment();
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setAttachedFiles(files);
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCommentLike = async (commentId, likedBy) => {
    try {
      console.log('userdata', userData);
      const userId = userData?.uid; // Use userData?.uid
      const currentLikes = likedBy || []; // Use likedBy directly, assuming it's the array

      if (currentLikes.includes(userId)) {
        // User already liked, remove like
        const updatedLikes = currentLikes.filter((id) => id !== userId);
        // Update local state (assuming you have a setComments function or similar)
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId ? { ...comment, likedBy: updatedLikes } : comment
          )
        );
        await likeComment(commentId, updatedLikes); // Update database
      } else {
        // User hasn't liked, add like
        const updatedLikes = [...currentLikes, userId];
        // Update local state
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId ? { ...comment, likedBy: updatedLikes } : comment
          )
        );
        await likeComment(commentId, updatedLikes); // Update database
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      fetchAndSortComments(); //refresh comments on error.
    }
  };

  const handleDeletePost = async () => {
    try {
        const error = await deletePostFromFirebase(post.id, post.imageUrls);
        if (error) {
            console.error("Delete Error", error);
            //Display error to user
        } else {
            if (onDelete) {
                onDelete(post.id); // Notify parent of deletion
            }
        }
    } catch (error) {
        console.error('Error deleting post:', error);
    }
    setOpenDeleteDialog(false);
  };

const handleEditClick = () => {
  setIsEditing(true);
  setEditedText(post.postText); // Set the text for editing
  };
    
 const handleSaveEdit = async () => {
  setLoading(true);  // Start loading
  try {
    // Save the edited text to Firebase
    await updatePostInDatabase(post.id, editedText); // Assuming this function saves the data in Firebase

    // Update the local state with the new post text
    setIsEditing(false);
    setEditedText(editedText);  // Ensure that the updated text is saved in the state

    // Optionally, re-fetch the updated post data (if needed) to ensure it's up to date
    // await fetchPostData(post.id); // Re-fetch post data if necessary

    // Reload the page using window.location.reload() if you really need a page refresh
  window.location.reload();

  } catch (error) {
    console.error("Error saving post:", error);
    alert("Failed to save changes.");
  } finally {
    setLoading(false);  // End loading
  }
};


const updatePostText = async (postId, newText) => {
  // Your code to update the post text in the database
  try {
    await updatePostInDatabase(postId, newText); // Example function to handle DB update
  } catch (error) {
    console.error('Error updating post:', error);
  }
};
  
const handleDeleteComment = (commentId) => {
  setCommentToDelete(commentId); // Store the comment ID to delete
  setOpenDeleteCommentDialog(true); // Open the confirmation dialog
};

const confirmDeleteComment = async () => {
  try {
    await deleteCommentFromFirebase(commentToDelete); // Delete from Firebase
    setComments(comments.filter(comment => comment.id !== commentToDelete)); // Update state
  } catch (error) {
    console.error("Error deleting comment:", error);
    alert("Failed to delete comment.");
  }
  setOpenDeleteCommentDialog(false); // Close the dialog
};

return (
  <Paper sx={{ padding: 2, marginBottom: 2, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
    <Box display="flex" alignItems="center" marginBottom={1} onClick={() => handleNavigate(post.id)}>
      <Avatar sx={{ marginRight: 1 }} src={post.profileImage} />
      <Box flexGrow={1}>
        <Typography variant="subtitle2" fontWeight="bold">
          {post.username || 'Unknown User'}
        </Typography>
        <Typography variant="caption">
          Based In {post.location}
        </Typography>
      </Box>
    </Box>
    {post.imageUrls && post.imageUrls.length > 0 && (
      <Box sx={{ marginTop: 2 }}>
        <ImageCarousel imageUrls={post.imageUrls} />
      </Box>
    )}
    {isEditing ? (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <TextField
          fullWidth
          variant="outlined"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          sx={{ marginBottom: 1 }}
        />
        <Box display="flex" justifyContent="space-between">
          <Button onClick={() => { setIsEditing(false); setEditedText(post.postText); }} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => handleSaveEdit()} color="primary">
            Save
          </Button>
        </Box>
      </Box>
    ) : (
      <Typography variant="body2" sx={{ marginBottom: 1 }}>
        {post.postText}
      </Typography>
    )}

    {currentUser?.uid === post.uploaderId && (
      <Box
        display="flex"
        alignItems="center"
        sx={{
          position: 'absolute',
          top: 8, // Fix position at the top of the post
          right: 8, // Keep it aligned to the right
          zIndex: 10, // Ensure it stays on top
        }}
      >
        <IconButton onClick={() => handleEditClick(post.postText)} aria-label="edit post">
          <EditNoteIcon />
        </IconButton>
        <IconButton onClick={() => setOpenDeleteDialog(true)} aria-label="delete post">
          <DeleteIcon />
        </IconButton>
      </Box>
    )}
    
    {/* Date moved below the edit and delete icons */}
    {currentUser?.uid === post.uploaderId && (
      <Typography variant="caption" sx={{ marginTop: 1, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
        {post.timestamp && post.timestamp.toDate().toLocaleString()}
      </Typography>
    )}

    {/* Post Images */}
    

    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center">
        <IconButton onClick={() => handleLike(post.id)}>
          {post.likedBy && post.likedBy.includes(currentUser?.uid) ? (
            <FavoriteIcon sx={{ color: 'red' }} />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
        <Typography variant="body2" sx={{ marginLeft: '4px', paddingTop: '4px', fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>
          {post.likedBy ? post.likedBy.length : 0}
        </Typography>
        <IconButton onClick={handleCommentClick}>
          <ChatBubbleOutlineIcon />
        </IconButton>
      </Box>
    </Box>

    {commentsVisible && (
      <Box sx={{ marginTop: 1 }}>
        <Divider variant="middle" />
        <Box sx={{ padding: '8px', border: '1px solid #ccc', borderRadius: '24px', backgroundColor: '#f9f9f9', marginBottom: 2, marginTop: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 30, height: 30, marginRight: '8px' }} src={userData.profileImage} alt={userData.username} />
            <TextField
              fullWidth
              placeholder="Make your opinion heard!"
              variant="standard"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                disableUnderline: true,
                style: { whiteSpace: 'pre-wrap', overflowWrap: 'break-word' },
              }}
              sx={{ flexGrow: 1, '& .MuiInputBase-input': { whiteSpace: 'pre-wrap', overflowWrap: 'break-word' } }}
              multiline
              minRows={1}
              maxRows={Infinity}
            />
            <IconButton aria-label="attach file" onClick={handleAttachClick}>
              <AttachFileIcon />
            </IconButton>
            <input type="file" multiple style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
            <IconButton aria-label="send comment" onClick={handleAddComment}>
              <SendIcon />
            </IconButton>
          </Box>

          {attachedFiles.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', marginTop: '4px', marginBottom: '4px' }}>
              {attachedFiles.map((file, index) => (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: '2px', '&:last-child': { marginRight: '0' } }}>
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      loading="lazy"
                      style={{ objectFit: 'contain', maxWidth: '200px', maxHeight: '150px', borderRadius: '2px', marginBottom: '2px' }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ textAlign: 'center', wordBreak: 'break-all', padding: '4px', border: '1px solid #ddd', borderRadius: '2px', backgroundColor: '#f0f0f0', maxWidth: '80px', fontSize: '0.8rem' }}>
                      {file.name}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <List sx={{ marginTop: 1 }}>
          {visibleComments().map((comment) => (
            <Card key={comment.id} sx={{ marginBottom: 1, padding: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box display="flex" alignItems="flex-start">
                  <Avatar src={comment.profileImage} sx={{ marginRight: 1 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {comment.username}
                    </Typography>
                    <Typography variant="caption">
                      Based In {comment.location || 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption">
                  {new Date(comment.timestamp).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 1, maxWidth: '500px', margin: '0 auto' }}>
                {comment.imageUrls && comment.imageUrls.length > 0 && <ImageCarousel imageUrls={comment.imageUrls} />}
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={2}>
                <Typography variant="body2">{comment.commentText}</Typography>
                <Box display="flex" alignItems="center">
                  <IconButton onClick={() => handleCommentLike(comment.id, comment.likedBy || [])}>
                    {comment.likedBy && comment.likedBy.includes(currentUser?.uid) ? (
                      <FavoriteIcon sx={{ color: 'red' }} />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                  <Typography variant="body2" sx={{ marginLeft: '4px' }}>
                    {comment.likedBy ? comment.likedBy.length : 0}
                  </Typography>
                  {currentUser?.uid === comment.uploaderId && (
                    <IconButton
                      onClick={() => handleDeleteComment(comment.id)} // This will trigger the delete logic
                      aria-label="delete comment"
                      sx={{ color: 'black', marginLeft: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Card>
          ))}
        </List>
      </Box>
    )}

    <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete this post?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
          Cancel
        </Button>
        <Button
          onClick={async () => {
            try {
              setLoading(true);
              await handleDeletePost();
              setOpenDeleteDialog(false);
              window.location.reload();
            } catch (error) {
              console.error("Error deleting post:", error);
              alert("Failed to delete post.");
              setOpenDeleteDialog(false);
            } finally {
              setLoading(false);
            }
          }}
          color="error"
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog open={openDeleteCommentDialog} onClose={() => setOpenDeleteCommentDialog(false)}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete this comment?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDeleteCommentDialog(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={confirmDeleteComment} color="error" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  </Paper>
);
}