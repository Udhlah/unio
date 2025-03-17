import React, { useState, useEffect, useRef } from 'react';
import { TextField, InputAdornment, List, ListItem, ListItemText, Paper, ListItemAvatar, Avatar, Typography  } from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { collection, query, where, getDocs, limit, or } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionClicked, setSuggestionClicked] = useState(false);
    const blurTimeout = useRef(null);
    const navigate = useNavigate();
  
    const fetchUsers = async () => {
        if (searchQuery.trim() === '') {
          setSearchResults([]);
          setShowSuggestions(false);
          return;
        }
    
        try {
          const usersCollection = collection(db, 'users');
          const querySnapshot = await getDocs(usersCollection);
          const allUsers = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
    
          const lowercaseQuery = searchQuery.toLowerCase();
          const filteredUsers = allUsers.filter((user) => {
            const lowercaseUsername = user.username.toLowerCase();
            const lowercaseEmail = user.email.toLowerCase();
            return lowercaseUsername.startsWith(lowercaseQuery) || lowercaseEmail.startsWith(lowercaseQuery);
          }).slice(0, 10);
    
          setSearchResults(filteredUsers);
          setShowSuggestions(true);
          console.log(filteredUsers);
        } catch (error) {
          console.error('Error fetching users:', error);
          setSearchResults([]);
          setShowSuggestions(false);
        }
      };
    
      useEffect(() => {
        fetchUsers();
      }, [searchQuery]);
    
      const handleInputChange = (event) => {
        const newValue = event.target.value;
        setSearchQuery(newValue);
    
        if (newValue.trim() === '') {
            setShowSuggestions(false);
        }
      };
    
      const handleSuggestionClick = (user) => {
        navigate(`/${user.domain}`);
        setSearchQuery(user.username);
        setSearchResults([]);
        setShowSuggestions(false);
        setSuggestionClicked(true);
        if (blurTimeout.current) {
          clearTimeout(blurTimeout.current);
        }
      };
    
      const handleBlur = () => {
        if (!suggestionClicked) {
          blurTimeout.current = setTimeout(() => setShowSuggestions(false), 200);
        }
        setSuggestionClicked(false);
      };
  return (
    <div>
      <TextField
        variant="outlined"
        placeholder="Discover SMEs..."
        size="small"
        sx={{
            width: '100%', // Increase width
            maxWidth: 500, // Increase max width
            backgroundColor: 'white',
            borderRadius: 2,
          }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        value={searchQuery}
        onChange={handleInputChange}
        onBlur={handleBlur}
      />
{showSuggestions && searchResults.length > 0 && (
  <Paper
    sx={{
      position: 'absolute',
      zIndex: 1000,
      width: '60%',
      maxWidth: 350,
      backgroundColor: 'white',
      borderRadius: 2,
    }}
  >
    <List sx={{ paddingY: 0 }}> {/* Reduce List padding */}
      {searchResults.map((user) => (
        <ListItem
          key={user.id}
          alignItems="flex-start"
          onClick={() => handleSuggestionClick(user)}
          sx={{
            '&:hover': {
              backgroundColor: '#f0f0f0',
              cursor: 'pointer',
            },
            paddingY: 0.5, // Reduce ListItem padding
          }}
        >
          <ListItemAvatar sx={{ minWidth: 35 }}> {/* Reduce Avatar spacing */}
            <Avatar alt={user.username} src={user.profileImage} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontSize: '12px', lineHeight: 1, marginLeft: 1 }}> {/* Remove Typography margin */}
                {user.username}
              </Typography>
            }
            secondary={
              <React.Fragment>
                <Typography variant="caption" sx={{ fontSize: '10px', lineHeight: 1, marginLeft: 1 }}> {/* Remove Typography margin */}
                  {user.email}
                  <br />
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '10px', lineHeight: 1, marginLeft: 1 }}> {/* Remove Typography margin */}
                  {user.location}
                </Typography>
              </React.Fragment>
            }
          />
        </ListItem>
      ))}
    </List>
  </Paper>
)}
    </div>
  );
}