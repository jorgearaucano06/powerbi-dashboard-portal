'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardsByUser } from '@/lib/firestore';

interface PowerBIDashboard {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export default function PowerBIDashboard() {
  const [dashboard, setDashboard] = useState<PowerBIDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    loadUserDashboard();
  }, [user]);

  const loadUserDashboard = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Obtener dashboards que el usuario puede ver
      const userDashboards = await getDashboardsByUser(user.uid);
      
      if (userDashboards.length > 0) {
        // Priorizar ADT TEMPRANA si el usuario tiene acceso, sino mostrar el primero
        let selectedDashboard = userDashboards.find(d => d.id === 'adt-temprana') || userDashboards[0];
        
        
        
        setDashboard({
          id: selectedDashboard.id,
          name: selectedDashboard.name,
          url: selectedDashboard.powerBiUrl,
          icon: selectedDashboard.icon
        });
      } else {
        
        setError('No tienes acceso a ningún dashboard. Contacta al administrador para obtener permisos.');
      }
    } catch (err: any) {
      console.error('❌ Error loading user dashboard:', err);
      setError(`Error cargando dashboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-400 text-2xl mr-3">⚠️</div>
            <div>
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-yellow-400 text-2xl mr-3">📊</div>
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Dashboard no disponible</h3>
              <p className="text-yellow-600 mt-1">No tienes acceso a ningún dashboard</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Power BI Embed - Full Screen */}
      <div className="w-full h-full bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <iframe
          src={dashboard.url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen={true}
          className="w-full h-full min-h-[calc(100vh-120px)]"
          title={dashboard.name}
        />
      </div>
    </div>
  );
}