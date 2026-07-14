'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Search,
  X,
  Save,
  Eye,
  Users,
  Link,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getAllDashboards, 
  getDashboardsByUser, 
  createDashboard, 
  updateDashboard, 
  deleteDashboard 
} from '@/lib/firestore';
import { migrateAdtTempranaDashboard } from '@/lib/migrateDashboard';
import { Dashboard } from '@/types';

// Iconos disponibles para dashboards
const DASHBOARD_ICONS = [
  { id: 'BarChart3', icon: BarChart3, name: 'Gráfico de Barras' },
  { id: 'Activity', icon: Activity, name: 'Actividad' },
  { id: 'Users', icon: Users, name: 'Usuarios' },
  { id: 'Link', icon: Link, name: 'Enlaces' },
  { id: 'Eye', icon: Eye, name: 'Vistas' },
];

export default function PowerBIManagement() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'my'>('my'); // 'all' para admins, 'my' para usuarios
  const { user: currentUser, isAdmin } = useAuth();

  // Nuevo dashboard state
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    powerBiUrl: '',
    icon: 'BarChart3',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadDashboards();
  }, [viewMode]);

  useEffect(() => {
    // Migrar dashboard adt-temprana al cargar el componente
    if (currentUser && isAdmin()) {
      migrateAdtTempranaDashboard(currentUser.uid).catch(error => {
        console.error('Error durante migración:', error);
      });
    }
  }, [currentUser]);

  const loadDashboards = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      let dashboardsData;
      
      
      if (isAdmin() && viewMode === 'all') {
        dashboardsData = await getAllDashboards();
      } else {
        dashboardsData = await getDashboardsByUser(currentUser.uid);
      }
      
      
      setDashboards(dashboardsData);
    } catch (error) {
      console.error('❌ Error loading dashboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDashboard = async () => {
    try {
      if (!newDashboard.name || !newDashboard.powerBiUrl) {
        alert('Nombre y URL de Power BI son requeridos');
        return;
      }

      if (!currentUser) return;


      const dashboardId = await createDashboard({
        name: newDashboard.name,
        description: newDashboard.description,
        powerBiUrl: newDashboard.powerBiUrl,
        icon: newDashboard.icon,
        isActive: true,
        createdBy: currentUser.uid,
        permissions: [currentUser.uid, ...newDashboard.permissions],
      });


      setShowCreateModal(false);
      setNewDashboard({ name: '', description: '', powerBiUrl: '', icon: 'BarChart3', permissions: [] });
      
      await loadDashboards();
    } catch (error: any) {
      console.error('❌ Error creating dashboard:', error);
      alert('Error al crear dashboard: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleUpdateDashboard = async () => {
    try {
      if (!editingDashboard) return;
      
      await updateDashboard(editingDashboard.id, {
        name: editingDashboard.name,
        description: editingDashboard.description,
        powerBiUrl: editingDashboard.powerBiUrl,
        icon: editingDashboard.icon,
        permissions: editingDashboard.permissions
      });
      
      setEditingDashboard(null);
      loadDashboards();
    } catch (error) {
      console.error('Error updating dashboard:', error);
      alert('Error al actualizar dashboard');
    }
  };

  const handleDeleteDashboard = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este dashboard?')) return;
    
    try {
      await deleteDashboard(id);
      loadDashboards();
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      alert('Error al eliminar dashboard');
    }
  };

  const openDashboard = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      window.open(`https://${url}`, '_blank');
    }
  };

  const getIcon = (iconId: string) => {
    const iconData = DASHBOARD_ICONS.find(i => i.id === iconId);
    return iconData?.icon || BarChart3;
  };

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dashboard.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wider text-neutral-500">DASHBOARDS</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-neutral-900">
            Power BI Dashboards
          </h1>
          <p className="mt-3 text-xl text-neutral-600">
            Gestiona y visualiza tus dashboards de Power BI.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin() && (
            <div className="flex rounded-lg border border-neutral-200 bg-white p-1">
              <button
                onClick={() => setViewMode('my')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  viewMode === 'my' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Mis Dashboards
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  viewMode === 'all' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Todos
              </button>
            </div>
          )}
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={16} />
            Nuevo Dashboard
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl bg-white border border-neutral-200 px-4 py-2 shadow-sm">
        <Search className="h-5 w-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar dashboards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
        />
      </div>

      {/* Dashboards Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-neutral-500">Cargando dashboards...</div>
        </div>
      ) : filteredDashboards.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-16 w-16 text-neutral-300 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">No hay dashboards</h3>
          <p className="text-neutral-500 mb-6">
            {searchTerm ? 'No se encontraron dashboards que coincidan con tu búsqueda' : 'Crea tu primer dashboard para comenzar'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus size={16} />
              Crear Dashboard
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDashboards.map((dashboard) => {
            const IconComponent = getIcon(dashboard.icon);
            return (
              <div
                key={dashboard.id}
                className="group relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                      <IconComponent className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 truncate">
                        {dashboard.name}
                      </h3>
                      <p className="text-sm text-neutral-500 truncate">
                        {dashboard.permissions.length} usuarios con acceso
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openDashboard(dashboard.powerBiUrl)}
                      className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      title="Abrir dashboard"
                    >
                      <ExternalLink size={16} />
                    </button>
                    {(isAdmin() || dashboard.createdBy === currentUser?.uid) && (
                      <>
                        <button
                          onClick={() => setEditingDashboard(dashboard)}
                          className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Editar dashboard"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteDashboard(dashboard.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar dashboard"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {dashboard.description && (
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                    {dashboard.description}
                  </p>
                )}

                {/* URL Preview */}
                <div className="mb-4 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                  <p className="text-xs text-neutral-500 mb-1">Power BI URL</p>
                  <p className="text-sm text-neutral-700 truncate font-mono">
                    {dashboard.powerBiUrl}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Creado {dashboard.createdAt ? new Date(dashboard.createdAt).toLocaleDateString() : 'N/A'}</span>
                  <button
                    onClick={() => openDashboard(dashboard.powerBiUrl)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Abrir
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dashboard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900">Nuevo Dashboard</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newDashboard.name}
                  onChange={(e) => setNewDashboard(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Mi Dashboard de Ventas"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
                <textarea
                  value={newDashboard.description}
                  onChange={(e) => setNewDashboard(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Descripción del dashboard..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">URL de Power BI</label>
                <input
                  type="url"
                  value={newDashboard.powerBiUrl}
                  onChange={(e) => setNewDashboard(prev => ({ ...prev, powerBiUrl: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="https://app.powerbi.com/view?r=..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Icono</label>
                <div className="grid grid-cols-5 gap-2">
                  {DASHBOARD_ICONS.map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <button
                        key={iconOption.id}
                        type="button"
                        onClick={() => setNewDashboard(prev => ({ ...prev, icon: iconOption.id }))}
                        className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
                          newDashboard.icon === iconOption.id
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                            : 'border-neutral-300 hover:bg-neutral-50'
                        }`}
                        title={iconOption.name}
                      >
                        <IconComponent size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateDashboard}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Crear Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dashboard Modal */}
      {editingDashboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900">Editar Dashboard</h2>
              <button
                onClick={() => setEditingDashboard(null)}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingDashboard.name}
                  onChange={(e) => setEditingDashboard(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
                <textarea
                  value={editingDashboard.description || ''}
                  onChange={(e) => setEditingDashboard(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">URL de Power BI</label>
                <input
                  type="url"
                  value={editingDashboard.powerBiUrl}
                  onChange={(e) => setEditingDashboard(prev => prev ? ({ ...prev, powerBiUrl: e.target.value }) : null)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Icono</label>
                <div className="grid grid-cols-5 gap-2">
                  {DASHBOARD_ICONS.map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <button
                        key={iconOption.id}
                        type="button"
                        onClick={() => setEditingDashboard(prev => prev ? ({ ...prev, icon: iconOption.id }) : null)}
                        className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
                          editingDashboard.icon === iconOption.id
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                            : 'border-neutral-300 hover:bg-neutral-50'
                        }`}
                        title={iconOption.name}
                      >
                        <IconComponent size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingDashboard(null)}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateDashboard}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Save size={16} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}