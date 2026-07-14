// Script para inicializar el usuario administrador
// Este script debe ejecutarse una sola vez para crear el usuario admin inicial

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';

export const initializeAdmin = async () => {
  try {
    // Crear usuario admin en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@jotaapex.com', 
      '12345'
    );
    
    const { user } = userCredential;

    // Crear documento del usuario admin en Firestore
    const adminUser: User = {
      uid: user.uid,
      email: 'admin@jotaapex.com',
      displayName: 'Administrador',
      username: 'admin',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    await setDoc(doc(db, 'users', user.uid), adminUser);
    
    console.log('Usuario administrador creado exitosamente');
    console.log('Email: admin@jotaapex.com');
    console.log('Password: 12345');
    
    return adminUser;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('El usuario administrador ya existe');
    } else {
      console.error('Error creando usuario administrador:', error);
    }
    throw error;
  }
};

// Función para crear usuarios de prueba
export const createSampleUsers = async () => {
  const sampleUsers = [
    { email: 'usuario1@jotaapex.com', password: '12345', displayName: 'Usuario Uno', role: 'user' as const },
    { email: 'usuario2@jotaapex.com', password: '12345', displayName: 'Usuario Dos', role: 'user' as const },
  ];

  for (const userData of sampleUsers) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user: User = {
        uid: userCredential.user.uid,
        email: userData.email,
        displayName: userData.displayName,
        username: userData.email.split('@')[0],
        role: userData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), user);
      console.log(`Usuario ${userData.displayName} creado`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`Usuario ${userData.email} ya existe`);
      } else {
        console.error(`Error creando usuario ${userData.email}:`, error);
      }
    }
  }
};