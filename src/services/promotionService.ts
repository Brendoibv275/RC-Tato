import { db, collections, Promotion } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';

export const getPromotions = async (): Promise<Promotion[]> => {
  try {
    const promotionsRef = collection(db, collections.promotions);
    const snapshot = await getDocs(promotionsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      validUntil: doc.data().validUntil.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Promotion[];
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    throw error;
  }
};

export const createPromotion = async (promotion: Omit<Promotion, 'id'>): Promise<string> => {
  try {
    const promotionsRef = collection(db, collections.promotions);
    const promotionToSave = {
      ...promotion,
      validUntil: Timestamp.fromDate(promotion.validUntil),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(promotionsRef, promotionToSave);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    throw error;
  }
};

export const updatePromotion = async (id: string, promotion: Partial<Promotion>): Promise<void> => {
  try {
    const promotionRef = doc(db, collections.promotions, id);
    const promotionToUpdate = {
      ...promotion,
      validUntil: promotion.validUntil ? Timestamp.fromDate(promotion.validUntil) : undefined,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(promotionRef, promotionToUpdate);
  } catch (error) {
    console.error('Erro ao atualizar promoção:', error);
    throw error;
  }
};

export const deletePromotion = async (id: string): Promise<void> => {
  try {
    const promotionRef = doc(db, collections.promotions, id);
    await deleteDoc(promotionRef);
  } catch (error) {
    console.error('Erro ao excluir promoção:', error);
    throw error;
  }
}; 