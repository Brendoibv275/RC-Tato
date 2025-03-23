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
  Card,
  CardContent,
  CardMedia,
  Chip,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { createAppointment } from '../services/appointmentService';
import { useAuth } from '../contexts/AuthContext';
import { getUserData } from '../services/authService';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#1e1e1e',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
}));

const ServiceCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(30, 30, 30, 0.8)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #FF4D4D, #FF6B6B)',
  },
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(255, 77, 77, 0.2)',
  },
}));

const services = [
  {
    title: 'Tatuagem Minimalista',
    description: 'Designs simples e elegantes que transmitem mensagens poderosas com traços sutis.',
    image: '/services/minimalist.jpg',
    price: 'R$ 50,00 individual',
    promo: '5 por R$ 150,00',
    isPromo: true,
  },
  {
    title: 'Cover-up',
    description: 'Transforme suas tatuagens antigas em novas obras de arte. Preço avaliado por trabalho.',
    image: '/services/cover-up.jpg',
    price: 'A partir de R$ 200',
    promo: 'Preço sob consulta',
    isPromo: false,
  },
  {
    title: 'Tatuagem Autoral',
    description: 'Designs exclusivos e personalizados, criados especialmente para você.',
    image: '/services/artistic.jpg',
    price: 'A partir de R$ 150',
    promo: 'Preço sob consulta',
    isPromo: false,
  },
];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          Escolha o serviço e preencha o formulário para agendar sua sessão
        </Typography>
      </motion.div>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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
                        {services.map((service) => (
                          <MenuItem key={service.title} value={service.title}>
                            {service.title}
                          </MenuItem>
                        ))}
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
                      inputProps={{
                        min: new Date().toISOString().split('T')[0],
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                      disabled={loading}
                      sx={{ 
                        py: 2,
                        fontSize: '1.1rem',
                        fontFamily: '"Playfair Display", serif',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 16px rgba(255, 77, 77, 0.3)',
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
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ 
                fontFamily: '"Playfair Display", serif',
                fontWeight: 600,
              }}>
                Horários Disponíveis
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Segunda a Sexta:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manhã: 8:00 - 11:30
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Tarde: 14:00 - 18:00
              </Typography>
            </Box>

            <Typography variant="h5" gutterBottom sx={{ 
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              mb: 3,
            }}>
              Nossos Serviços
            </Typography>

            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
              >
                <ServiceCard sx={{ mb: 3 }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={service.image}
                    alt={service.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="h2" sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      fontWeight: 600,
                    }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {service.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" color="primary" sx={{ 
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 600,
                      }}>
                        {service.price}
                      </Typography>
                      {service.isPromo && (
                        <Chip
                          label={service.promo}
                          color="primary"
                          size="small"
                          sx={{ 
                            borderRadius: 0,
                            '& .MuiChip-label': {
                              fontFamily: '"Playfair Display", serif',
                            },
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </ServiceCard>
              </motion.div>
            ))}
          </motion.div>
        </Grid>
      </Grid>

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