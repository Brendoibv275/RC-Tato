import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, updateUserData } from '../services/authService';
import { getAppointmentsByUserId } from '../services/appointmentService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const data = await getUserData(user.uid);
          if (data) {
            setUserData(data);
            setFormData({
              name: data.name || '',
              phone: data.phone || '',
            });
          }

          const userAppointments = await getAppointmentsByUserId(user.uid);
          setAppointments(userAppointments);
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
          setSnackbar({
            open: true,
            message: 'Erro ao carregar dados do perfil',
            severity: 'error',
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (user) {
        await updateUserData(user.uid, formData);
        setSnackbar({
          open: true,
          message: 'Perfil atualizado com sucesso!',
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar perfil',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#1e1e1e',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: '#FF4D4D',
                fontSize: '3rem',
                mb: 2,
              }}
            >
              {userData?.name?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Typography variant="h5" gutterBottom sx={{ 
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
            }}>
              {userData?.name || 'Usuário'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {userData?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userData?.phone || 'Telefone não cadastrado'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#1e1e1e',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ 
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              mb: 3,
            }}>
              Editar Perfil
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
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
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={saving}
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
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          <Paper
            sx={{
              p: 3,
              mt: 4,
              backgroundColor: '#1e1e1e',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ 
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              mb: 3,
            }}>
              Meus Agendamentos
            </Typography>
            <List>
              {appointments.map((appointment, index) => (
                <React.Fragment key={appointment.id}>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={format(new Date(appointment.date.toDate()), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <TimeIcon sx={{ fontSize: '1rem' }} />
                          <Typography variant="body2">
                            {format(new Date(appointment.date.toDate()), 'HH:mm')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DescriptionIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={appointment.service}
                      secondary={appointment.description}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Typography
                          component="span"
                          sx={{
                            color: appointment.status === 'pending' ? 'warning.main' :
                                   appointment.status === 'confirmed' ? 'success.main' :
                                   appointment.status === 'completed' ? 'info.main' :
                                   'error.main',
                            fontWeight: 500,
                          }}
                        >
                          {appointment.status === 'pending' ? 'Pendente' :
                           appointment.status === 'confirmed' ? 'Confirmado' :
                           appointment.status === 'completed' ? 'Concluído' :
                           'Cancelado'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < appointments.length - 1 && <Divider sx={{ my: 2 }} />}
                </React.Fragment>
              ))}
              {appointments.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="Nenhum agendamento encontrado"
                    secondary="Você ainda não fez nenhum agendamento."
                  />
                </ListItem>
              )}
            </List>
          </Paper>
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

export default Profile; 