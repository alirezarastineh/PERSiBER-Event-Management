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

export interface EditMemberModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly member: Member | null;
  readonly editData: UpdateMemberDto;
  readonly onEditDataChange: (data: UpdateMemberDto) => void;
  readonly onSave: () => void;
  readonly invitedFromSearchTerm: string;
  readonly onInvitedFromSearchChange: (value: string) => void;
  readonly showDropdown: boolean;
  readonly onShowDropdownChange: (show: boolean) => void;
  readonly filteredMembers: Member[];
}

export interface MemberCardsProps {
  readonly members: Member[];
  readonly toggleStatuses: {
    [key: string]: { attended: boolean; hasLeft: boolean; isStudent: boolean };
  };
  readonly onToggleAttendedStatus: (memberId: string) => void;
  readonly onToggleHasLeftStatus: (memberId: string) => void;
  readonly onToggleStudentStatus: (memberId: string) => void;
  readonly onEditMember: (member: Member) => void;
  readonly onDeleteMember: (memberId: string) => void;
  readonly userRole?: string;
  readonly variants?: any;
  readonly itemVariants?: any;
}

export interface MemberControlPanelProps {
  readonly searchTerm: string;
  readonly onSearchChange: (value: string) => void;
  readonly onAddMember: (memberData: CreateMemberDto) => void;
  readonly userRole?: string;
}

export interface MemberStatisticsProps {
  readonly statistics: {
    readonly totalCount: number;
    readonly attendedCount: number;
    readonly studentsCount?: number;
    readonly hasLeftCount?: number;
  };
  readonly userRole?: string;
  readonly variants?: any;
}

export interface MemberTableProps {
  readonly members: Member[];
  readonly toggleStatuses: {
    [key: string]: { attended: boolean; hasLeft: boolean; isStudent: boolean };
  };
  readonly onToggleAttendedStatus: (memberId: string) => void;
  readonly onToggleHasLeftStatus: (memberId: string) => void;
  readonly onToggleStudentStatus: (memberId: string) => void;
  readonly onEditMember: (member: Member) => void;
  readonly onDeleteMember: (memberId: string) => void;
  readonly userRole?: string;
  readonly variants?: any;
  readonly itemVariants?: any;
}
