import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#1e1e1e',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Criado por{' '}
        <Link
          href="https://www.instagram.com/brendo.dutraa/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: '#FF4D4D',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            '&:hover': {
              color: '#FF6B6B',
            },
          }}
        >
          Brendo Dutra
          <InstagramIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
        </Link>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} RC Tato. Todos os direitos reservados.
      </Typography>
    </Box>
  );
};

export default Footer; 