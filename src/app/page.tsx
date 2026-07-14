'use client';

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginJotaApex from "@/components/LoginJotaApex";
import ResponsiveSidebarDemo from "@/components/ResponsiveSidebarDemo";
import ForcePasswordChange from "@/components/ForcePasswordChange";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d1b2a] via-[#102a5c] to-[#7b2ff7]">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // Si el usuario está autenticado pero es su primer login, mostrar cambio de contraseña
  if (user && user.isFirstLogin) {
    return <ForcePasswordChange />;
  }

  return user ? (
    <ResponsiveSidebarDemo />
  ) : (
    <LoginJotaApex />
  );
}
