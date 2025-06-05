import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateBpplistDto } from '../dto/create-bpplist.dto/create-bpplist.dto';
import { UpdateBpplistDto } from '../dto/update-bpplist.dto/update-bpplist.dto';

@Injectable()
export class BpplistValidationService {
  private readonly validOrganizers = ['Kourosh', 'Sobhan', 'Mutual'];

  validateOrganizerForCreate(createBpplistDto: CreateBpplistDto): void {
    if (
      createBpplistDto.organizer &&
      !this.validOrganizers.includes(createBpplistDto.organizer)
    ) {
      throw new BadRequestException(
        'Organizer must be either "Kourosh", "Sobhan", or "Mutual".',
      );
    }
  }

  validateOrganizerForUpdate(updateBpplistDto: UpdateBpplistDto): void {
    if (
      updateBpplistDto.organizer &&
      !this.validOrganizers.includes(updateBpplistDto.organizer)
    ) {
      throw new BadRequestException(
        'Organizer must be either "Kourosh", "Sobhan", or "Mutual".',
      );
    }
  }

  validateSelfInvitationForCreate(createBpplistDto: CreateBpplistDto): void {
    if (
      createBpplistDto.invitedFrom &&
      createBpplistDto.invitedFrom === createBpplistDto.name
    ) {
      throw new BadRequestException('A member cannot invite themselves.');
    }
  }

  validateSelfInvitationForUpdate(
    updateBpplistDto: UpdateBpplistDto,
    itemName: string,
  ): void {
    if (
      updateBpplistDto.invitedFrom &&
      updateBpplistDto.invitedFrom === itemName
    ) {
      throw new BadRequestException('A member cannot invite themselves.');
    }
  }

  handleAttendanceTimestamp(bpplistItem: any, attended?: string): void {
    if (attended !== undefined) {
      bpplistItem.attendedAt = attended === 'Yes' ? new Date() : null;
    }
  }
}
