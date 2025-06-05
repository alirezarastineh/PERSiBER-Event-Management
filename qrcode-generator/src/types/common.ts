import { ReactNode, ChangeEvent, FormEvent } from "react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface StatisticsCardProps {
  readonly title: string;
  readonly value: number;
  readonly icon: React.ReactNode;
  readonly iconBgColor: string;
  readonly iconColor: string;
  readonly variants?: any;
}

export interface ToggleSwitchProps {
  readonly isActive: boolean;
  readonly onToggle: () => void;
  readonly label?: string;
  readonly title?: string;
  readonly size?: "sm" | "md" | "lg";
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly layout?: "inline" | "stacked" | "between";
  readonly colorScheme?: "default" | "emerald";
  readonly variants?: {
    hidden: { opacity: number; y: number };
    visible: {
      opacity: number;
      y: number;
      transition: { type: string; stiffness: number; damping: number };
    };
  };
}

export interface SearchInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly label?: string;
  readonly id?: string;
  readonly className?: string;
}

export interface AlertModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly type: AlertType;
  readonly title: string;
  readonly message: string;
  readonly getBackgroundColor: (type: AlertType) => string;
  readonly customContent?: React.ReactNode;
}

export interface DeleteConfirmationModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly title?: string;
  readonly message?: string;
}

export interface ErrorStateProps {
  readonly title?: string;
  readonly message?: string;
}

export interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly title?: string;
}

export interface SpinnerProps {
  readonly sm?: boolean;
  readonly md?: boolean;
  readonly lg?: boolean;
  readonly xl?: boolean;
  readonly fullscreen?: boolean;
  readonly className?: string;
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
