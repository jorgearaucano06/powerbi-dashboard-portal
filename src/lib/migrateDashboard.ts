import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const migrateAdtTempranaDashboard = async (adminUid: string) => {
  try {
    console.log('🔄 Migrating adt-temprana dashboard...');
    
    // Leer el documento actual
    const dashboardRef = doc(db, 'dashboards', 'adt-temprana');
    const dashboardSnap = await getDoc(dashboardRef);
    
    if (!dashboardSnap.exists()) {
      console.log('❌ adt-temprana dashboard not found');
      return false;
    }
    
    const currentData = dashboardSnap.data();
    console.log('📄 Current dashboard data:', currentData);
    
    // Verificar si ya tiene los campos nuevos
    if (currentData.isActive !== undefined && currentData.permissions !== undefined) {
      console.log('✅ Dashboard already migrated');
      return true;
    }
    
    // Migrar al nuevo formato
    const migratedData = {
      ...currentData,
      isActive: true,
      permissions: [adminUid], // Solo admin tiene acceso por defecto
      createdBy: adminUid,
      createdAt: currentData.createdAt || new Date(),
      updatedAt: new Date(),
      icon: currentData.icon || 'BarChart3',
      description: currentData.description || 'Dashboard de ADT Temprana'
    };
    
    console.log('🚀 Updating dashboard with new format:', migratedData);
    
    await updateDoc(dashboardRef, migratedData);
    
    console.log('✅ Dashboard migrated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error migrating dashboard:', error);
    throw error;
  }
};