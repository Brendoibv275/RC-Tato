import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

interface Appointment {
  id?: string;
  clientName: string;
  phone: string;
  service: string;
  date: Date;
  time: string;
  description: string;
  status: 'pending' | 'confirmed' | 'completed';
  notificationsSent: {
    confirmation?: boolean;
    dayBefore?: boolean;
    hourBefore?: boolean;
  };
}

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'notificationsSent'>) => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointment,
      notificationsSent: {
        confirmation: false,
        dayBefore: false,
        hourBefore: false,
      },
      createdAt: Timestamp.now(),
    });

    // Enviar confirmação via WhatsApp
    await sendWhatsAppNotification(
      appointment.phone,
      `Olá ${appointment.clientName}! Seu agendamento para ${appointment.service} foi realizado com sucesso para ${appointment.date.toLocaleDateString()} às ${appointment.time}. Aguardamos você!`
    );

    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    throw error;
  }
};

export const sendWhatsAppNotification = async (phone: string, message: string) => {
  try {
    // Formatar o número de telefone (remover caracteres não numéricos)
    const formattedPhone = phone.replace(/\D/g, '');
    
    // Criar URL do WhatsApp
    const whatsappUrl = `https://wa.me/55${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    // Abrir em nova aba
    window.open(whatsappUrl, '_blank');
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    throw error;
  }
};

export const checkAndSendNotifications = async () => {
  try {
    const now = new Date();
    const appointments = await getDocs(collection(db, 'appointments'));
    
    appointments.forEach(async (doc) => {
      const appointment = doc.data() as Appointment;
      const appointmentDate = appointment.date.toDate();
      
      // Verificar se precisa enviar notificação do dia anterior
      const dayBefore = new Date(appointmentDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      
      if (
        !appointment.notificationsSent.dayBefore &&
        now.getDate() === dayBefore.getDate() &&
        now.getMonth() === dayBefore.getMonth() &&
        now.getFullYear() === dayBefore.getFullYear()
      ) {
        await sendWhatsAppNotification(
          appointment.phone,
          `Olá ${appointment.clientName}! Lembrando que seu agendamento para ${appointment.service} é amanhã às ${appointment.time}. Aguardamos você!`
        );
        
        // Atualizar status da notificação
        await updateNotificationStatus(doc.id, 'dayBefore');
      }
      
      // Verificar se precisa enviar notificação de 1 hora antes
      const hourBefore = new Date(appointmentDate);
      hourBefore.setHours(hourBefore.getHours() - 1);
      
      if (
        !appointment.notificationsSent.hourBefore &&
        now.getHours() === hourBefore.getHours() &&
        now.getDate() === hourBefore.getDate() &&
        now.getMonth() === hourBefore.getMonth() &&
        now.getFullYear() === hourBefore.getFullYear()
      ) {
        await sendWhatsAppNotification(
          appointment.phone,
          `Olá ${appointment.clientName}! Seu agendamento para ${appointment.service} é em 1 hora! Aguardamos você!`
        );
        
        // Atualizar status da notificação
        await updateNotificationStatus(doc.id, 'hourBefore');
      }
    });
  } catch (error) {
    console.error('Erro ao verificar notificações:', error);
    throw error;
  }
};

const updateNotificationStatus = async (appointmentId: string, notificationType: keyof Appointment['notificationsSent']) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      [`notificationsSent.${notificationType}`]: true,
    });
  } catch (error) {
    console.error('Erro ao atualizar status da notificação:', error);
    throw error;
  }
}; 