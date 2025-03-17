import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function ImageCarousel({ imageUrls }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
  };

  return (
    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', borderRadius: '12px', overflow: 'hidden' }}>
      {imageUrls.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`Post Image ${index}`}
          style={{
            maxHeight: '350px',
            maxWidth: '100%',
            objectFit: 'cover',
            borderRadius: '12px',
            position: index === currentIndex ? 'relative' : 'absolute',
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
          }}
        />
      ))}

      {imageUrls.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '12px',
              transform: 'translateY(-50%)',
              zIndex: 99,
              color: 'gray',
              backgroundColor: 'transparent', // No background
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
              borderRadius: '50%',
              padding: '8px',
            }}
          >
            <ArrowBackIosIcon sx={{ fontSize: '1.5rem', color: 'rgba(0,0,0,0.2)' }} />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              top: '50%',
              right: '12px',
              color: 'gray',
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'transparent', // No background
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
              borderRadius: '50%',
              padding: '8px',
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: '1.5rem', color: 'rgba(0,0,0,0.2)' }} /> 
          </IconButton>
        </>
      )}
    </Box>
  );
}