import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Promotion {
  id?: string;
  title: string;
  description: string;
  price: number;
  validUntil: string;
  isActive: boolean;
}

export const getPromotions = async (): Promise<Promotion[]> => {
  try {
    const promotionsRef = collection(db, 'promotions');
    const promotionsSnapshot = await getDocs(promotionsRef);
    return promotionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Promotion[];
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    throw error;
  }
};

export const createPromotion = async (promotion: Omit<Promotion, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'promotions'), promotion);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    throw error;
  }
};

export const updatePromotion = async (promotionId: string, promotion: Partial<Promotion>): Promise<void> => {
  try {
    const promotionRef = doc(db, 'promotions', promotionId);
    await updateDoc(promotionRef, promotion);
  } catch (error) {
    console.error('Erro ao atualizar promoção:', error);
    throw error;
  }
};

export const deletePromotion = async (promotionId: string): Promise<void> => {
  try {
    const promotionRef = doc(db, 'promotions', promotionId);
    await deleteDoc(promotionRef);
  } catch (error) {
    console.error('Erro ao excluir promoção:', error);
    throw error;
  }
}; 