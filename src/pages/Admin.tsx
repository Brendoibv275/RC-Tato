import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CalendarToday,
  People,
  AttachMoney,
  Star,
  TrendingUp,
  Edit,
  Add,
  Delete,
  Visibility,
  WhatsApp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from '../services/promotionService';
import { getAllAppointments, updateAppointmentStatus } from '../services/appointmentService';
import { Appointment } from '../services/appointmentService';
import { getUserData, updateUserData, getAllClients } from '../services/userService';

const AdminPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#1e1e1e',
  height: '100%',
}));

const StatCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#1e1e1e',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(255, 77, 77, 0.2)',
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: any;
  totalSpent: number;
  totalAppointments: number;
  lastAppointment?: any;
}

const Admin = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    totalClients: 0,
    totalRevenue: 0,
    totalPoints: 0,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar agendamentos
      const appointmentsData = await getAllAppointments();
      setAppointments(appointmentsData);

      // Carregar clientes com informações detalhadas
      const clientsData = await getAllClients();
      const clientsWithDetails = await Promise.all(
        clientsData.map(async (client) => {
          const clientAppointments = appointmentsData.filter(a => a.clientId === client.id);
          const totalSpent = clientAppointments
            .filter(a => a.status === 'completed')
            .reduce((sum, a) => sum + (a.price || 0), 0);
          
          const lastAppointment = clientAppointments
            .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime())[0];

          return {
            ...client,
            totalSpent,
            totalAppointments: clientAppointments.length,
            lastAppointment,
          };
        })
      );
      setClients(clientsWithDetails);

      // Carregar promoções
      const promotionsData = await getPromotions();
      setPromotions(promotionsData);

      // Carregar dados do perfil
      if (user) {
        const userData = await getUserData(user.uid);
        if (userData) {
          setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
          });
        }
      }

      // Calcular estatísticas
      setStats({
        totalAppointments: appointmentsData.length,
        pendingAppointments: appointmentsData.filter(a => a.status === 'pending').length,
        totalClients: clientsData.length,
        totalRevenue: appointmentsData
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + (a.price || 0), 0),
        totalPoints: clientsData.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0),
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionEdit = (promotion: any) => {
    setSelectedPromotion(promotion);
    setDialogOpen(true);
  };

  const handlePromotionSave = async () => {
    try {
      if (selectedPromotion.id) {
        await updateDoc(doc(db, 'promotions', selectedPromotion.id), selectedPromotion);
      } else {
        await addDoc(collection(db, 'promotions'), selectedPromotion);
      }
      setSnackbar({
        open: true,
        message: 'Promoção salva com sucesso!',
        severity: 'success',
      });
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar promoção:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar promoção',
        severity: 'error',
      });
    }
  };

  const handlePromotionDelete = async (promotionId: string) => {
    try {
      await deleteDoc(doc(db, 'promotions', promotionId));
      setSnackbar({
        open: true,
        message: 'Promoção excluída com sucesso!',
        severity: 'success',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao excluir promoção:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir promoção',
        severity: 'error',
      });
    }
  };

  const getStatusTranslation = (status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    const translations: { [key: string]: string } = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return translations[status] || status;
  };

  const handleStatusChange = async (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      setSnackbar({
        open: true,
        message: 'Status do agendamento atualizado com sucesso!',
        severity: 'success',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar status do agendamento',
        severity: 'error',
      });
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailsDialogOpen(true);
  };

  const handleProfileUpdate = async () => {
    try {
      if (user) {
        await updateUserData(user.uid, {
          name: profileData.name,
          phone: profileData.phone,
        });
        setSnackbar({
          open: true,
          message: 'Perfil atualizado com sucesso!',
          severity: 'success',
        });
        setProfileDialogOpen(false);
        loadData();
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar perfil',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography>Carregando...</Typography>
      </Container>
    );
  }

  // Dados para o gráfico de agendamentos
  const chartData = appointments.reduce((acc: any[], appointment) => {
    const date = format(appointment.date.toDate(), 'dd/MM', { locale: ptBR });
    const existingData = acc.find(item => item.date === date);
    
    if (existingData) {
      existingData.count++;
    } else {
      acc.push({ date, count: 1 });
    }
    
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Container sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1">
          Painel Administrativo
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Edit />}
          onClick={() => setProfileDialogOpen(true)}
        >
          Editar Perfil
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Agendamentos</Typography>
              </Box>
              <Typography variant="h4">{stats.totalAppointments}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.pendingAppointments} pendentes
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Clientes</Typography>
              </Box>
              <Typography variant="h4">{stats.totalClients}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total cadastrados
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Faturamento</Typography>
              </Box>
              <Typography variant="h4">
                R$ {stats.totalRevenue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total em serviços concluídos
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Fidelidade</Typography>
              </Box>
              <Typography variant="h4">
                {stats.totalPoints}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de pontos distribuídos
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Dashboard" />
          <Tab label="Agendamentos" />
          <Tab label="Promoções" />
          <Tab label="Clientes" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <AdminPaper>
              <Typography variant="h5" gutterBottom>
                Agendamentos por Data
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip />
                    <Line type="monotone" dataKey="count" stroke="#FF4D4D" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </AdminPaper>
          </Grid>
          <Grid item xs={12} md={4}>
            <AdminPaper>
              <Typography variant="h5" gutterBottom>
                Próximos Agendamentos
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments
                      .filter(a => a.status === 'pending' || a.status === 'confirmed')
                      .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())
                      .slice(0, 5)
                      .map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.clientName}</TableCell>
                          <TableCell>
                            {format(appointment.date.toDate(), 'dd/MM', { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusTranslation(appointment.status as 'pending' | 'confirmed' | 'completed' | 'cancelled')}
                              color={appointment.status === 'pending' ? 'warning' : 'success'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AdminPaper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <AdminPaper>
              <Typography variant="h5" gutterBottom>
                Gerenciar Agendamentos
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Serviço</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Horário</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.clientName}</TableCell>
                        <TableCell>{appointment.service}</TableCell>
                        <TableCell>
                          {format(appointment.date.toDate(), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={appointment.status}
                              onChange={(e) => handleStatusChange(appointment.id, e.target.value as 'pending' | 'confirmed' | 'completed' | 'cancelled')}
                            >
                              <MenuItem value="pending">Pendente</MenuItem>
                              <MenuItem value="confirmed">Confirmado</MenuItem>
                              <MenuItem value="completed">Concluído</MenuItem>
                              <MenuItem value="cancelled">Cancelado</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {appointment.description || 'Sem descrição'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Enviar WhatsApp">
                            <IconButton
                              color="primary"
                              onClick={() => window.open(`https://wa.me/55${appointment.phone.replace(/\D/g, '')}`, '_blank')}
                            >
                              <WhatsApp />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver detalhes">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewDetails(appointment)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AdminPaper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <AdminPaper>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  Promoções
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => {
                    setSelectedPromotion({
                      title: '',
                      description: '',
                      price: '',
                      validUntil: '',
                      isActive: true
                    });
                    setDialogOpen(true);
                  }}
                >
                  Nova Promoção
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Preço</TableCell>
                      <TableCell>Válido até</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {promotions.map((promotion) => (
                      <TableRow key={promotion.id}>
                        <TableCell>{promotion.title}</TableCell>
                        <TableCell>{promotion.description}</TableCell>
                        <TableCell>R$ {promotion.price}</TableCell>
                        <TableCell>
                          {format(new Date(promotion.validUntil), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={promotion.isActive ? 'Ativa' : 'Inativa'}
                            color={promotion.isActive ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Editar">
                            <IconButton
                              onClick={() => handlePromotionEdit(promotion)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              onClick={() => handlePromotionDelete(promotion.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AdminPaper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <AdminPaper>
              <Typography variant="h5" gutterBottom>
                Clientes
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Telefone</TableCell>
                      <TableCell>Data de Cadastro</TableCell>
                      <TableCell>Total Gasto</TableCell>
                      <TableCell>Total de Agendamentos</TableCell>
                      <TableCell>Último Agendamento</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>
                          {format(client.createdAt.toDate(), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          R$ {client.totalSpent.toFixed(2)}
                        </TableCell>
                        <TableCell>{client.totalAppointments}</TableCell>
                        <TableCell>
                          {client.lastAppointment ? (
                            format(client.lastAppointment.date.toDate(), 'dd/MM/yyyy', { locale: ptBR })
                          ) : (
                            'Nenhum'
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Ver detalhes">
                            <IconButton color="primary">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Enviar WhatsApp">
                            <IconButton
                              color="primary"
                              onClick={() => window.open(`https://wa.me/55${client.phone.replace(/\D/g, '')}`, '_blank')}
                            >
                              <WhatsApp />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AdminPaper>
          </Grid>
        </Grid>
      </TabPanel>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedPromotion?.id ? 'Editar Promoção' : 'Nova Promoção'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={selectedPromotion?.title || ''}
                onChange={(e) => setSelectedPromotion(prev => ({ ...prev, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                multiline
                rows={3}
                value={selectedPromotion?.description || ''}
                onChange={(e) => setSelectedPromotion(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preço"
                type="number"
                value={selectedPromotion?.price || ''}
                onChange={(e) => setSelectedPromotion(prev => ({ ...prev, price: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Válido até"
                type="date"
                value={selectedPromotion?.validUntil || ''}
                onChange={(e) => setSelectedPromotion(prev => ({ ...prev, validUntil: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={selectedPromotion?.isActive ? 'active' : 'inactive'}
                onChange={(e) => setSelectedPromotion(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
              >
                <MenuItem value="active">Ativa</MenuItem>
                <MenuItem value="inactive">Inativa</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handlePromotionSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalhes do Agendamento
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Cliente
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.clientName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Contato
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.phone}
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Serviço
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.service}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Data e Horário
                </Typography>
                <Typography variant="body1">
                  {format(selectedAppointment.date.toDate(), 'dd/MM/yyyy', { locale: ptBR })}
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.time}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Descrição
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.description || 'Sem descrição'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedAppointment.status}
                    onChange={(e) => handleStatusChange(selectedAppointment.id, e.target.value as 'pending' | 'confirmed' | 'completed' | 'cancelled')}
                    label="Status"
                  >
                    <MenuItem value="pending">Pendente</MenuItem>
                    <MenuItem value="confirmed">Confirmado</MenuItem>
                    <MenuItem value="completed">Concluído</MenuItem>
                    <MenuItem value="cancelled">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Fechar</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<WhatsApp />}
            onClick={() => window.open(`https://wa.me/55${selectedAppointment?.phone.replace(/\D/g, '')}`, '_blank')}
          >
            Enviar WhatsApp
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Perfil do Administrador</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={profileData.email}
                disabled
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telefone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                variant="outlined"
                placeholder="(98) 99999-9999"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleProfileUpdate} variant="contained">
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
};

export default Admin; 