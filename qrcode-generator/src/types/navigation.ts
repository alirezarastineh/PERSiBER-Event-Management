import { ReactNode } from "react";
import { User } from "./auth";

export interface NavLogoProps {
  readonly onLogoClick: () => void;
}

export interface NavItemProps {
  readonly icon: ReactNode;
  readonly label: string;
  readonly onClick: () => void;
  readonly isActive: boolean;
  readonly variants?: any;
}

export interface DesktopNavigationProps {
  readonly isAuthenticated: boolean;
  readonly user: User | null;
  readonly isAdminOrMaster: boolean;
  readonly isActive: (path: string) => boolean;
  readonly handleMenuItemClick: (fn: () => void) => void;
  readonly handleQRRedirect: () => void;
  readonly handleRegisterRedirect: () => void;
  readonly handleUsersRedirect: () => void;
  readonly handleScannerRedirect: () => void;
  readonly handleGuestsRedirect: () => void;
  readonly handleMembersRedirect: () => void;
  readonly handleBppListRedirect: () => void;
  readonly handleLogout: () => void;
  readonly handleLoginRedirect: () => void;
}

export interface MobileMenuButtonProps {
  readonly isMenuOpen: boolean;
  readonly toggleMenu: () => void;
}

export interface MobileMenuProps {
  readonly isMenuOpen: boolean;
  readonly closeMenu: () => void;
  readonly isAuthenticated: boolean;
  readonly user: User | null;
  readonly isAdminOrMaster: boolean;
  readonly isActive: (path: string) => boolean;
  readonly handleMenuItemClick: (fn: () => void) => void;
  readonly handleQRRedirect: () => void;
  readonly handleRegisterRedirect: () => void;
  readonly handleUsersRedirect: () => void;
  readonly handleScannerRedirect: () => void;
  readonly handleGuestsRedirect: () => void;
  readonly handleMembersRedirect: () => void;
  readonly handleBppListRedirect: () => void;
  readonly handleLogout: () => void;
  readonly handleLoginRedirect: () => void;
}
