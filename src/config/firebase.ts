import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDd0qBOH6OkoBkh2sDBSOHAVcK_rmL4RZ8",
  authDomain: "r7-tatoo.firebaseapp.com",
  projectId: "r7-tatoo",
  storageBucket: "r7-tatoo.firebasestorage.app",
  messagingSenderId: "206875680719",
  appId: "1:206875680719:web:65275f3754969e11517cba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

// Coleções do Firestore
export const collections = {
  users: 'users',
  appointments: 'appointments',
  promotions: 'promotions',
} as const;

// Tipos de dados
export interface Promotion {
  id?: string;
  title: string;
  description: string;
  price: number;
  validUntil: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 