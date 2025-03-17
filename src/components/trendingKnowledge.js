// components/TrendingKnowledge.js

import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, styled } from '@mui/material';
import { fetchTrending } from '../firebase/firebaseFx'; // Adjust path

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  textDecoration: 'none', // Remove underline from entire paper
}));

const RankTypography = styled(Typography)(({ theme }) => ({
  marginRight: theme.spacing(1),
  fontWeight: 'bold',
  textDecoration: 'none', // Remove underline from rank number
}));

function TrendingKnowledge () {
    const [trendingPdfs, setTrendingPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const loadTrending = async () => {
        try {
          const data = await fetchTrending();
          setTrendingPdfs(data);
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch trending PDFs', error);
          setLoading(false);
        }
      };
  
      loadTrending();
    }, []);
  
    if (loading) {
      return (
        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Trending Knowledge
            </Typography>
            <Typography>Loading...</Typography>
          </Paper>
        </Grid>
      );
    }
  
    return (
      <Grid item xs={12} md={4}>
        <Paper sx={{ padding: 2 , position: 'fixed', width: '28.5%'}}>
          <Typography variant="h6" gutterBottom>
            Trending Knowledge
          </Typography>
          {trendingPdfs.map((pdf, index) => (
            <StyledPaper key={pdf.id} component="a" href={pdf.url} target="_blank" rel="noopener noreferrer">
              <RankTypography variant="subtitle2">#{index + 1}</RankTypography>
              <Typography variant="subtitle2">{pdf.title}</Typography>
            </StyledPaper>
          ))}
        </Paper>
      </Grid>
    );
  };
  

export default TrendingKnowledge;