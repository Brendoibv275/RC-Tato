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
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Star as StarIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, updateUserData } from '../services/authService';
import { getAppointmentsByUserId } from '../services/appointmentService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  const calculateProgress = (points: number) => {
    return Math.min((points / 1000) * 100, 100);
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
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

              <Box sx={{ width: '100%', mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">
                    Pontos de Fidelidade
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4" color="primary" sx={{ mr: 1 }}>
                    {userData?.loyaltyPoints || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / 1000 pontos
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateProgress(userData?.loyaltyPoints || 0)}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#FF4D4D',
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {calculateProgress(userData?.loyaltyPoints || 0).toFixed(1)}% para desconto de 10%
                </Typography>
              </Box>

              <Button
                variant="outlined"
                color="primary"
                onClick={() => setEditDialogOpen(true)}
                sx={{ mt: 3 }}
              >
                Editar Dados
              </Button>
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <HistoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" sx={{ 
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 600,
                }}>
                  Meus Agendamentos
                </Typography>
              </Box>
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
                          <Chip
                            label={
                              appointment.status === 'pending' ? 'Pendente' :
                              appointment.status === 'confirmed' ? 'Confirmado' :
                              appointment.status === 'completed' ? 'Concluído' :
                              'Cancelado'
                            }
                            color={
                              appointment.status === 'pending' ? 'warning' :
                              appointment.status === 'confirmed' ? 'success' :
                              appointment.status === 'completed' ? 'info' :
                              'error'
                            }
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    {appointment.pointsEarned && (
                      <ListItem>
                        <ListItemIcon>
                          <StarIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Pontos Ganhos"
                          secondary={
                            <Typography variant="body2" color="primary">
                              {appointment.pointsEarned} pontos
                            </Typography>
                          }
                        />
                      </ListItem>
                    )}
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
      </motion.div>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Dados do Perfil</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
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
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </Dialog>

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