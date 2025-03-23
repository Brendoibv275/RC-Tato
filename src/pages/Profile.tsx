import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Star,
  History,
  AdminPanelSettings,
  Add,
  Edit,
  PhotoCamera,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, updateUserData } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { getAppointments } from '../services/appointmentService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#1e1e1e',
}));

const AddIcon = styled(Add)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    address: '',
    cpf: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          console.log('Iniciando carregamento do perfil para usuário:', user.uid);
          setLoading(true);
          
          // Carregar dados do usuário
          console.log('Buscando dados do usuário...');
          const data = await getUserData(user.uid);
          console.log('Dados do usuário carregados:', data);
          
          if (data) {
            setUserData(data);
            setEditData({
              address: data.address || '',
              cpf: data.cpf || '',
            });
            setProfileImage(data.profileImage || null);
            
            // Carregar agendamentos
            console.log('Buscando agendamentos...');
            const userAppointments = await getAppointments(user.uid);
            console.log('Agendamentos carregados:', userAppointments);
            setAppointments(userAppointments);
          } else {
            console.error('Dados do usuário não encontrados');
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('Nenhum usuário autenticado');
      }
    };

    loadUserData();
  }, [user]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;

    const file = event.target.files[0];
    const storageRef = ref(storage, `profile-images/${user.uid}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setProfileImage(downloadURL);
      
      // Atualizar URL da imagem no perfil do usuário
      await updateUserData(user.uid, { profileImage: downloadURL });
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
    }
  };

  const handleEditSave = async () => {
    if (!user) return;

    try {
      await updateUserData(user.uid, editData);
      setUserData(prev => ({ ...prev, ...editData }));
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };

  const calculateProgress = (points: number) => {
    return Math.min((points / 1000) * 100, 100);
  };

  if (loading || !userData) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography>Carregando...</Typography>
      </Container>
    );
  }

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Concluído';
      default:
        return 'Erro';
    }
  };

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Meu Perfil
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <ProfilePaper>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Box position="relative">
                <Avatar
                  src={profileImage || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                  }}
                >
                  {!profileImage && userData.name?.charAt(0)}
                </Avatar>
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <PhotoCamera />
                </IconButton>
              </Box>
              <Typography variant="h5" component="h2" sx={{ mt: 2 }}>
                {userData.name}
              </Typography>
              
              {userData.isAdmin && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AdminPanelSettings />}
                  onClick={() => navigate('/admin')}
                  sx={{ mt: 2 }}
                >
                  Painel Admin
                </Button>
              )}
            </Box>

            <List>
              <ListItem>
                <ListItemIcon>
                  <Email color="primary" />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={userData.email} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Phone color="primary" />
                </ListItemIcon>
                <ListItemText primary="Telefone" secondary={userData.phone || 'Não informado'} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOn color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Endereço" 
                  secondary={userData.address || 'Não informado'}
                  secondaryTypographyProps={{ style: { display: 'flex', alignItems: 'center' } }}
                />
                <IconButton size="small" onClick={() => setEditDialogOpen(true)}>
                  <Edit />
                </IconButton>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Star color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Pontos de Fidelidade" 
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        Pontos atuais: {userData.loyaltyPoints || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pontos pendentes: {appointments
                          .filter(a => a.status === 'pending' || a.status === 'confirmed')
                          .reduce((sum, a) => sum + (a.pointsEarned || 0), 0)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </List>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Progresso para desconto de 10%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={calculateProgress(userData.loyaltyPoints || 0)}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" color="text.secondary">
                {userData.loyaltyPoints || 0}/1000 pontos
              </Typography>
            </Box>
          </ProfilePaper>
        </Grid>

        <Grid item xs={12} md={8}>
          <ProfilePaper>
            <Box display="flex" alignItems="center" mb={3}>
              <History color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" component="h2">
                Meus Agendamentos
              </Typography>
            </Box>
            <List>
              {appointments.length > 0 ? (
                appointments.map((appointment, index) => (
                  <React.Fragment key={appointment.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="subtitle1">{appointment.service}</Typography>
                            <Chip
                              label={getStatusTranslation(appointment.status)}
                              color={
                                appointment.status === 'pending' ? 'warning' :
                                appointment.status === 'confirmed' ? 'success' :
                                appointment.status === 'completed' ? 'info' :
                                'error'
                              }
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Data: {format(appointment.date.toDate(), 'dd/MM/yyyy', { locale: ptBR })}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Horário: {appointment.time}
                            </Typography>
                            {appointment.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Descrição: {appointment.description}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < appointments.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" gutterBottom>
                    Você ainda não tem agendamentos.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/schedule')}
                    startIcon={<AddIcon />}
                  >
                    Agendar Agora
                  </Button>
                </Box>
              )}
            </List>
          </ProfilePaper>
        </Grid>
      </Grid>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Editar Informações</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Endereço"
            fullWidth
            value={editData.address}
            onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="CPF"
            fullWidth
            value={editData.cpf}
            onChange={(e) => setEditData(prev => ({ ...prev, cpf: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleEditSave} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 