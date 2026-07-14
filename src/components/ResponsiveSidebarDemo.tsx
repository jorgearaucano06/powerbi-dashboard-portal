'use client';

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, User2, ChartPie, Settings, Search, LogOut, Menu, Users, Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserManagement from "./UserManagement";
import PowerBIManagement from "./PowerBIManagement";
import PermissionManagement from "./PermissionManagement";
import PowerBIDashboard from "./PowerBIDashboard";
import AdminUsuarios from "./AdminUsuarios";
import DashboardViewer from "./DashboardViewer";
import { getDashboardsByUser, getAllDashboards } from "@/lib/firestore";
import { Dashboard } from "@/types";

// Mini avatar with initials - EXACTAMENTE IGUAL
function Initials({ text }: { text: string }) {
  const initials = text
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white font-semibold">
      {initials}
    </div>
  );
}

function clsx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(" ");
}

// Navigation items con funcionalidad de admin
interface NavItem {
  label: string;
  icon: any;
  badge?: number;
  adminOnly?: boolean;
  id: string;
  isDashboard?: boolean;
}

const ADMIN_ITEMS: NavItem[] = [
  { id: 'admin-users', label: "Admin Usuarios", icon: User2, adminOnly: true },
  { id: 'users', label: "Usuarios", icon: Users, adminOnly: true },
  { id: 'powerbi', label: "Power BI", icon: ChartPie, adminOnly: true },
  { id: 'permissions', label: "Permisos", icon: Shield, adminOnly: true },
  { id: 'settings', label: "Settings", icon: Settings, adminOnly: true },
];

