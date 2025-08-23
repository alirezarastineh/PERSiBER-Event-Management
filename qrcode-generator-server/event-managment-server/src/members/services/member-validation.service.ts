import { Injectable, BadRequestException } from '@nestjs/common';

import { CreateMemberDto } from '../dto/create-member.dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto/update-member.dto';
import { MemberDocument } from '../schemas/members.schema/members.schema';

@Injectable()
export class MemberValidationService {
  private readonly validOrganizers = ['Kourosh', 'Sobhan', 'Mutual'];

  validateOrganizerForCreate(createMemberDto: CreateMemberDto): void {
    if (
      createMemberDto.organizer &&
      !this.validOrganizers.includes(createMemberDto.organizer)
    ) {
      throw new BadRequestException(
        'Organizer must be either "Kourosh", "Sobhan", or "Mutual".',
      );
    }
  }

  validateOrganizerForUpdate(updateMemberDto: UpdateMemberDto): void {
    if (
      updateMemberDto.organizer &&
      !this.validOrganizers.includes(updateMemberDto.organizer)
    ) {
      throw new BadRequestException(
        'Organizer must be either "Kourosh", "Sobhan", or "Mutual".',
      );
    }
  }

  validateSelfInvitationForCreate(createMemberDto: CreateMemberDto): void {
    if (
      createMemberDto.invitedFrom &&
      createMemberDto.invitedFrom === createMemberDto.name
    ) {
      throw new BadRequestException('A member cannot invite themselves.');
    }
  }

  validateSelfInvitationForUpdate(
    updateMemberDto: UpdateMemberDto,
    memberName: string,
  ): void {
    if (
      updateMemberDto.invitedFrom &&
      updateMemberDto.invitedFrom === memberName
    ) {
      throw new BadRequestException('A member cannot invite themselves.');
    }
  }

  handleAttendanceTimestamp(member: MemberDocument, attended?: string): void {
    if (attended !== undefined) {
      member.attendedAt = attended === 'Yes' ? new Date() : null;
    }
  }
}
