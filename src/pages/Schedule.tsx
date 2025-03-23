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
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { createAppointment } from '../services/appointmentService';
import { useAuth } from '../contexts/AuthContext';
import { getUserData } from '../services/authService';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#1e1e1e',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  maxWidth: '600px',
  margin: '0 auto',
}));

const Schedule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
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
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
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

  const generateAvailableTimes = (selectedDate: string) => {
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    // Verificar se é fim de semana
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setAvailableTimes([]);
      return;
    }

    const times: string[] = [];
    
    // Manhã: 8:00 - 11:30
    for (let hour = 8; hour <= 11; hour++) {
      for (let minute = 0; minute <= 30; minute += 30) {
        if (hour === 11 && minute > 30) break;
        times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    
    // Tarde: 14:00 - 18:00
    for (let hour = 14; hour <= 18; hour++) {
      for (let minute = 0; minute <= 30; minute += 30) {
        if (hour === 18 && minute > 0) break;
        times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }

    setAvailableTimes(times);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'date') {
      generateAvailableTimes(value);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        date: formattedDate,
        time: '', // Limpa o horário selecionado quando a data muda
      }));
      generateAvailableTimes(formattedDate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!formData.clientName.trim() || 
        !formData.phone.trim() || 
        !formData.service || 
        !formData.date || 
        !formData.time) {
      setSnackbar({
        open: true,
        message: 'Por favor, preencha todos os campos obrigatórios.',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

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

      await createAppointment(appointmentData);

      setSnackbar({
        open: true,
        message: 'Agendamento realizado com sucesso! Você receberá uma confirmação por WhatsApp.',
        severity: 'success',
      });

      setFormData({
        clientName: userData?.name || '',
        phone: userData?.phone || '',
        service: '',
        date: '',
        time: '',
        description: '',
      });

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

  const isFormValid = () => {
    return (
      formData.clientName.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.service !== '' &&
      formData.date !== '' &&
      formData.time !== ''
    );
  };

  return (
    <Container sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ 
          fontFamily: '"Playfair Display", serif',
          fontWeight: 700,
        }}>
          Agende sua Tatuagem
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" paragraph sx={{ 
          fontFamily: '"Playfair Display", serif',
          fontStyle: 'italic',
          mb: 6,
        }}>
          Escolha a data e preencha o formulário para agendar sua sessão
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
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
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Serviço</InputLabel>
                  <Select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    label="Serviço"
                  >
                    <MenuItem value="Tatuagem Minimalista">Tatuagem Minimalista</MenuItem>
                    <MenuItem value="Cover-up">Cover-up</MenuItem>
                    <MenuItem value="Tatuagem Autoral">Tatuagem Autoral</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data"
                    value={formData.date ? new Date(formData.date) : null}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    sx={{ width: '100%' }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        variant: "outlined",
                      },
                    }}
                    shouldDisableDate={(date) => {
                      const day = date.getDay();
                      return day === 0 || day === 6; // Desabilita sábados e domingos
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Horário</InputLabel>
                  <Select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    label="Horário"
                    disabled={!formData.date || availableTimes.length === 0}
                  >
                    {availableTimes.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                  disabled={loading || !isFormValid()}
                  sx={{ 
                    py: 2,
                    fontSize: '1.1rem',
                    fontFamily: '"Playfair Display", serif',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(255, 77, 77, 0.3)',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'rgba(255, 77, 77, 0.5)',
                    },
                  }}
                >
                  {loading ? 'Agendando...' : 'Agendar'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormPaper>
      </motion.div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Schedule; 