function Sidebar({ 
  open, 
  setOpen, 
  active, 
  setActive,
  onNavClick 
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  active: number;
  setActive: (active: number) => void;
  onNavClick: (itemId: string) => void;
}) {
  const { user, signOut, isAdmin } = useAuth();
  const [userDashboards, setUserDashboards] = useState<Dashboard[]>([]);
  const [dashboardsLoading, setDashboardsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadUserDashboards();
    }
  }, [user]);

  const loadUserDashboards = async () => {
    if (!user) {
      setDashboardsLoading(false);
      return;
    }
    
    try {
      setDashboardsLoading(true);
      
      let dashboards;
      if (isAdmin()) {
        dashboards = await getAllDashboards();
      } else {
        dashboards = await getDashboardsByUser(user.uid);
      }
      
      setUserDashboards(dashboards);
    } catch (error) {
      console.error('❌ SIDEBAR Error:', error);
      setUserDashboards([]);
    } finally {
      setDashboardsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Crear lista de navegación dinámica con filtro de búsqueda
  const getNavigationItems = (): NavItem[] => {
    const items: NavItem[] = [];
    
    // Agregar dashboards del usuario
    userDashboards.forEach(dashboard => {
      items.push({
        id: `dashboard-${dashboard.id}`,
        label: dashboard.name,
        icon: LayoutDashboard,
        isDashboard: true
      });
    });
    
    // Agregar elementos de admin si es admin
    if (isAdmin()) {
      ADMIN_ITEMS.forEach(item => {
        items.push(item);
      });
    }
    
    // Filtrar por búsqueda si hay query
    if (searchQuery.trim()) {
      return items.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return items;
  };

  return (
    <aside
      className={clsx(
        "relative z-30 h-full border-r border-white/10 bg-neutral-900/95 backdrop-blur",
        "transition-[width] duration-300 ease-in-out",
        open ? "w-64" : "w-20"
      )}
    >
      {/* Top bar */}
      <div className={clsx("flex items-center py-4", open ? "gap-3 px-4" : "justify-center px-2")}>
        <button
          aria-label="Toggle sidebar"
          onClick={() => setOpen(!open)}
          className="rounded-xl p-2 text-neutral-300 hover:bg-white/10"
        >
          <Menu size={20} />
        </button>
        {open && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-500"></div>
            <span className="text-sm font-semibold text-white">JotaApex</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className={clsx("pb-2", open ? "px-4" : "px-2")}>
        {open ? (
          <div className="group flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10 focus-within:ring-indigo-400/40">
            <Search className="shrink-0 text-neutral-400" size={18} />
            <input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-neutral-200 placeholder:text-neutral-500 outline-none"
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <button 
              onClick={() => setOpen(true)}
              className="rounded-xl p-2 text-neutral-300 hover:bg-white/10"
              title="Abrir búsqueda"
            >
              <Search size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Nav - Dinámico con dashboards del usuario */}
      <nav className="mt-2 flex flex-col gap-2 px-2">
        {dashboardsLoading ? (
          <div className={clsx(
            "py-2 text-neutral-400 text-sm",
            open ? "px-3" : "text-center px-2"
          )}>
            {open ? "Cargando..." : "..."}
          </div>
        ) : (
          getNavigationItems().map((item, idx) => {
            const Icon = item.icon as any;
            const isActive = active === idx;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActive(idx);
                  onNavClick(item.id);
                }}
                className={clsx(
                  "group relative flex items-center rounded-xl px-3 py-2 text-sm",
                  open ? "gap-3 justify-start" : "gap-0 justify-center",        // 🔹 cambia layout
                  isActive
                    ? (open ? "bg-white text-neutral-900 shadow-sm" : "text-white") // 🔹 sin pill en colapsado
                    : "text-neutral-300 hover:bg-white/10 hover:text-white"
                )}
                title={!open ? item.label : undefined}
              >
                <Icon size={18} className={clsx(
                  "shrink-0",                                                    // 🔹 evita que se achique
                  isActive ? (open ? "text-neutral-900" : "text-white")
                           : "text-neutral-300 group-hover:text-white"
                )} />
                <span className={clsx(
                  "transition-all duration-200",
                  open ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 overflow-hidden" // 🔹 colapsa ancho real
                )}>
                  {item.label}
                </span>
                {open && item.badge && (                                   // 🔹 sólo cuando está abierto
                  <span className={clsx(
                    "rounded-md px-2 py-0.5 text-xs",
                    isActive ? "bg-neutral-900/10 text-neutral-900" : "bg-white/10 text-white"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })
        )}
      </nav>

      {/* Bottom profile - Con datos reales del usuario */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
        <div
          className={clsx(
            "flex items-center gap-3 rounded-xl bg-white/5 p-3",
            open ? "justify-between" : "justify-center"
          )}
        >
          {open ? (
            <div className="flex items-center gap-3">
              <Initials text={user?.displayName || user?.email || "JA"} />
              <div className="leading-tight">
                <p className="text-[13px] font-semibold text-white">
                  {user?.displayName || user?.username || 'Usuario'}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                </p>
              </div>
            </div>
          ) : (
            <Initials text={user?.displayName || user?.email || "JA"} />
          )}
          <button 
            onClick={handleLogout}
            className="rounded-lg p-2 text-neutral-300 hover:bg-white/10" 
            title="Salir"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function ResponsiveSidebarDemo() {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState(0);
  const [currentView, setCurrentView] = useState('');

  const handleNavClick = (itemId: string) => {
    setCurrentView(itemId);
  };

  const renderContent = () => {
    
    // Si es un dashboard específico
    if (currentView.startsWith('dashboard-')) {
      const dashboardId = currentView.replace('dashboard-', '');
      return <DashboardViewer dashboardId={dashboardId} />;
    }
    
    // Módulos de administración
    switch (currentView) {
      case 'admin-users':
        return <AdminUsuarios />;
      
      case 'users':
        return <UserManagement />;
      
      case 'powerbi':
        return <PowerBIManagement />;
      
      case 'permissions':
        return <PermissionManagement />;
      
      default:
        // Si no hay vista específica, mostrar el dashboard genérico
        return <PowerBIDashboard />;
    }
  };

  return (
    <div className="flex h-[100vh] w-full items-stretch overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-xl">
      {/* Sidebar */}
      <Sidebar 
        open={open} 
        setOpen={setOpen} 
        active={active} 
        setActive={setActive}
        onNavClick={handleNavClick}
      />

      {/* Content - EXACTAMENTE IGUAL el diseño */}
      <main className="relative flex-1 overflow-auto bg-gradient-to-br from-neutral-50 via-white to-neutral-100 p-8">
        {renderContent()}
      </main>
    </div>
  );
}