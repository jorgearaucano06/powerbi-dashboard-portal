# 📊 Jota Apex Admin - Power BI Dashboard Portal

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.2.1-FFCA28?style=flat&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

> **Portal empresarial centralizado para gestión de dashboards Power BI con control de acceso basado en roles (RBAC)**

[📖 Documentación](#-documentación-adicional) | [🚀 Instalación](#-instalación-rápida) | [🛠️ Stack Tecnológico](#%EF%B8%8F-stack-tecnológico)

---

## 🎯 Descripción del Proyecto

**Jota Apex Admin** es una aplicación web full-stack que resuelve el problema de **fragmentación en el acceso a reportes analíticos corporativos**, centralizando todos los dashboards de Power BI en un único portal seguro con control granular de permisos.

### Problemática que resuelve:
- ❌ Dashboards dispersos en múltiples URLs difíciles de recordar
- ❌ Falta de control sobre quién accede a información sensible
- ❌ Sin trazabilidad de accesos a reportes confidenciales
- ❌ Riesgo de fuga de información por URLs públicas

### Solución implementada:
- ✅ Portal único con autenticación Firebase
- ✅ Control de acceso basado en roles (Admin/Usuario)
- ✅ Permisos granulares por combinación usuario-dashboard
- ✅ Interfaz moderna con diseño glassmorphism responsive
- ✅ Gestión completa de usuarios y dashboards desde un panel admin

---

## 🌟 Características Principales

### 🔐 Autenticación y Seguridad
- Firebase Authentication con email/password
- Login alternativo con username o email
- Sesiones seguras con tokens JWT
- Reglas de seguridad Firestore a nivel servidor
- Protección de rutas según rol de usuario

### 👥 Gestión de Usuarios (Solo Admins)
- Crear usuarios con email, contraseña, nombre y rol
- Editar información y cambiar roles
- Activar/desactivar usuarios (soft delete)
- Vista tabular con búsqueda en tiempo real

### 📊 Gestión de Dashboards Power BI
- Agregar dashboards con URL, nombre, descripción e icono
- Editar y eliminar dashboards existentes
- Vista en tarjetas modernas con iconos personalizables
- Apertura directa de Power BI en nueva ventana

### 🛡️ Control de Permisos Granular
- Matriz de permisos usuario × dashboard
- Asignación/revocación de accesos en tiempo real
- Dashboard de estadísticas (usuarios, dashboards, permisos activos)
- Cambios aplicados instantáneamente vía Firestore

### 🎨 Interfaz de Usuario
- Diseño glassmorphism con efectos modernos
- Sidebar colapsable con animaciones suaves
- Responsive (móvil, tablet, desktop)
- Dark mode en sidebar para reducir fatiga visual

---

## 🛠️ Stack Tecnológico

### Frontend
```
Next.js 15.5.2      → Framework React con App Router y SSR
React 19.1.0        → Biblioteca UI con hooks modernos
TypeScript 5        → Tipado estático para mayor robustez
Tailwind CSS 4      → Framework CSS utility-first
Lucide React        → Iconos SVG optimizados
```

### Backend & Servicios
```
Firebase Auth       → Autenticación segura de Google
Firestore           → Base de datos NoSQL en tiempo real
Firebase Rules      → Seguridad a nivel servidor
```

### Herramientas de Desarrollo
```
ESLint 9            → Linter de código
TypeScript Compiler → Verificación de tipos
Git                 → Control de versiones
```

---

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js 18+ instalado
- Cuenta de Firebase (plan Spark gratuito)
- Git

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/jorgearaucano06/jota-apex-admin.git
cd jota-apex-admin
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar **Authentication** (Email/Password)
3. Crear base de datos **Firestore**
4. Copiar credenciales del proyecto

### Paso 4: Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar .env.local con tus credenciales de Firebase
```

### Paso 5: Configurar reglas de Firestore

1. Ve a Firebase Console → Firestore → Rules
2. Copia el contenido de `firestore.rules`
3. Pégalo y publica las reglas

### Paso 6: Ejecutar en desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### Paso 7: Crear usuario administrador

1. Ve a [http://localhost:3000/admin-setup](http://localhost:3000/admin-setup)
2. Haz clic en "Crear Usuario Administrador"
3. Usa credenciales: `admin@jotaapex.com` / `admin123`

---

## 📁 Estructura del Proyecto

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Página principal (routing)
│   ├── layout.tsx                # Layout con AuthProvider
│   ├── admin-setup/              # Setup de usuario admin
│   └── globals.css               # Estilos globales
│
├── components/                   # Componentes React
│   ├── LoginJotaApex.tsx         # Pantalla de login
│   ├── ResponsiveSidebarDemo.tsx # Dashboard principal
│   ├── UserManagement.tsx        # CRUD usuarios
│   ├── PowerBIManagement.tsx     # CRUD dashboards
│   ├── PermissionManagement.tsx  # Gestión permisos
│   └── ...
│
├── contexts/                     # Estado global
│   └── AuthContext.tsx           # Contexto de autenticación
│
├── lib/                          # Utilidades
│   ├── firebase.ts               # Configuración Firebase
│   ├── auth.ts                   # Funciones de autenticación
│   └── firestore.ts              # Operaciones CRUD
│
└── types/                        # Definiciones TypeScript
    └── index.ts                  # Tipos de datos
```

---

## 🔐 Seguridad

### Medidas Implementadas
- ✅ Autenticación Firebase con encriptación automática de contraseñas
- ✅ Tokens JWT seguros con expiración
- ✅ Reglas de Firestore a nivel servidor
- ✅ Validación de inputs en frontend
- ✅ Sanitización de datos antes de guardar
- ✅ Variables de entorno para credenciales sensibles
- ✅ Protección de rutas según rol

### Reglas de Firestore
```javascript
// Solo admins pueden crear/editar usuarios
// Usuarios solo leen sus propios datos
// Dashboards solo visibles con permisos asignados
// Ver firestore.rules para detalles completos
```

---

## 📊 Modelo de Datos

### Colección: `users`
```typescript
{
  uid: string;              // Firebase Auth UID
  email: string;            // Email del usuario
  displayName: string;      // Nombre completo
  username: string;         // Username alternativo
  role: 'admin' | 'user';   // Rol del usuario
  isActive: boolean;        // Estado activo/inactivo
  createdAt: Timestamp;     // Fecha de creación
  updatedAt: Timestamp;     // Última actualización
}
```

### Colección: `dashboards`
```typescript
{
  id: string;               // ID único
  name: string;             // Nombre del dashboard
  description: string;      // Descripción
  powerBiUrl: string;       // URL de Power BI
  icon: string;             // Nombre del icono
  isActive: boolean;        // Estado activo/inactivo
  createdBy: string;        // UID del creador
  permissions: string[];    // Array de UIDs con acceso
  createdAt: Timestamp;     // Fecha de creación
  updatedAt: Timestamp;     // Última actualización
}
```

---

## 🎓 Competencias Demostradas

### Desarrollo Frontend
- ✅ Next.js 15 con App Router (SSR, RSC)
- ✅ React 19 con hooks y Context API
- ✅ TypeScript para type safety
- ✅ Tailwind CSS para diseño responsive
- ✅ Diseño UX/UI moderno (glassmorphism)

### Backend & Base de Datos
- ✅ Firebase Authentication
- ✅ Firestore NoSQL database
- ✅ Modelado de datos relacionales en NoSQL
- ✅ Reglas de seguridad a nivel servidor

### Arquitectura & Mejores Prácticas
- ✅ Arquitectura de componentes reutilizables
- ✅ Gestión de estado global con Context
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Validación de inputs y sanitización
- ✅ Manejo de errores y estados de carga

---

## ⚠️ Limitaciones Conocidas y Roadmap

### Limitaciones Actuales
> Ver archivo `ARCHITECTURE.md` para detalles completos sobre decisiones técnicas y escalabilidad

1. **Modelado de permisos**: Uso de arrays en vez de subcolecciones (limitación para > 1000 usuarios)
2. **Autenticación**: Firebase en lugar de Azure AD (ideal para integración SSO con Power BI)
3. **RLS de Power BI**: No sincronizado con permisos de la app
4. **Auditoría**: Falta de logs de acceso a dashboards

### Roadmap de Mejoras
- [ ] Migrar a subcolecciones para permisos escalables
- [ ] Implementar Azure AD / Microsoft Entra ID
- [ ] SSO con Power BI Embedded
- [ ] Logs de auditoría y analytics de uso
- [ ] Exportar reportes en PDF
- [ ] Multi-tenancy para múltiples empresas

---

## 📚 Documentación Adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Decisiones técnicas y arquitectura
- [firestore.rules](./firestore.rules) - Reglas de seguridad Firestore
- [LICENSE](./LICENSE) - Licencia MIT del proyecto

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama con tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

## 👨‍💻 Autor

**Jorge Jeferson Araucano Bonifaz**
- LinkedIn: [jorge-jeferson-araucano](https://www.linkedin.com/in/jorge-jeferson-araucano/)
- GitHub: [@jorgearaucano06](https://github.com/jorgearaucano06)
- Email: jorgearaucano06@gmail.com

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) por el excelente framework
- [Firebase](https://firebase.google.com/) por los servicios backend
- [Tailwind CSS](https://tailwindcss.com/) por el framework CSS
- [Lucide](https://lucide.dev/) por los iconos

---

**Desarrollado con ❤️ para demostrar competencias en desarrollo full-stack y arquitectura de aplicaciones empresariales**
