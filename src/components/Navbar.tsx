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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, logout } from '../services/authService';
import { AdminPanelSettings, Menu as MenuIcon } from '@mui/icons-material';
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
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const trigger = useScrollTrigger({
    threshold: 100,
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          setIsAdmin(userData?.isAdmin || false);
        } catch (error) {
          console.error('Erro ao verificar status de admin:', error);
        }
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
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
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
            onClick={() => navigate('/')}
          >
            R7 Tattoo
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {user ? (
              <>
                {isAdmin && (
                  <IconButton
                    color="inherit"
                    onClick={() => navigate('/admin')}
                    title="Painel Admin"
                    sx={{ 
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    <AdminPanelSettings />
                  </IconButton>
                )}
                <IconButton 
                  onClick={handleMenu} 
                  color="inherit"
                  sx={{ 
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'primary.main',
                      fontFamily: '"Playfair Display", serif',
                    }}
                  >
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      backgroundColor: 'background.paper',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 0,
                    },
                  }}
                >
                  <MenuItem 
                    onClick={() => { handleClose(); navigate('/profile'); }}
                    sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      '&:hover': {
                        backgroundColor: 'rgba(255,77,77,0.1)',
                      },
                    }}
                  >
                    Meu Perfil
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleClose(); navigate('/schedule'); }}
                    sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      '&:hover': {
                        backgroundColor: 'rgba(255,77,77,0.1)',
                      },
                    }}
                  >
                    Agendar
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      '&:hover': {
                        backgroundColor: 'rgba(255,77,77,0.1)',
                      },
                    }}
                  >
                    Sair
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <NavButton onClick={() => navigate('/login')}>
                  Login
                </NavButton>
                <NavButton onClick={() => navigate('/register')}>
                  Cadastrar
                </NavButton>
              </>
            )}
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              color="inherit"
              onClick={handleMobileMenu}
              sx={{ 
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  backgroundColor: 'background.paper',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 0,
                },
              }}
            >
              {user ? (
                <>
                  {isAdmin && (
                    <MenuItem 
                      onClick={() => { handleMobileMenuClose(); navigate('/admin'); }}
                      sx={{ 
                        fontFamily: '"Playfair Display", serif',
                        '&:hover': {
                          backgroundColor: 'rgba(255,77,77,0.1)',
                        },
                      }}
                    >
                      Painel Admin
                    </MenuItem>
                  )}
                  <MenuItem 
                    onClick={() => { handleMobileMenuClose(); navigate('/profile'); }}
                    sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      '&:hover': {
                        backgroundColor: 'rgba(255,77,77,0.1)',
                      },
                    }}
                  >
                    Meu Perfil
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleMobileMenuClose(); navigate('/schedule'); }}
                    sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      '&:hover': {
                        backgroundColor: 'rgba(255,77,77,0.1)',
                      },
                    }}
                  >
                    Agendar
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      '&:hover': {
                        backgroundColor: 'rgba(255,77,77,0.1)',
                      },
                    }}
                  >
                    Sair
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem 
                    onClick={() => { handleMobileMenuClose(); navigate('/login'); }}
                    sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      '&:hover': {
                        backgroundColor: 'rgba(255,77,77,0.1)',
                      },
                    }}
                  >
                    Login
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleMobileMenuClose(); navigate('/register'); }}
                    sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      '&:hover': {
                        backgroundColor: 'rgba(255,77,77,0.1)',
                      },
                    }}
                  >
                    Cadastrar
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </StyledAppBar>
    </Slide>
  );
};

export default Navbar; 