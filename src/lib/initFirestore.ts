import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Script para crear manualmente el documento del admin
export const createAdminDocument = async () => {
  try {
    console.log('Creating admin document manually...');
    
    // Datos del usuario admin - usar el UID real de Firebase Auth
    const adminData = {
      uid: 'TEMP_UID', // Este será reemplazado
      email: 'admin@jotaapex.com',
      displayName: 'Administrador',
      username: 'admin',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    // Para obtener el UID real, necesitamos hacerlo desde la consola de Firebase
    // Por ahora, creamos con un UID temporal
    console.log('Admin document would be created with:', adminData);
    
  } catch (error) {
    console.error('Error creating admin document:', error);
  }
};

// Función para crear el documento del admin con UID específico
export const createAdminWithUID = async (uid: string) => {
  try {
    console.log('Creating admin document with UID:', uid);
    
    const adminData = {
      uid: uid,
      email: 'admin@jotaapex.com',
      displayName: 'Administrador',
      username: 'admin',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    await setDoc(doc(db, 'users', uid), adminData);
    console.log('✅ Admin document created successfully!');
    return adminData;
  } catch (error) {
    console.error('❌ Error creating admin document:', error);
    throw error;
  }
};