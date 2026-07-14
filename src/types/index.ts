export interface User {
  uid: string;
  email: string;
  displayName?: string;
  username?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isFirstLogin?: boolean;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  powerBiUrl: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  permissions: string[]; // Array of user UIDs who can access this dashboard
}

export interface Permission {
  userId: string;
  dashboardId: string;
  canView: boolean;
  canEdit: boolean;
  grantedAt: Date;
  grantedBy: string;
}

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  refreshUser: () => Promise<void>;
};