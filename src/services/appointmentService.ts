import { db } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, Timestamp, query, where, orderBy, getDoc, deleteDoc } from 'firebase/firestore';

export interface Appointment {
  id?: string;
  clientName: string;
  email: string;
  phone: string;
  service: string;
  description?: string;
  date: Timestamp;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  userId: string;
  clientId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  price?: number;
  pointsEarned?: number;
}

export const getAppointments = async (userId?: string, clientId?: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    let q;
    
    if (userId) {
      console.log('Buscando agendamentos por userId:', userId);
      q = query(
        appointmentsRef,
        where('userId', '==', userId)
      );
    } else if (clientId) {
      console.log('Buscando agendamentos por clientId:', clientId);
      q = query(
        appointmentsRef,
        where('clientId', '==', clientId)
      );
    } else {
      console.log('Buscando todos os agendamentos');
      q = query(appointmentsRef);
    }
    
    const querySnapshot = await getDocs(q);
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];

    // Ordenar os agendamentos por data em memória
    appointments.sort((a, b) => {
      const dateA = a.date.toDate();
      const dateB = b.date.toDate();
      return dateB.getTime() - dateA.getTime();
    });

    console.log('Agendamentos encontrados:', appointments);
    return appointments;
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }
};

export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    console.log('Criando agendamento com dados:', appointmentData);

    // Buscar dados do usuário
    const userDoc = await getDoc(doc(db, 'users', appointmentData.userId));
    const userData = userDoc.data();

    // Calcular pontos baseado no serviço
    const pointsEarned = calculatePointsForService(appointmentData.service);
    
    // Atualizar pontos de fidelidade do usuário
    const newLoyaltyPoints = (userData?.loyaltyPoints || 0) + pointsEarned;
    const newTotalAppointments = (userData?.totalAppointments || 0) + 1;

    // Criar o agendamento
    const appointmentsRef = collection(db, 'appointments');
    const appointmentToSave = {
      ...appointmentData,
      date: Timestamp.fromDate(appointmentData.date as unknown as Date),
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      pointsEarned,
      loyaltyPoints: newLoyaltyPoints,
      totalAppointments: newTotalAppointments
    };

    console.log('Dados do agendamento a serem salvos:', appointmentToSave);
    const docRef = await addDoc(appointmentsRef, appointmentToSave);

    // Atualizar dados do usuário
    await updateDoc(doc(db, 'users', appointmentData.userId), {
      loyaltyPoints: newLoyaltyPoints,
      totalAppointments: newTotalAppointments
    });

    console.log('Agendamento criado com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, { status });
  } catch (error) {
    console.error('Erro ao atualizar status do agendamento:', error);
    throw error;
  }
};

export const getAppointmentsByUserId = async (userId: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('clientId', '==', userId));
    const appointmentsSnapshot = await getDocs(q);
    return appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Erro ao buscar agendamentos do usuário:', error);
    throw error;
  }
};

export const getAllAppointments = async (): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsSnapshot = await getDocs(appointmentsRef);
    return appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }
};

export const getAllClients = async () => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
};

export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'appointments', appointmentId));
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    throw error;
  }
};

// Função auxiliar para calcular pontos baseado no serviço
const calculatePointsForService = (service: string): number => {
  switch (service) {
    case 'Tatuagem Minimalista':
      return 50;
    case 'Tatuagem Minimalista - Pacote 5':
      return 250;
    case 'Cover-up':
      return 100;
    case 'Tatuagem Autoral':
      return 150;
    default:
      return 50;
  }
}; 