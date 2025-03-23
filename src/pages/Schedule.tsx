import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { createAppointment } from '../services/appointmentService';
import { useAuth } from '../contexts/AuthContext';
import { getUserData } from '../services/authService';
import { Timestamp } from 'firebase/firestore';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#1e1e1e',
}));

const Schedule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    description: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const data = await getUserData(user.uid);
          if (data) {
            setUserData(data);
            setFormData(prev => ({
              ...prev,
              clientName: data.name || '',
              phone: data.phone || '',
            }));
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
        }
      }
    };

    loadUserData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Criando agendamento para o usuário:', user.uid);
      const appointmentData = {
        ...formData,
        email: userData?.email || '',
        userId: user.uid,
        clientId: user.uid,
        date: Timestamp.fromDate(new Date(formData.date)),
        status: 'pending' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      console.log('Dados do agendamento:', appointmentData);

      await createAppointment(appointmentData);

      setSnackbar({
        open: true,
        message: 'Agendamento realizado com sucesso! Você receberá uma confirmação por WhatsApp.',
        severity: 'success',
      });

      // Limpar formulário
      setFormData({
        clientName: userData?.name || '',
        phone: userData?.phone || '',
        service: '',
        date: '',
        time: '',
        description: '',
      });

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao realizar agendamento. Por favor, tente novamente.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Agende sua Tatuagem
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" paragraph>
        Preencha o formulário abaixo para agendar sua sessão
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <FormPaper>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Nome"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={!!userData}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Telefone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="(98) 99999-9999"
                    disabled={!!userData}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Serviço</InputLabel>
                    <Select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      label="Serviço"
                    >
                      <MenuItem value="Tatuagem Minimalista">Tatuagem Minimalista</MenuItem>
                      <MenuItem value="Tatuagem Minimalista - Pacote 5">Pacote 5 Tatuagens Minimalistas</MenuItem>
                      <MenuItem value="Cover-up">Cover-up</MenuItem>
                      <MenuItem value="Tatuagem Autoral">Tatuagem Autoral</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Data"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Horário"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição da Tatuagem"
                    name="description"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Descreva detalhadamente a tatuagem que você deseja fazer..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? 'Agendando...' : 'Agendar'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </FormPaper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Schedule; 