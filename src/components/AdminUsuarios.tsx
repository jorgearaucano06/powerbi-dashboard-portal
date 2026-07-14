'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithEmailOrUsername } from '@/lib/auth';
import { Plus, User, Mail, Lock, Check, AlertCircle } from 'lucide-react';

interface NewUser {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export default function AdminUsuarios() {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [previewUser, setPreviewUser] = useState<NewUser | null>(null);
  const { user: currentUser } = useAuth(); // Usuario admin actual

  // Función para generar username desde nombre completo
  const generateUsername = (fullName: string): string => {
    if (!fullName.trim()) return '';
    
    const names = fullName.trim().toLowerCase().split(' ');
    
    // Tomar primera letra del primer nombre + apellidos completos
    let username = '';
    
    if (names.length >= 2) {
      // Primera letra del primer nombre
      username += names[0][0];
      
      // Apellidos completos (sin espacios)
      for (let i = 1; i < names.length; i++) {
        username += names[i];
      }
    } else if (names.length === 1) {
      // Si solo hay un nombre, usar todo
      username = names[0];
    }
    
    return username.replace(/[^a-z]/g, ''); // Remover caracteres especiales
  };

  // Función para generar email
  const generateEmail = (username: string): string => {
    return `${username}@jotaapex.com`;
  };

  // Actualizar preview cuando cambia el nombre
  const handleNameChange = (name: string) => {
    setFullName(name);
    
    if (name.trim()) {
      const username = generateUsername(name);
      const email = generateEmail(username);
      
      setPreviewUser({
        fullName: name.trim(),
        username,
        email,
        password: '123456'
      });
    } else {
      setPreviewUser(null);
    }
  };

  // Función para crear usuario
  const handleCreateUser = async () => {
    if (!previewUser) {
      setResult('❌ Por favor ingresa un nombre completo');
      return;
    }

    if (!currentUser) {
      setResult('❌ No hay sesión de administrador activa');
      return;
    }

    setLoading(true);
    setResult('');

    // Guardar datos del admin actual para restaurar sesión
    const adminEmail = currentUser.email;
    const adminUsername = currentUser.username;

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        previewUser.email,
        previewUser.password
      );

      // 2. Crear documento en Firestore
      const userData = {
        uid: userCredential.user.uid,
        email: previewUser.email,
        fullName: previewUser.fullName,
        displayName: previewUser.fullName,
        username: previewUser.username,
        role: 'user',
        isFirstLogin: true, // Marcar para forzar cambio de contraseña
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // CRÍTICO: Restaurar la sesión del admin inmediatamente
      // porque createUserWithEmailAndPassword automáticamente logea al nuevo usuario
      try {
        await signInWithEmailOrUsername(adminUsername || adminEmail, 'admin123');
      } catch (restoreError) {
        console.error('Failed to restore admin session:', restoreError);
        // Si no podemos restaurar con la contraseña conocida, intentar con otras
        try {
          await signInWithEmailOrUsername('admin', '123456');
        } catch (backupError) {
          console.error('Backup restore failed:', backupError);
        }
      }

      setResult(`✅ Usuario creado exitosamente!

📋 Detalles del usuario:
👤 Nombre: ${previewUser.fullName}
🔑 Usuario: ${previewUser.username}
📧 Email: ${previewUser.email}
🔒 Contraseña temporal: ${previewUser.password}

⚠️ Importante: En el primer login, el usuario deberá cambiar su contraseña.

🎉 El usuario ya puede iniciar sesión con estas credenciales.`);

      // Limpiar formulario
      setFullName('');
      setPreviewUser(null);

    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      
      let errorMessage = 'Error desconocido';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Ya existe un usuario con ese email';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setResult(`❌ Error: ${errorMessage}\n\nDetalles: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Admin Usuarios</h1>
        <p className="mt-2 text-neutral-600">
          Crear usuarios automáticamente a partir del nombre completo
        </p>
      </div>

      {/* Formulario de creación */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Plus className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">Crear Nuevo Usuario</h2>
        </div>

        {/* Input del nombre */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Angel Jesus Araucano Bonifaz"
              className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-neutral-500 mt-1">
              El sistema generará automáticamente el usuario, email y contraseña
            </p>
          </div>

          {/* Preview del usuario */}
          {previewUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-3">Vista Previa del Usuario:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700">
                    <strong>Usuario:</strong> {previewUser.username}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700">
                    <strong>Email:</strong> {previewUser.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700">
                    <strong>Contraseña:</strong> {previewUser.password}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-700">
                    <strong>Cambio obligatorio en 1er login</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botón de crear */}
          <button
            onClick={handleCreateUser}
            disabled={loading || !previewUser}
            className="w-full bg-indigo-600 text-white rounded-xl py-3 px-6 font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creando usuario...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Crear Usuario
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resultado */}
      {result && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Resultado</h3>
          <pre className="whitespace-pre-wrap text-sm bg-neutral-100 rounded-lg p-4 overflow-x-auto">
            {result}
          </pre>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-900 mb-2">Información Importante:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• La contraseña temporal siempre será: <strong>123456</strong></li>
              <li>• En el primer login, el usuario <strong>debe cambiar</strong> su contraseña</li>
              <li>• El formato de usuario es: primera letra del nombre + apellidos completos</li>
              <li>• El email siempre será: usuario@jotaapex.com</li>
              <li>• Todos los usuarios creados tendrán rol "user" por defecto</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}