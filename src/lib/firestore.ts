import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import { User, Dashboard, Permission } from '@/types';

// User Management Functions
export const createUser = async (userData: {
  email: string;
  password: string;
  displayName?: string;
  role: 'admin' | 'user';
}) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const { user } = userCredential;

    // Create user document in Firestore
    const userDoc: User = {
      uid: user.uid,
      email: userData.email,
      displayName: userData.displayName || '',
      username: userData.email.split('@')[0],
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    await updateDoc(doc(db, 'users', user.uid), {
      uid: userDoc.uid,
      email: userDoc.email,
      displayName: userDoc.displayName || '',
      username: userDoc.username,
      role: userDoc.role,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
      isActive: userDoc.isActive,
    });
    return userDoc;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: data.uid || doc.id,
        email: data.email || '',
        displayName: data.displayName || data.fullName || '',
        username: data.username || '',
        role: data.role || 'user',
        isActive: data.isActive !== false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as User;
    });
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export const updateUser = async (uid: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isActive: false,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Dashboard Management Functions
export const createDashboard = async (dashboardData: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    
    const dashboardsRef = collection(db, 'dashboards');
    const docRef = await addDoc(dashboardsRef, {
      ...dashboardData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating dashboard:', error);
    throw error;
  }
};

export const getAllDashboards = async (): Promise<Dashboard[]> => {
  try {
    const dashboardsRef = collection(db, 'dashboards');
    const querySnapshot = await getDocs(dashboardsRef);
    
    const dashboards = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Normalizar URL - siempre usar powerBiUrl
        powerBiUrl: data.powerBiUrl || data.url,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    }) as Dashboard[];
    
    // Filtrar solo activos
    const activeDashboards = dashboards.filter(dashboard => 
      dashboard.isActive !== false
    );
    
    // Ordenar por fecha de creación
    return activeDashboards.sort((a, b) => {
      const aDate = a.createdAt || new Date(0);
      const bDate = b.createdAt || new Date(0);
      return bDate.getTime() - aDate.getTime();
    });
  } catch (error) {
    console.error('❌ Error getting dashboards:', error);
    throw error;
  }
};

export const getDashboardsByUser = async (uid: string): Promise<Dashboard[]> => {
  try {
    const dashboardsRef = collection(db, 'dashboards');
    const querySnapshot = await getDocs(dashboardsRef);
    
    const allDashboards = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Normalizar URL - siempre usar powerBiUrl
        powerBiUrl: data.powerBiUrl || data.url,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    }) as Dashboard[];
    
    // Filtrar en el cliente
    const userDashboards = allDashboards.filter(dashboard => {
      const isActive = dashboard.isActive !== false;
      const hasPermission = dashboard.permissions && dashboard.permissions.includes(uid);
      return isActive && hasPermission;
    });
    
    // Ordenar por fecha de creación
    return userDashboards.sort((a, b) => {
      const aDate = a.createdAt || new Date(0);
      const bDate = b.createdAt || new Date(0);
      return bDate.getTime() - aDate.getTime();
    });
  } catch (error) {
    console.error('❌ Error getting user dashboards:', error);
    throw error;
  }
};

export const updateDashboard = async (id: string, dashboardData: Partial<Dashboard>) => {
  try {
    const dashboardRef = doc(db, 'dashboards', id);
    await updateDoc(dashboardRef, {
      ...dashboardData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating dashboard:', error);
    throw error;
  }
};

export const deleteDashboard = async (id: string) => {
  try {
    const dashboardRef = doc(db, 'dashboards', id);
    await updateDoc(dashboardRef, {
      isActive: false,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    throw error;
  }
};

// Permission Management Functions
export const grantDashboardPermission = async (userId: string, dashboardId: string, grantedBy: string) => {
  try {
    const dashboardRef = doc(db, 'dashboards', dashboardId);
    const dashboardSnap = await getDoc(dashboardRef);
    
    if (dashboardSnap.exists()) {
      const dashboard = dashboardSnap.data() as Dashboard;
      const updatedPermissions = [...dashboard.permissions];
      
      if (!updatedPermissions.includes(userId)) {
        updatedPermissions.push(userId);
        await updateDoc(dashboardRef, {
          permissions: updatedPermissions,
          updatedAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.error('Error granting permission:', error);
    throw error;
  }
};

export const revokeDashboardPermission = async (userId: string, dashboardId: string) => {
  try {
    const dashboardRef = doc(db, 'dashboards', dashboardId);
    const dashboardSnap = await getDoc(dashboardRef);
    
    if (dashboardSnap.exists()) {
      const dashboard = dashboardSnap.data() as Dashboard;
      const updatedPermissions = dashboard.permissions.filter(uid => uid !== userId);
      
      await updateDoc(dashboardRef, {
        permissions: updatedPermissions,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error revoking permission:', error);
    throw error;
  }
};