import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, loginWithGoogle } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#1e1e1e',
  maxWidth: 500,
  margin: '0 auto',
}));

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Redirecionar se já estiver logado
  React.useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginWithEmail(formData.email, formData.password);
      
      setSnackbar({
        open: true,
        message: 'Login realizado com sucesso!',
        severity: 'success',
      });

    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao realizar login. Tente novamente.',
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao realizar login com Google.',
        severity: 'error',
      });
    }
  };

  if (user) {
    return null; // Não renderiza nada se já estiver logado
  }

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Login R7 Tattoo
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" paragraph>
        Acesse sua conta para gerenciar seus agendamentos
      </Typography>

      <FormPaper elevation={3}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ my: 3 }}>
          <Divider>
            <Typography color="text.secondary">ou</Typography>
          </Divider>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          fullWidth
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
        >
          Entrar com Google
        </Button>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Ainda não tem uma conta?{' '}
            <Button color="primary" onClick={() => navigate('/register')}>
              Cadastre-se
            </Button>
          </Typography>
        </Box>
      </FormPaper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login; 