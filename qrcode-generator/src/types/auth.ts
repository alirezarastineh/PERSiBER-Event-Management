import { ChangeEvent, FormEvent, ReactNode } from "react";

export interface User {
  _id: string;
  username: string;
  role: "user" | "admin" | "master";
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UpdateUserRoleDto {
  id: string;
  role: string;
}

export interface UserCardsProps {
  readonly users: User[];
  readonly canEditUser: (userRole: string) => boolean;
  readonly canDeleteUser: (userRole: string) => boolean;
  readonly getRoleBadgeClass: (role: string) => string;
  readonly onEditUser: (userId: string, currentRole: string) => void;
  readonly onDeleteUser: (userId: string) => void;
  readonly containerVariants?: any;
  readonly itemVariants?: any;
}

export interface EditUserRoleModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly selectedRole: string;
  readonly setSelectedRole: (role: string) => void;
  readonly onSave: () => void;
  readonly isLoading?: boolean;
}

export interface UserTableProps {
  readonly users: User[];
  readonly canEditUser: (userRole: string) => boolean;
  readonly canDeleteUser: (userRole: string) => boolean;
  readonly getRoleBadgeClass: (role: string) => string;
  readonly onEditUser: (userId: string, currentRole: string) => void;
  readonly onDeleteUser: (userId: string) => void;
  readonly containerVariants?: any;
  itemVariants?: any;
}

export interface AuthLayoutProps {
  readonly children: ReactNode;
}

export interface Feature {
  readonly id: string;
  readonly text: string;
  readonly title: string;
  readonly desc: string;
  readonly icon: string;
}

export interface AuthDecorativePanelProps {
  readonly title: string;
  readonly description: string;
  readonly features: Feature[];
  readonly backgroundImageUrl: string;
}

export interface FormConfig {
  readonly label: string;
  readonly labelId: string;
  readonly type: string;
  readonly value: string;
  readonly onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly required: boolean;
}

export interface AuthFormPanelProps {
  readonly title: string;
  readonly subtitle: string;
  readonly formConfig: FormConfig[];
  readonly isLoading: boolean;
  readonly btnText: string;
  readonly onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}
