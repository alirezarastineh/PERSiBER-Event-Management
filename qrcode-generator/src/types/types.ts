import { ChangeEvent, FormEvent } from "react";

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

export interface Member {
  _id: string;
  name: string;
  attended: string;
  attendedAt: Date | null;
  organizer: string;
  invitedFrom: string;
  membersInvited: number;
  hasLeft: boolean;
  isStudent: boolean;
  untilWhen: Date | null;
}

export interface CreateMemberDto {
  name: string;
  attended?: string;
  attendedAt?: Date | null;
  organizer?: string;
  invitedFrom?: string;
  hasLeft?: boolean;
  isStudent?: boolean;
  untilWhen?: Date | null;
}

export interface UpdateMemberDto {
  name?: string;
  attended?: string;
  attendedAt?: Date | null;
  organizer?: string;
  invitedFrom?: string;
  hasLeft?: boolean;
  isStudent?: boolean;
  untilWhen?: Date | null;
}

export interface MemberStatistics {
  attendedCount: number;
  totalCount: number;
  studentsCount: number;
  hasLeftCount: number;
}

export interface Guest {
  _id: string;
  name: string;
  alreadyPaid: boolean;
  freeEntry: boolean;
  drinksCoupon: number;
  attended: string;
  attendedAt: Date | null;
  invitedFrom: string;
  isStudent: boolean;
  untilWhen: Date | null;
  isLady: boolean;
  addedBy?: string;
}

export interface CreateGuestDto {
  name: string;
  alreadyPaid?: boolean;
  freeEntry?: boolean;
  attended?: string;
  attendedAt?: Date | null;
  invitedFrom?: string;
  isStudent?: boolean;
  untilWhen?: Date | null;
}

export interface UpdateGuestDto {
  name?: string;
  alreadyPaid?: boolean;
  freeEntry?: boolean;
  attended?: string;
  attendedAt?: Date | null;
  invitedFrom?: string;
  isStudent?: boolean;
  untilWhen?: Date | null;
  isLady?: boolean;
}

export interface GuestStatistics {
  attendedCount: number;
  totalCount: number;
  studentsCount: number;
  ladiesCount: number;
  drinksCouponsCount: number;
  freeEntryCount: number;
  studentDiscountActive?: boolean;
  ladyDiscountActive?: boolean;
}

export interface QRCodeProps {
  text: string;
  qrCodeUrl: string;
  setQrCodeUrl: (url: string) => void;
}

export interface InputProps {
  label: string;
  labelId: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  link?: {
    linkText: string;
    linkUrl: string;
  };
}

export interface InputProps {
  label: string;
  labelId: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  link?: {
    linkText: string;
    linkUrl: string;
  };
}

export interface FormProps {
  config: InputProps[];
  isLoading: boolean;
  btnText: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface Bpplist {
  _id: string;
  name: string;
  attended: string;
  attendedAt: Date | null;
  organizer: string;
  invitedFrom: string;
  membersInvited: number;
  hasLeft: boolean;
  isStudent: boolean;
  untilWhen: Date | null;
}

export interface CreateBpplistDto {
  name: string;
  attended?: string;
  attendedAt?: Date | null;
  organizer?: string;
  invitedFrom?: string;
  hasLeft?: boolean;
  isStudent?: boolean;
  untilWhen?: Date | null;
}

export interface UpdateBpplistDto {
  name?: string;
  attended?: string;
  attendedAt?: Date | null;
  organizer?: string;
  invitedFrom?: string;
  hasLeft?: boolean;
  isStudent?: boolean;
  untilWhen?: Date | null;
}

export interface BpplistStatistics {
  attendedCount: number;
  totalCount: number;
  hasLeftCount: number;
  studentsCount: number;
}

export type AlertType = "success" | "error" | "warning" | "info";
