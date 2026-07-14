'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Plus, 
  Edit3, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  Search,
  Eye,
  EyeOff,
  X,
  Save,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers, createUser, updateUser, deleteUser, getAllDashboards, grantDashboardPermission, revokeDashboardPermission } from '@/lib/firestore';
import { User as UserType, Dashboard } from '@/types';

export default function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [userDashboardPermissions, setUserDashboardPermissions] = useState<{[key: string]: boolean}>({});
  const { user: currentUser, isAdmin } = useAuth();

  // Nuevo usuario state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'user' as 'admin' | 'user'
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.email || !newUser.password) {
        alert('Email y contraseña son requeridos');
        return;
      }

      await createUser(newUser);
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', displayName: '', role: 'user' });
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('El email ya está en uso');
      } else {
        alert('Error al crear usuario: ' + error.message);
      }
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!editingUser) return;
      
      await updateUser(editingUser.uid, {
        displayName: editingUser.displayName,
        role: editingUser.role,
        isActive: editingUser.isActive
      });
      
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('¿Estás seguro de que quieres desactivar este usuario?')) return;
    
    try {
      await deleteUser(uid);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al desactivar usuario');
    }
  };

  const handleManagePermissions = async (user: UserType) => {
    try {
      setSelectedUser(user);
      
      // Cargar todos los dashboards
      const allDashboards = await getAllDashboards();
      setDashboards(allDashboards);
      
      // Crear mapa de permisos del usuario
      const permissionsMap: {[key: string]: boolean} = {};
      allDashboards.forEach(dashboard => {
        permissionsMap[dashboard.id] = dashboard.permissions.includes(user.uid);
      });
      setUserDashboardPermissions(permissionsMap);
      
      setShowPermissionsModal(true);
    } catch (error) {
      console.error('Error loading permissions:', error);
      alert('Error al cargar permisos');
    }
  };

  const handlePermissionToggle = (dashboardId: string, hasPermission: boolean) => {
    setUserDashboardPermissions(prev => ({
      ...prev,
      [dashboardId]: hasPermission
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    
    try {
      // Actualizar permisos para cada dashboard
      for (const dashboard of dashboards) {
        const hasPermission = userDashboardPermissions[dashboard.id];
        const currentlyHasPermission = dashboard.permissions.includes(selectedUser.uid);
        
        if (hasPermission && !currentlyHasPermission) {
          // Otorgar permiso
          await grantDashboardPermission(selectedUser.uid, dashboard.id, currentUser?.uid || '');
        } else if (!hasPermission && currentlyHasPermission) {
          // Revocar permiso
          await revokeDashboardPermission(selectedUser.uid, dashboard.id);
        }
      }
      
      setShowPermissionsModal(false);
      setSelectedUser(null);
      alert('Permisos actualizados correctamente');
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('Error al guardar permisos');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin()) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-800">Acceso Denegado</h2>
          <p className="text-red-600">Solo los administradores pueden gestionar usuarios.</p>
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
            Gestión de Usuarios
          </h1>
          <p className="mt-3 text-xl text-neutral-600">
            Administra usuarios, roles y permisos del sistema. Para crear usuarios usa "Admin Usuarios".
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl bg-white border border-neutral-200 px-4 py-2 shadow-sm">
        <Search className="h-5 w-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-neutral-900">
                          {user.displayName || user.username}
                        </div>
                        <div className="text-sm text-neutral-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? (
                          <ShieldCheck className="h-4 w-4 text-indigo-600" />
                        ) : (
                          <User className="h-4 w-4 text-neutral-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          user.role === 'admin' ? 'text-indigo-600' : 'text-neutral-600'
                        }`}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleManagePermissions(user)}
                          className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Gestionar permisos de dashboards"
                        >
                          <Settings size={16} />
                        </button>
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Editar usuario"
                        >
                          <Edit3 size={16} />
                        </button>
                        {user.uid !== currentUser?.uid && (
                          <button
                            onClick={() => handleDeleteUser(user.uid)}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Desactivar usuario"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900">Nuevo Usuario</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nombre completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
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
                onClick={handleCreateUser}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900">Editar Usuario</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingUser.displayName || ''}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, displayName: e.target.value }) : null)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nombre completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Rol</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, role: e.target.value as 'admin' | 'user' }) : null)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={editingUser.uid === currentUser?.uid}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingUser.isActive}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null)}
                  className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={editingUser.uid === currentUser?.uid}
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-neutral-700">
                  Usuario activo
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateUser}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Save size={16} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Management Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900">
                Gestionar Permisos de Dashboards - {selectedUser.displayName || selectedUser.email}
              </h2>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-neutral-600">
                Selecciona los dashboards a los que este usuario tendrá acceso:
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboards.map((dashboard) => (
                <div key={dashboard.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-900">{dashboard.name}</h3>
                    {dashboard.description && (
                      <p className="text-sm text-neutral-500 mt-1">{dashboard.description}</p>
                    )}
                    <p className="text-xs text-neutral-400 mt-1">
                      ID: {dashboard.id}
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userDashboardPermissions[dashboard.id] || false}
                        onChange={(e) => handlePermissionToggle(dashboard.id, e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-neutral-700">
                        {userDashboardPermissions[dashboard.id] ? 'Tiene acceso' : 'Sin acceso'}
                      </span>
                    </label>
                  </div>
                </div>
              ))}
              
              {dashboards.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  No hay dashboards disponibles
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-200">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePermissions}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Save size={16} />
                Guardar Permisos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}