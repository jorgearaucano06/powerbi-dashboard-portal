'use client';

import { useState } from 'react';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, LogOut } from 'lucide-react';

export default function ForcePasswordChange() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, refreshUser, signOut } = useAuth();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!auth.currentUser || !user) {
      setError('No hay usuario autenticado');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Actualizar contraseña en Firebase Auth
      await updatePassword(auth.currentUser, newPassword);

      // Actualizar flag isFirstLogin en Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isFirstLogin: false,
        updatedAt: new Date()
      });

      // Refresh user data to trigger redirect
      await refreshUser();

    } catch (error: any) {
      console.error('Error updating password:', error);
      
      let errorMessage = 'Error desconocido';
      if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Se requiere un login reciente. Por favor, cierra sesión e inicia sesión de nuevo.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b2a] via-[#102a5c] to-[#7b2ff7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div></div> {/* Spacer */}
              <div className="h-16 w-16 rounded-xl bg-orange-600 flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <button
                onClick={handleLogout}
                className="text-white/60 hover:text-white/80 p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Cambio de Contraseña Obligatorio
            </h1>
            <p className="text-white/80 text-sm">
              Debes cambiar tu contraseña antes de continuar
            </p>
            <div className="mt-4 text-xs text-white/60 bg-white/5 rounded px-3 py-2">
              <strong>Debug:</strong> Usuario: {user?.username || 'N/A'} | Email: {user?.email || 'N/A'} | isFirstLogin: {user?.isFirstLogin ? 'true' : 'false'}
            </div>
          </div>

          {/* Información del usuario */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {user?.displayName || user?.username || 'Usuario'}
                </p>
                <p className="text-white/60 text-xs">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Validaciones */}
            <div className="space-y-2">
              <div className={`flex items-center gap-2 text-xs ${newPassword.length >= 6 ? 'text-green-400' : 'text-white/60'}`}>
                <CheckCircle className={`h-3 w-3 ${newPassword.length >= 6 ? 'text-green-400' : 'text-white/40'}`} />
                <span>Mínimo 6 caracteres</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-green-400' : 'text-white/60'}`}>
                <CheckCircle className={`h-3 w-3 ${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-green-400' : 'text-white/40'}`} />
                <span>Las contraseñas coinciden</span>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
              className="w-full bg-orange-600 text-white rounded-xl py-3 px-6 font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Cambiando contraseña...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Cambiar Contraseña
                </>
              )}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 text-xs">
                  <strong>Requisitos de seguridad:</strong>
                </p>
                <ul className="text-blue-300/80 text-xs mt-1 space-y-1">
                  <li>• Debe tener al menos 6 caracteres</li>
                  <li>• Se recomienda usar una combinación de letras, números y símbolos</li>
                  <li>• Esta contraseña será permanente hasta que la cambies manualmente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}