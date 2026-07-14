import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  deleteUser,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';

// Función para buscar usuario por username y obtener su email
export const getUserEmailByUsername = async (username: string): Promise<string | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Tratar diferentes estructuras de documento
    let email = null;
    
    if (userData.email) {
      email = userData.email;
    } else if (username === 'admin') {
      // Para el usuario admin específicamente, usar email fijo
      email = 'admin@jotaapex.com';
    }
    
    return email;
  } catch (error) {
    console.error('❌ Error getting user email by username:', error);
    return null;
  }
};

// Función mejorada de login que acepta email o username
export const signInWithEmailOrUsername = async (emailOrUsername: string, password: string) => {
  try {
    let email = emailOrUsername;
    
    // Si no contiene @ es un username, buscar el email correspondiente
    if (!emailOrUsername.includes('@')) {
      const userEmail = await getUserEmailByUsername(emailOrUsername);
      if (!userEmail) {
        const error = { code: 'auth/user-not-found', message: 'Usuario no encontrado' };
        console.error('User not found:', error);
        throw error;
      }
      email = userEmail;
    }
    
    // Realizar login con email y contraseña
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    console.error('Sign in error - Code:', error.code);
    console.error('Sign in error - Message:', error.message);
    console.error('Sign in error - Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
};

// Función para crear usuario administrador inicial
export const createAdminUser = async () => {
  try {
    const adminEmail = 'admin@jotaapex.com';
    const adminPassword = '123456';
    
    // Primero verificar si el documento existe en Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', adminEmail));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return;
    }
    
    
    // Intentar crear usuario en Firebase Auth
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(
        auth, 
        adminEmail, 
        adminPassword
      );
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-in-use') {
        try {
          const tempCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          userCredential = tempCredential;
        } catch (signInError: any) {
          console.error('❌ Cannot sign in with existing credentials:', signInError.code);
          if (signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/wrong-password') {
            throw new Error(`Admin user exists but password is incorrect. Please reset the password for ${adminEmail} in Firebase Console or delete the user and try again.`);
          }
          throw signInError;
        }
      } else {
        throw authError;
      }
    }
    
    const { user } = userCredential;
    
    // Crear documento del usuario admin en Firestore
    const adminUser: User = {
      uid: user.uid,
      email: adminEmail,
      displayName: 'Administrador',
      username: 'admin',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    await setDoc(doc(db, 'users', user.uid), adminUser);
    
    
    // Cerrar la sesión temporal si hicimos login para obtener el UID
    if (auth.currentUser && auth.currentUser.uid === user.uid) {
      await firebaseSignOut(auth);
    }
    
    return adminUser;
  } catch (error: any) {
    console.error('Error creando usuario administrador:', error);
    throw error;
  }
};

// Función para resetear completamente el usuario administrador
export const resetAdminUser = async () => {
  try {
    const adminEmail = 'admin@jotaapex.com';
    const adminPassword = '123456';
    
    // Primero intentar eliminar cualquier documento existente en Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', adminEmail));
    const querySnapshot = await getDocs(q);
    
    // Note: No podemos eliminar documentos aquí sin importar deleteDoc
    if (!querySnapshot.empty) {
    }
    
    // Crear usuario nuevo directamente (esto fallará si ya existe en Auth)
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        adminEmail, 
        adminPassword
      );
      
      const { user } = userCredential;
      
      // Crear documento del usuario admin en Firestore
      const adminUser: User = {
        uid: user.uid,
        email: adminEmail,
        displayName: 'Administrador',
        username: 'admin',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      await setDoc(doc(db, 'users', user.uid), adminUser);
      
      // Cerrar sesión inmediatamente
      await firebaseSignOut(auth);
      
      return adminUser;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Admin user already exists in Firebase Auth. Please delete the existing user from Firebase Console first, then try again.');
      }
      throw error;
    }
  } catch (error: any) {
    console.error('❌ Error resetting admin user:', error);
    throw error;
  }
};

// Función para migrar el usuario admin existente a Firebase Auth
export const migrateExistingAdmin = async () => {
  try {
    
    // Buscar el documento admin existente en Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', 'admin'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('No se encontró usuario admin existente en Firestore');
    }
    
    const adminDocRef = querySnapshot.docs[0];
    const existingAdmin = adminDocRef.data();
    
    // Ahora necesitamos el UID del nuevo usuario auth (test123@example.com)
    const currentUser = auth.currentUser;
    if (!currentUser) {
      // Hacer login con test123@example.com para obtener el UID
      const testCredential = await signInWithEmailAndPassword(auth, 'test123@example.com', '123456');
      const newUID = testCredential.user.uid;
      
      
      // Crear nuevo documento con el UID de Firebase Auth
      const newAdminData = {
        uid: newUID,
        email: 'admin@jotaapex.com', // Cambiar email también
        displayName: existingAdmin.fullName || 'Administrator',
        username: 'admin',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        // Mantener permisos existentes si existen
        permissions: existingAdmin.permissions || [],
        isFirstLogin: false
      };
      
      // Crear el nuevo documento
      await setDoc(doc(db, 'users', newUID), newAdminData);
      
      // Cerrar sesión
      await firebaseSignOut(auth);
      
      return newAdminData;
    }
    
  } catch (error: any) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
};

export const createUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Crear nuevo perfil de usuario
    const newUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || '',
      username: firebaseUser.email?.split('@')[0] || '',
      role: firebaseUser.email === 'admin@jotaapex.com' ? 'admin' : 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isFirstLogin: false, // Los usuarios creados manualmente no necesitan cambio forzado
    };
    
    await setDoc(userRef, newUser);
    return newUser;
  } else {
    const existingData = userSnap.data();
    
    // Convertir el documento existente al formato esperado
    const userProfile: User = {
      uid: existingData.uid,
      email: existingData.email || firebaseUser.email!,
      displayName: existingData.fullName || existingData.displayName || 'Administrator',
      username: existingData.username,
      role: existingData.role,
      createdAt: existingData.createdAt || new Date(),
      updatedAt: new Date(),
      isActive: existingData.isActive !== false, // Default to true if not specified
      isFirstLogin: existingData.isFirstLogin || false,
    };
    
    return userProfile;
  }
};