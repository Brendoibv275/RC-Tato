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
import { registerUser, loginWithGoogle } from '../services/authService';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#1e1e1e',
  maxWidth: 500,
  margin: '0 auto',
}));

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

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
      if (formData.password !== formData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      await registerUser(formData.email, formData.password, formData.name, formData.phone);

      setSnackbar({
        open: true,
        message: 'Registro realizado com sucesso! Bem-vindo à R7 Tattoo!',
        severity: 'success',
      });

      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao realizar registro. Tente novamente.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/profile');
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao realizar login com Google.',
        severity: 'error',
      });
    }
  };

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Cadastre-se na R7 Tattoo
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" paragraph>
        Faça parte da nossa comunidade e aproveite benefícios exclusivos
      </Typography>

      <FormPaper elevation={3}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Nome completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
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
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                variant="outlined"
                placeholder="(98) 99999-9999"
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
              <TextField
                required
                fullWidth
                label="Confirmar senha"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
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
                {loading ? 'Registrando...' : 'Registrar'}
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
          Registrar com Google
        </Button>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Já tem uma conta?{' '}
            <Button color="primary" onClick={() => navigate('/login')}>
              Faça login
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

export default Register; 