'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  BarChart3, 
  Plus, 
  Minus, 
  Search,
  Check,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers, getAllDashboards, grantDashboardPermission, revokeDashboardPermission } from '@/lib/firestore';
import { User, Dashboard } from '@/types';

export default function PermissionManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'by-user' | 'by-dashboard'>('by-user');
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: boolean}>({});
  const { user: currentUser, isAdmin } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, dashboardsData] = await Promise.all([
        getAllUsers(),
        getAllDashboards()
      ]);
      setUsers(usersData.filter(u => u.isActive));
      setDashboards(dashboardsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (userId: string, dashboardId: string) => {
    const dashboard = dashboards.find(d => d.id === dashboardId);
    return dashboard?.permissions.includes(userId) || false;
  };

  const togglePermission = async (userId: string, dashboardId: string) => {
    try {
      const currentHasPermission = hasPermission(userId, dashboardId);
      
      if (currentHasPermission) {
        await revokeDashboardPermission(userId, dashboardId);
      } else {
        await grantDashboardPermission(userId, dashboardId, currentUser?.uid || '');
      }
      
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error toggling permission:', error);
      alert('Error al cambiar permisos');
    }
  };

  const getUserDashboardCount = (userId: string) => {
    return dashboards.filter(d => d.permissions.includes(userId)).length;
  };

  const getDashboardUserCount = (dashboardId: string) => {
    const dashboard = dashboards.find(d => d.id === dashboardId);
    return dashboard?.permissions.length || 0;
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dashboard.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin()) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-800">Acceso Denegado</h2>
          <p className="text-red-600">Solo los administradores pueden gestionar permisos.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="text-center py-12">
          <div className="text-neutral-500">Cargando permisos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wider text-neutral-500">ADMINISTRACIÓN</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-neutral-900">
            Gestión de Permisos
          </h1>
          <p className="mt-3 text-xl text-neutral-600">
            Controla el acceso de usuarios a los dashboards de Power BI.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{users.length}</p>
              <p className="text-sm text-neutral-500">Usuarios Activos</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{dashboards.length}</p>
              <p className="text-sm text-neutral-500">Dashboards</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {dashboards.reduce((sum, d) => sum + d.permissions.length, 0)}
              </p>
              <p className="text-sm text-neutral-500">Permisos Totales</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg border border-neutral-200 bg-white p-1">
          <button
            onClick={() => setSelectedView('by-user')}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              selectedView === 'by-user' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Por Usuario
          </button>
          <button
            onClick={() => setSelectedView('by-dashboard')}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              selectedView === 'by-dashboard' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Por Dashboard
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl bg-white border border-neutral-200 px-4 py-2 shadow-sm min-w-80">
          <Search className="h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder={selectedView === 'by-user' ? 'Buscar usuarios...' : 'Buscar dashboards...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
          />
        </div>
      </div>

      {/* Content */}
      {selectedView === 'by-user' ? (
        /* By User View */
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.uid} className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 font-semibold">
                    {(user.displayName || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      {user.displayName || user.username}
                    </h3>
                    <p className="text-sm text-neutral-500">{user.email}</p>
                    <p className="text-xs text-neutral-400">
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'} • {getUserDashboardCount(user.uid)} dashboards
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboards.map((dashboard) => {
                    const hasAccess = hasPermission(user.uid, dashboard.id);
                    return (
                      <div key={dashboard.id} className={`
                        flex items-center justify-between p-4 rounded-lg border transition-colors
                        ${hasAccess 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-neutral-200 bg-neutral-50'
                        }
                      `}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <BarChart3 className={`h-5 w-5 ${hasAccess ? 'text-green-600' : 'text-neutral-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm truncate ${hasAccess ? 'text-green-900' : 'text-neutral-700'}`}>
                              {dashboard.name}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => togglePermission(user.uid, dashboard.id)}
                          className={`
                            flex items-center justify-center h-8 w-8 rounded-full transition-colors
                            ${hasAccess 
                              ? 'bg-green-200 hover:bg-green-300 text-green-800' 
                              : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-600'
                            }
                          `}
                          title={hasAccess ? 'Revocar acceso' : 'Conceder acceso'}
                        >
                          {hasAccess ? <Check size={16} /> : <Plus size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* By Dashboard View */
        <div className="space-y-4">
          {filteredDashboards.map((dashboard) => (
            <div key={dashboard.id} className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{dashboard.name}</h3>
                    {dashboard.description && (
                      <p className="text-sm text-neutral-500">{dashboard.description}</p>
                    )}
                    <p className="text-xs text-neutral-400">
                      {getDashboardUserCount(dashboard.id)} usuarios con acceso
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => {
                    const hasAccess = hasPermission(user.uid, dashboard.id);
                    return (
                      <div key={user.uid} className={`
                        flex items-center justify-between p-4 rounded-lg border transition-colors
                        ${hasAccess 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-neutral-200 bg-neutral-50'
                        }
                      `}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`
                            flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold
                            ${hasAccess ? 'bg-green-200 text-green-800' : 'bg-neutral-200 text-neutral-600'}
                          `}>
                            {(user.displayName || user.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm truncate ${hasAccess ? 'text-green-900' : 'text-neutral-700'}`}>
                              {user.displayName || user.username}
                            </p>
                            <p className={`text-xs truncate ${hasAccess ? 'text-green-600' : 'text-neutral-500'}`}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => togglePermission(user.uid, dashboard.id)}
                          className={`
                            flex items-center justify-center h-8 w-8 rounded-full transition-colors
                            ${hasAccess 
                              ? 'bg-green-200 hover:bg-green-300 text-green-800' 
                              : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-600'
                            }
                          `}
                          title={hasAccess ? 'Revocar acceso' : 'Conceder acceso'}
                        >
                          {hasAccess ? <Check size={16} /> : <Plus size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900">Gestión de Permisos</h4>
            <p className="text-sm text-blue-700 mt-1">
              Los cambios en permisos se aplican inmediatamente. Los usuarios solo podrán ver y acceder 
              a los dashboards para los que tengan permisos explícitos. Los administradores tienen 
              acceso completo a todos los dashboards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}