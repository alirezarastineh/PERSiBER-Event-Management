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

export interface GuestStatisticsProps {
  readonly statistics: {
    readonly totalCount: number;
    readonly attendedCount: number;
    readonly studentsCount?: number;
    readonly ladiesCount?: number;
    readonly drinksCouponsCount?: number;
    readonly freeEntryCount?: number;
  };
  readonly userRole?: string;
  readonly variants?: any;
}

export interface GuestControlPanelProps {
  readonly searchTerm: string;
  readonly onSearchChange: (value: string) => void;
  readonly discountStatuses: {
    readonly studentDiscountActive: boolean;
    readonly ladyDiscountActive: boolean;
  };
  readonly onToggleStudentDiscount: () => void;
  readonly onToggleLadyDiscount: () => void;
  readonly onAddGuest: (name: string) => void;
  readonly userRole?: string;
}

export interface GuestTableProps {
  readonly guests: Guest[];
  readonly attendedStatuses: { [key: string]: boolean };
  readonly onToggleAttendedStatus: (guestId: string) => void;
  readonly onEditGuest: (guest: Guest) => void;
  readonly onDeleteGuest: (guestId: string) => void;
  readonly onNavigateToDetail: (guestId: string) => void;
  readonly userRole?: string;
  readonly variants?: any;
  readonly itemVariants?: any;
}

export interface GuestCardsProps {
  readonly guests: Guest[];
  readonly attendedStatuses: { [key: string]: boolean };
  readonly onToggleAttendedStatus: (guestId: string) => void;
  readonly onEditGuest: (guest: Guest) => void;
  readonly onDeleteGuest: (guestId: string) => void;
  readonly onNavigateToDetail: (guestId: string) => void;
  readonly userRole?: string;
  readonly variants?: any;
  readonly itemVariants?: any;
}

export interface EditGuestModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly guest: Guest | null;
  readonly editData: UpdateGuestDto;
  readonly onEditDataChange: (data: UpdateGuestDto) => void;
  readonly onSave: () => void;
  readonly invitedFromSearchTerm: string;
  readonly onInvitedFromSearchChange: (value: string) => void;
  readonly showDropdown: boolean;
  readonly onShowDropdownChange: (show: boolean) => void;
  readonly filteredGuests: Guest[];
  readonly onAdjustDrinksCoupon: (adjustment: number) => void;
  readonly onShowAlert: (
    title: string,
    message: string,
    type: "success" | "error"
  ) => void;
}

export interface GuestDetailsCardProps {
  readonly guest: Guest;
}

export interface GuestDetailContentProps {
  readonly guest: Guest;
  readonly userRole: string | undefined;
  readonly attendedStatus: boolean;
  readonly editData: UpdateGuestDto;
  readonly invitedFromSearchTerm: string;
  readonly showDropdown: boolean;
  readonly filteredGuests: Guest[];
  readonly onToggleAttendedStatus: () => Promise<void>;
  readonly onEditDataChange: (data: UpdateGuestDto) => void;
  readonly onInvitedFromSearchChange: (value: string) => void;
  readonly onShowDropdownChange: (show: boolean) => void;
  readonly onSave: () => void;
  readonly onDelete: () => void;
  readonly onUpdateStudentStatus: (isStudent: boolean) => Promise<void>;
  readonly onUpdateLadyStatus: (isLady: boolean) => Promise<void>;
  readonly onUpdateFreeEntry: (freeEntry: boolean) => Promise<void>;
  readonly onAdjustDrinksCoupon: (newValue: number) => Promise<void>;
  readonly onShowAlert: (
    title: string,
    message: string,
    type: "success" | "error"
  ) => void;
  readonly goBack: () => void;
}

export interface GuestDetailHeaderProps {
  readonly guestName: string;
}

export interface GuestDrinksCouponProps {
  readonly guest: Guest;
  readonly userRole: string | undefined;
  readonly onAdjustDrinksCoupon: (newValue: number) => Promise<void>;
  readonly onShowAlert: (
    title: string,
    message: string,
    type: "success" | "error"
  ) => void;
}

export interface GuestEditFormProps {
  readonly guest: Guest;
  readonly editData: UpdateGuestDto;
  readonly onEditDataChange: (data: UpdateGuestDto) => void;
  readonly invitedFromSearchTerm: string;
  readonly onInvitedFromSearchChange: (value: string) => void;
  readonly showDropdown: boolean;
  readonly onShowDropdownChange: (show: boolean) => void;
  readonly filteredGuests: Guest[];
  readonly onSave: () => void;
  readonly onDelete: () => void;
  readonly onUpdateStudentStatus: (isStudent: boolean) => Promise<void>;
  readonly onUpdateLadyStatus: (isLady: boolean) => Promise<void>;
  readonly onUpdateFreeEntry: (freeEntry: boolean) => Promise<void>;
}

export interface GuestInfoGridProps {
  readonly guest: Guest;
  readonly userRole: string | undefined;
  readonly onAdjustDrinksCoupon: (newValue: number) => Promise<void>;
  readonly onShowAlert: (
    title: string,
    message: string,
    type: "success" | "error"
  ) => void;
}
