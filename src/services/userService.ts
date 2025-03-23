import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserData {
  name: string;
  email: string;
  phone?: string;
  isAdmin?: boolean;
  loyaltyPoints?: number;
  totalAppointments?: number;
}

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    throw error;
  }
};

export const updateUserData = async (userId: string, data: Partial<UserData>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    throw error;
  }
}; 