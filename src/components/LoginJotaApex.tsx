'use client';

import React, { useState } from "react";
import { Eye, EyeOff, User, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

type Props = { onLogin?: () => void };

export default function LoginJotaApex({ onLogin }: Props) {
  const [showPwd, setShowPwd] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailOrUsername || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(emailOrUsername, password);
      onLogin?.();
    } catch (error: any) {
      console.error('Login error:', error?.code || error?.message);
      
      if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        setError('Credenciales inválidas');
      } else if (error?.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Intenta más tarde');
      } else if (error?.message) {
        setError(error.message);
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0d1b2a] via-[#102a5c] to-[#7b2ff7] p-4 md:p-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 overflow-hidden rounded-3xl bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl md:grid-cols-2">
        {/* Panel Izquierdo: Formulario */}
        <div className="order-2 flex flex-col justify-center bg-white p-6 md:order-1 md:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600" />
              <span className="text-base font-semibold text-neutral-800">JotaApex</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
              Iniciar Sesión
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Ingresa tus credenciales para continuar.
            </p>

            {error && (
              <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Username/Email */}
              <label className="mt-8 block text-xs font-semibold text-neutral-600">Usuario</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 focus-within:border-neutral-900">
                <User className="h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="admin"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="w-full bg-transparent text-[15px] text-neutral-800 placeholder:text-neutral-400 outline-none"
                  required
                />
              </div>

              {/* Password */}
              <label className="mt-4 block text-xs font-semibold text-neutral-600">Contraseña</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 focus-within:border-neutral-900">
                <Lock className="h-4 w-4 text-neutral-500" />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-[15px] text-neutral-800 placeholder:text-neutral-400 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-200/60"
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Acciones */}
              <div className="mt-3 flex items-center justify-start text-sm">
                <label className="flex cursor-pointer items-center gap-2 select-none">
                  <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                  <span className="text-neutral-600">Recordarme</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="h-4 w-4" />
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

          </div>
        </div>

        {/* Panel Derecho: Ilustración / Marca - EXACTAMENTE IGUAL */}
        <div className="relative order-1 hidden min-h-[95vh] items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 p-8 md:order-2 md:flex">
          {/* Glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute right-10 bottom-10 h-56 w-56 rounded-full bg-indigo-300/30 blur-2xl" />
          </div>

          {/* Tarjeta de marca */}
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white/10 p-6 text-white ring-1 ring-white/20 backdrop-blur-xl">
            <div className="mx-auto mb-8 flex h-48 w-48 items-center justify-center rounded-3xl bg-white/90 p-4">
              <Image
                src="/logo.png"
                alt="JotaApex Logo"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">JotaApex</h2>
            <p className="mt-2 text-sm text-white/80">Power BI Dashboard Portal</p>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              Accede de forma rápida y segura a los dashboards de BI. Todo en un solo lugar.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white/60"></div>
                <span className="text-sm text-white/70">Acceso seguro y rápido</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white/60"></div>
                <span className="text-sm text-white/70">Dashboards organizados</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white/60"></div>
                <span className="text-sm text-white/70">Interfaz moderna</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}