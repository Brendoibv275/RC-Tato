import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  loyaltyPoints?: number;
  totalAppointments?: number;
  monthlyGoal?: number;
  currentRevenue?: number;
  lastMonthRevenue?: number;
  createdAt: any;
}

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as UserData;
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

export const getAllClients = async (): Promise<UserData[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('isAdmin', '==', false));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || '',
      email: doc.data().email || '',
      phone: doc.data().phone || '',
      isAdmin: false,
      loyaltyPoints: doc.data().loyaltyPoints || 0,
      totalAppointments: doc.data().totalAppointments || 0,
      monthlyGoal: doc.data().monthlyGoal || 0,
      currentRevenue: doc.data().currentRevenue || 0,
      lastMonthRevenue: doc.data().lastMonthRevenue || 0,
      createdAt: doc.data().createdAt || new Date(),
    }));
  } catch (error) {
    console.error('Erro ao buscar todos os clientes:', error);
    throw error;
  }
};

export const updateAdminFinancialGoals = async (userId: string, monthlyGoal: number): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      monthlyGoal,
      currentRevenue: 0,
      lastMonthRevenue: 0,
    });
  } catch (error) {
    console.error('Erro ao atualizar metas financeiras:', error);
    throw error;
  }
}; 