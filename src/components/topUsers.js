// components/TrendingKnowledge.js

import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, styled, Avatar } from '@mui/material';
import { fetchTopUsers } from '../firebase/fbfyp'; // Adjust path
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People'; // Import follower icon

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
    backgroundColor: theme.palette.action.hover,
  },
}));

const RankTypography = styled(Typography)(({ theme }) => ({
  marginRight: theme.spacing(2),
  fontWeight: 'bold',
}));

const UserInfoContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
});

const UserNameTypography = styled(Typography)({
  marginLeft: '10px',
  flexGrow: 1,
});

const FollowerCountContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginLeft: '10px'
});

const FollowerCountTypography = styled(Typography)({
  marginRight: '5px',
});

const TopUsers = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTopUsers = async () => {
      try {
        const data = await fetchTopUsers();
        setTopUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch top users', error);
        setLoading(false);
      }
    };

    loadTopUsers();
  }, []);

  if (loading) {
    return (
      <Grid item xs={12} md={4}>
        <Paper sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>
            Top Users
          </Typography>
          <Typography>Loading...</Typography>
        </Paper>
      </Grid>
    );
  }

  const handleUserClick = (domain) => {
    navigate(`/${domain}`);
  };

  const formatFollowerCount = (count) => {
    if (count >= 1000000000) {
      return (count / 1000000000).toFixed(1) + 'B';
    }
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  return (
    <Grid item xs={12} md={4}>
      <Paper sx={{ padding: 2 , position: 'fixed', width: '28.5%'}}>
        <Typography variant="h6" gutterBottom>
          Top Users
        </Typography>
        {topUsers.map((user, index) => (
          <StyledPaper key={user.id} onClick={() => handleUserClick(user.domain)}>
            <RankTypography variant="subtitle2">#{index + 1}</RankTypography>
            <UserInfoContainer>
              <Avatar src={user.profileImage} alt={user.username} />
              <UserNameTypography variant="subtitle2">
                {user.username}
              </UserNameTypography>
              <FollowerCountContainer>
                <FollowerCountTypography variant="subtitle2">
                  {formatFollowerCount(user.followerCount)}
                </FollowerCountTypography>
                <PeopleIcon fontSize="small" />
              </FollowerCountContainer>
            </UserInfoContainer>
          </StyledPaper>
        ))}
      </Paper>
    </Grid>
  );
};

export default TopUsers;