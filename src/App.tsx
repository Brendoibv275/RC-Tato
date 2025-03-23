import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Typography, Button } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import theme from './theme';
import { useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/LoadingScreen';

// Lazy loading das páginas
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Schedule = React.lazy(() => import('./pages/Schedule'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Admin = React.lazy(() => import('./pages/Admin'));

// Componente para proteger rotas
const PrivateRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

// Componente para gerenciar transições de página
const PageContainer = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

// Componente para página não encontrada
const NotFound = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      px: 2,
    }}
  >
    <Typography variant="h1" component="h1" gutterBottom>
      404
    </Typography>
    <Typography variant="h5" gutterBottom>
      Página não encontrada
    </Typography>
    <Typography variant="body1" color="text.secondary" paragraph>
      A página que você está procurando não existe ou foi movida.
    </Typography>
    <Button
      variant="contained"
      color="primary"
      onClick={() => window.location.href = '/'}
      sx={{ mt: 2 }}
    >
      Voltar para a página inicial
    </Button>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100vh'
          }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <PageContainer>
                        <Home />
                      </PageContainer>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <PageContainer>
                        <Login />
                      </PageContainer>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PageContainer>
                        <Register />
                      </PageContainer>
                    }
                  />
                  <Route
                    path="/schedule"
                    element={
                      <PrivateRoute>
                        <PageContainer>
                          <Schedule />
                        </PageContainer>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <PageContainer>
                          <Profile />
                        </PageContainer>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <PrivateRoute adminOnly>
                        <PageContainer>
                          <Admin />
                        </PageContainer>
                      </PrivateRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Box>
            <Footer />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 