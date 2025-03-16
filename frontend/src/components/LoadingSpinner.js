import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const LoadingSpinner = () => {
  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" style={{ marginTop: 20 }}>
        Loading SoccerIQ...
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
