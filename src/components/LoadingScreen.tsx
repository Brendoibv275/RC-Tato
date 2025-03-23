import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} color="primary" />
      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
        Carregando...
      </Typography>
    </Box>
  );
};

export default LoadingScreen; 