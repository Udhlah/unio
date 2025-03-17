import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, Avatar, Paper, Grid, IconButton } from '@mui/material';
import { acceptCollaborate, declineCollaborate } from '../firebase/fbCollaborate'; // Adjust path
import { collection, getDocs, query, where } from 'firebase/firestore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Import CheckCircleIcon
import CancelIcon from '@mui/icons-material/Cancel';
import { db } from '../firebaseConfig'; // Adjust path
import { useNavigate } from 'react-router-dom'

export default function CollaborationCard({ userData, refreshData }) {
    const [ourRequests, setOurRequests] = useState([]);
    const [collaboratingUsers, setCollaboratingUsers] = useState([]);
  const [collaborationReqUsers, setCollaborationReqUsers] = useState([]);
  const navigate= useNavigate()
  const fetchUsers = async (userIds, setter) => {
    try {
      const usersData = await Promise.all(
        userIds.map(async (uid) => {
          const q = query(collection(db, 'users'), where('uid', '==', uid));
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs[0]?.data();
        })
      );
      setter(usersData.filter(user => user));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {

    
        if (userData?.collaborating) {
          fetchUsers(userData.collaborating, setCollaboratingUsers);
        }
        if (userData?.collaborationReq) {
          fetchUsers(userData.collaborationReq, setCollaborationReqUsers);
        }
      }, [userData]);

    useEffect(() => {
        const fetchOurRequests = async () => {
            try {
                const companiesRef = collection(db, 'users');
                const q = query(companiesRef, where('collaborationReq', 'array-contains', userData.uid));
                const querySnapshot = await getDocs(q);
                const requests = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setOurRequests(requests);
            } catch (error) {
                console.error("Error fetching our collaboration requests:", error);
            }
        };

        fetchOurRequests();
    }, [userData.uid]);

    const handleAccept = async (requestedUid) => {
        const success = await acceptCollaborate(requestedUid, userData.uid);
        if (success) {
            fetchUsers()
            navigate(0)
        }
    };

    const handleDecline = async (requestedUid) => {
        const success = await declineCollaborate(requestedUid, userData.uid);
        if (success) {
            fetchUsers()
            navigate(0)
        }
    };

    const handleNavigate = async (domain) => {
        await navigate(`/${domain}`)
        navigate(0)
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Our Requests</Typography>
                <Box sx={{ display: 'flex', overflowX: 'auto', padding: 0}}>
                {ourRequests.length > 0 ? (
                    ourRequests.map((request) => (
                        <Paper
  key={request.id}
  elevation={2}
  sx={{
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '8px',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    flexGrow: 1,
  }}
>
  <Avatar
    src={request.profileImage}
    alt={request.companyName || request.id}
    sx={{ width: 25, height: 25, marginRight: '16px' }} 
    onClick={handleNavigate(request.domain)}
    // Increased avatar size
  />
  <Box sx={{ flexGrow: 1 }} onClick={()=>handleNavigate(request.domain)}>
    <Typography variant="body1" fontWeight="bold">
      {request.username}
    </Typography>
    <Typography variant="body2" color="textSecondary">
      {request.location}
    </Typography>
  </Box>
</Paper>
                    ))
                    ) : (
                    <Typography variant="body2" color="textSecondary">No collaboration requests sent.</Typography>
                    )}
                </Box>
                

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Collaboration Requests</Typography>
        {collaborationReqUsers.length > 0 ? (
          collaborationReqUsers.map((user) => (
            <Paper
              key={user.uid}
              elevation={2}
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flexGrow: 1,
              }}
            >
              <Avatar
                src={user.profileImage}
                alt={user.username}
                sx={{ width: 25, height: 25, marginRight: '16px' }} onClick={()=>handleNavigate(user.domain)}
              />
              <Box sx={{ flexGrow: 1 }} onClick={()=>handleNavigate(user.domain)}>
                <Typography variant="body1" fontWeight="bold">
                  {user.username}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.location}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton onClick={() => handleAccept(user.uid)} size="small" color="success">
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDecline(user.uid)} size="small" color="error">
                    <CancelIcon />
                  </IconButton>
                </Box>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">No collaboration requests.</Typography>
        )}
    <Typography variant="h6" gutterBottom>Collaborating With</Typography>
                {collaboratingUsers.length > 0 ? (
          collaboratingUsers.map((user) => (
            <Paper
              key={user.uid}
              elevation={2}
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flexGrow: 1,
              }}
            >
              <Avatar
                src={user.profileImage}
                alt={user.username}
                sx={{ width: 25, height: 25, marginRight: '16px' }} onClick={()=> handleNavigate(user.domain)}
              />
              <Box sx={{ flexGrow: 1 }} onClick={()=>handleNavigate(user.domain)}>
                <Typography variant="body1" fontWeight="bold">
                  {user.username}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.location}
                </Typography>
              </Box>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">No current collaborations.</Typography>
        )}
                
            </CardContent>
        </Card>
    );
}