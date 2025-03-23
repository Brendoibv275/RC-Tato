import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  useScrollTrigger,
  Slide,
  useTheme,
  Container,
  Tooltip,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, logout } from '../services/authService';
import { AdminPanelSettings, Menu as MenuIcon, Logout } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(18, 18, 18, 0.95)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  transition: 'all 0.3s ease-in-out',
  '&.scrolled': {
    background: 'rgba(18, 18, 18, 0.98)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: 'white',
  fontFamily: '"Playfair Display", serif',
  fontSize: '1rem',
  padding: '8px 16px',
  margin: '0 8px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 0,
    height: '2px',
    background: theme.palette.primary.main,
    transition: 'all 0.3s ease-in-out',
    transform: 'translateX(-50%)',
  },
  '&:hover::after': {
    width: '100%',
  },
}));

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const trigger = useScrollTrigger({
    threshold: 100,
  });

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <StyledAppBar position="fixed" className={trigger ? 'scrolled' : ''}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              RC Tatoo
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              <Button
                component={Link}
                to="/"
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Início
              </Button>
              <Button
                component={Link}
                to="/schedule"
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Agendar
              </Button>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              {user ? (
                <>
                  {isAdmin && (
                    <Button
                      component={Link}
                      to="/admin"
                      startIcon={<AdminPanelSettings />}
                      sx={{ mr: 2, color: 'white' }}
                    >
                      Painel Admin
                    </Button>
                  )}
                  <IconButton
                    onClick={handleMenu}
                    sx={{ p: 0 }}
                  >
                    <Avatar
                      sx={{
                        width: 35,
                        height: 35,
                        bgcolor: '#FF4D4D',
                      }}
                    >
                      {user.email?.[0]?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        backgroundColor: '#1e1e1e',
                        color: 'white',
                        '& .MuiMenuItem-root': {
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem component={Link} to="/profile" onClick={handleClose}>
                      Meu Perfil
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Logout sx={{ mr: 1 }} />
                      Sair
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    component={Link}
                    to="/login"
                    color="inherit"
                    sx={{ my: 2 }}
                  >
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    color="primary"
                    sx={{ my: 2 }}
                  >
                    Cadastrar
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>
    </Slide>
  );
};

export default Navbar; 