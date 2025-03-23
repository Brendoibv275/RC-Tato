import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface UserData {
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'admin';
  loyaltyPoints: number;
  totalAppointments: number;
  createdAt: Date;
  lastVisit?: Date;
  address?: string;
  cpf?: string;
  profileImage?: string;
  isAdmin?: boolean;
}

// Registro de novo usuário
export const registerUser = async (email: string, password: string, name: string, phone: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Atualizar o perfil do usuário com o nome
    await updateProfile(user, { displayName: name });

    // Criar documento do usuário no Firestore com campos de fidelização
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      name,
      phone,
      isAdmin: false,
      loyaltyPoints: 0,
      totalAppointments: 0,
      createdAt: new Date(),
      lastVisit: new Date()
    });

    return user;
  } catch (error: any) {
    console.error('Erro no registro:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Login com email e senha
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await loadUserData(userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error('Erro no login:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Login com Google
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Verificar se o usuário já existe no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      phone: '',
      isAdmin: false,
      createdAt: new Date()
    }, { merge: true });

    return user;
  } catch (error: any) {
    console.error('Erro no login com Google:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Logout
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Erro ao fazer logout:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Buscar dados do usuário
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      
      // Atualizar última visita
      await updateDoc(doc(db, 'users', userId), {
        lastVisit: new Date()
      });

      return userData;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    throw error;
  }
};

// Atualizar pontos de fidelidade
export const updateLoyaltyPoints = async (userId: string, points: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      await setDoc(userRef, {
        ...userData,
        loyaltyPoints: userData.loyaltyPoints + points,
        totalAppointments: userData.totalAppointments + 1
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar pontos:', error);
    throw error;
  }
};

export const loadUserData = async (userId: string) => {
  try {
    const userData = await getUserData(userId);
    return userData;
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    throw error;
  }
};

// Atualizar dados do usuário
export const updateUserData = async (userId: string, data: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    throw error;
  }
};

// Função auxiliar para traduzir mensagens de erro do Firebase
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Email inválido.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/email-already-in-use':
      return 'Este email já está em uso.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/operation-not-allowed':
      return 'Operação não permitida.';
    case 'auth/popup-closed-by-user':
      return 'Login com Google cancelado.';
    default:
      return 'Ocorreu um erro na autenticação.';
  }
}; 