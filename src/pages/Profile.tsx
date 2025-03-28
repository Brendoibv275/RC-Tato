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
  Card,
  CardContent,
  IconButton,
  Tooltip,
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
  Edit as EditIcon,
  EmojiEvents as EmojiEventsIcon,
  TrendingUp as TrendingUpIcon,
  AdminPanelSettings,
  AttachMoney,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, updateUserData } from '../services/authService';
import { getAppointmentsByUserId, getAllAppointments } from '../services/appointmentService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [financialGoals, setFinancialGoals] = useState({
    monthly: 0,
    current: 0,
    lastMonth: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
  });
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
  const [financialGoalsDialogOpen, setFinancialGoalsDialogOpen] = useState(false);
  const [financialGoalsForm, setFinancialGoalsForm] = useState({
    monthly: 0,
    current: 0,
    lastMonth: 0,
  });
  const navigate = useNavigate();

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
            if (isAdmin) {
              setFinancialGoals({
                monthly: data.monthlyGoal || 0,
                current: data.currentRevenue || 0,
                lastMonth: data.lastMonthRevenue || 0,
              });
            }
          }

          const userAppointments = await getAppointmentsByUserId(user.uid);
          setAppointments(userAppointments);

          if (isAdmin) {
            // Carregar estatísticas mensais
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const allAppointments = await getAllAppointments();
            
            const monthlyAppointments = allAppointments.filter(app => {
              const appDate = app.date.toDate();
              return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
            });

            setMonthlyStats({
              pending: monthlyAppointments.filter(a => a.status === 'pending').length,
              confirmed: monthlyAppointments.filter(a => a.status === 'confirmed').length,
              completed: monthlyAppointments.filter(a => a.status === 'completed').length,
            });
          }
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
  }, [user, isAdmin]);

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
        setEditDialogOpen(false);
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

  const getNextLevel = (points: number) => {
    const levels = [
      { points: 0, name: 'Iniciante' },
      { points: 200, name: 'Bronze' },
      { points: 500, name: 'Prata' },
      { points: 800, name: 'Ouro' },
      { points: 1000, name: 'Diamante' },
    ];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (points >= levels[i].points) {
        return levels[i];
      }
    }
    return levels[0];
  };

  const handleFinancialGoalsUpdate = async () => {
    try {
      if (user) {
        await updateUserData(user.uid, {
          monthlyGoal: financialGoalsForm.monthly,
          currentRevenue: financialGoalsForm.current,
          lastMonthRevenue: financialGoalsForm.lastMonth,
        });
        setFinancialGoals(financialGoalsForm);
        setSnackbar({
          open: true,
          message: 'Metas financeiras atualizadas com sucesso!',
          severity: 'success',
        });
        setFinancialGoalsDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar metas financeiras:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar metas financeiras',
        severity: 'error',
      });
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

  if (isAdmin) {
    return (
      <Container sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Grid container spacing={4}>
            {/* Seção de Perfil e Metas Financeiras */}
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
                <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
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
                  <Tooltip title="Editar Perfil">
                    <IconButton
                      onClick={() => setEditDialogOpen(true)}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: '25%',
                        backgroundColor: '#FF4D4D',
                        '&:hover': {
                          backgroundColor: '#FF6B6B',
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Typography variant="h5" gutterBottom sx={{ 
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 600,
                }}>
                  {userData?.name || 'Administrador'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {userData?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userData?.phone || 'Telefone não cadastrado'}
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AdminPanelSettings />}
                  onClick={() => navigate('/admin')}
                  sx={{ mt: 2, width: '100%' }}
                >
                  Acessar Painel Admin
                </Button>

                {/* Seção de Metas Financeiras */}
                <Box sx={{ width: '100%', mt: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ 
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 600,
                      }}>
                        Metas Financeiras
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => {
                        setFinancialGoalsForm(financialGoals);
                        setFinancialGoalsDialogOpen(true);
                      }}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h4" color="primary" sx={{ mr: 1 }}>
                      R$ {financialGoals.current.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / R$ {financialGoals.monthly.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={(financialGoals.current / financialGoals.monthly) * 100}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#FF4D4D',
                      }
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Meta mensal: R$ {(financialGoals.monthly - financialGoals.current).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Seção de Gráficos e Estatísticas */}
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
                  <BarChartIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5" sx={{ 
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600,
                  }}>
                    Estatísticas do Mês
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ backgroundColor: 'rgba(255,77,77,0.1)' }}>
                      <CardContent>
                        <Typography variant="h6" color="warning.main">
                          {monthlyStats.pending}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pendentes
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ backgroundColor: 'rgba(255,77,77,0.1)' }}>
                      <CardContent>
                        <Typography variant="h6" color="info.main">
                          {monthlyStats.confirmed}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Confirmados
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ backgroundColor: 'rgba(255,77,77,0.1)' }}>
                      <CardContent>
                        <Typography variant="h6" color="success.main">
                          {monthlyStats.completed}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Concluídos
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ height: 300, mt: 4 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Pendentes', value: monthlyStats.pending },
                      { name: 'Confirmados', value: monthlyStats.confirmed },
                      { name: 'Concluídos', value: monthlyStats.completed },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#FF4D4D" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
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

        <Dialog
          open={financialGoalsDialogOpen}
          onClose={() => setFinancialGoalsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Editar Metas Financeiras</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Mensal"
                  type="number"
                  value={financialGoalsForm.monthly}
                  onChange={(e) => setFinancialGoalsForm(prev => ({
                    ...prev,
                    monthly: Number(e.target.value)
                  }))}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Receita Atual"
                  type="number"
                  value={financialGoalsForm.current}
                  onChange={(e) => setFinancialGoalsForm(prev => ({
                    ...prev,
                    current: Number(e.target.value)
                  }))}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Receita do Mês Anterior"
                  type="number"
                  value={financialGoalsForm.lastMonth}
                  onChange={(e) => setFinancialGoalsForm(prev => ({
                    ...prev,
                    lastMonth: Number(e.target.value)
                  }))}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFinancialGoalsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleFinancialGoalsUpdate} variant="contained">
              Salvar Alterações
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
  }

  const pendingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const currentLevel = getNextLevel(userData?.loyaltyPoints || 0);

  return (
    <Container sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Grid container spacing={4}>
          {/* Seção de Perfil e Gamificação */}
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
              <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
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
                <Tooltip title="Editar Perfil">
                  <IconButton
                    onClick={() => setEditDialogOpen(true)}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: '25%',
                      backgroundColor: '#FF4D4D',
                      '&:hover': {
                        backgroundColor: '#FF6B6B',
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
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

              {/* Seção de Gamificação */}
              <Box sx={{ width: '100%', mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmojiEventsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ 
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600,
                  }}>
                    Nível {currentLevel.name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StarIcon color="primary" sx={{ mr: 1 }} />
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
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Próximo nível: {1000 - (userData?.loyaltyPoints || 0)} pontos
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Seção de Agendamentos */}
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

              {pendingAppointments.length > 0 && (
                <Card sx={{ mb: 3, backgroundColor: 'rgba(255,77,77,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      fontWeight: 600,
                    }}>
                      Próximos Agendamentos
                    </Typography>
                    <List>
                      {pendingAppointments.map((appointment) => (
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
                                    'Concluído'
                                  }
                                  color={
                                    appointment.status === 'pending' ? 'warning' :
                                    appointment.status === 'confirmed' ? 'success' :
                                    'info'
                                  }
                                  size="small"
                                />
                              }
                            />
                          </ListItem>
                          <Divider sx={{ my: 1 }} />
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              <Typography variant="h6" gutterBottom sx={{ 
                fontFamily: '"Playfair Display", serif',
                fontWeight: 600,
                mt: 4,
              }}>
                Histórico de Agendamentos
              </Typography>
              
              <List>
                {appointments
                  .filter(a => a.status === 'completed')
                  .map((appointment, index) => (
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