import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import theme from './theme';
import { useAuth } from './contexts/AuthContext';

// Lazy loading das páginas
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Schedule = React.lazy(() => import('./pages/Schedule'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Admin = React.lazy(() => import('./pages/Admin'));

// Componente para proteger rotas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
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
                <PrivateRoute>
                  <PageContainer>
                    <Admin />
                  </PageContainer>
                </PrivateRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App; 