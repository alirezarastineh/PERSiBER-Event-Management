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

export interface BpplistControlPanelProps {
  readonly searchTerm: string;
  readonly onSearchChange: (value: string) => void;
  readonly onAddBpplistItem: (itemData: CreateBpplistDto) => void;
  readonly userRole?: string;
}

export interface BpplistStatisticsProps {
  readonly statistics: {
    totalCount: number;
    attendedCount: number;
    studentsCount?: number;
    hasLeftCount?: number;
  };
  readonly userRole?: string;
  readonly variants?: any;
}

export interface EditBpplistModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly item: Bpplist | null;
  readonly editData: UpdateBpplistDto;
  readonly onEditDataChange: (data: UpdateBpplistDto) => void;
  readonly onSave: () => void;
  readonly invitedFromSearchTerm: string;
  readonly onInvitedFromSearchChange: (value: string) => void;
  readonly showDropdown: boolean;
  readonly onShowDropdownChange: (show: boolean) => void;
  readonly filteredItems: Bpplist[];
}

export interface BpplistCardsProps {
  readonly items: Bpplist[];
  readonly toggleStatuses: {
    [key: string]: { attended: boolean; hasLeft: boolean; isStudent: boolean };
  };
  readonly onToggleAttendedStatus: (itemId: string) => void;
  readonly onToggleHasLeftStatus: (itemId: string) => void;
  readonly onToggleStudentStatus: (itemId: string) => void;
  readonly onEditItem: (item: Bpplist) => void;
  readonly onDeleteItem: (itemId: string) => void;
  readonly userRole?: string;
  readonly variants?: any;
  readonly itemVariants?: any;
}

export interface BpplistTableProps {
  readonly items: Bpplist[];
  readonly toggleStatuses: {
    [key: string]: { attended: boolean; hasLeft: boolean; isStudent: boolean };
  };
  readonly onToggleAttendedStatus: (itemId: string) => void;
  readonly onToggleHasLeftStatus: (itemId: string) => void;
  readonly onToggleStudentStatus: (itemId: string) => void;
  readonly onEditItem: (item: Bpplist) => void;
  readonly onDeleteItem: (itemId: string) => void;
  readonly userRole?: string;
  readonly variants?: any;
  readonly itemVariants?: any;
}
