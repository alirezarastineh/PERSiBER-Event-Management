import { Injectable } from '@nestjs/common';

import { CreateBpplistDto } from './dto/create-bpplist.dto/create-bpplist.dto.js';
import { UpdateBpplistDto } from './dto/update-bpplist.dto/update-bpplist.dto.js';
import { Bpplist } from './schemas/bpplist.schema/bpplist.schema.js';
import { BpplistAttendanceService } from './services/bpplist-attendance.service.js';
import { BpplistCrudService } from './services/bpplist-crud.service.js';
import { BpplistInvitationService } from './services/bpplist-invitation.service.js';
import { BpplistStatisticsService } from './services/bpplist-statistics.service.js';
import { BpplistStatusService } from './services/bpplist-status.service.js';
import { BpplistValidationService } from './services/bpplist-validation.service.js';

@Injectable()
export class BpplistService {
  constructor(
    private readonly crudService: BpplistCrudService,
    private readonly validationService: BpplistValidationService,
    private readonly invitationService: BpplistInvitationService,
    private readonly statisticsService: BpplistStatisticsService,
    private readonly attendanceService: BpplistAttendanceService,
    private readonly statusService: BpplistStatusService,
  ) {}

  async findAll(): Promise<{
    bpplist: Bpplist[];
    statistics: { attendedCount: number; totalCount: number };
  }> {
    const bpplist = await this.crudService.findAll();
    await this.invitationService.recalculateMembersInvited();
    const statistics = await this.statisticsService.getAttendanceStatistics();
    return { bpplist, statistics };
  }

  async create(createBpplistDto: CreateBpplistDto): Promise<Bpplist> {
    this.validationService.validateOrganizerForCreate(createBpplistDto);
    this.validationService.validateSelfInvitationForCreate(createBpplistDto);

    const bpplistItem = await this.crudService.create(createBpplistDto);

    if (createBpplistDto.invitedFrom) {
      await this.invitationService.incrementMembersInvited(
        createBpplistDto.invitedFrom,
      );
    }

    return bpplistItem;
  }

  async delete(id: string): Promise<void> {
    const bpplistItem = await this.crudService.findById(id);

    if (bpplistItem.invitedFrom) {
      await this.invitationService.decrementMembersInvited(
        bpplistItem.invitedFrom,
      );
    }

    await this.crudService.delete(bpplistItem);
  }

  async update(
    id: string,
    updateBpplistDto: UpdateBpplistDto,
  ): Promise<Bpplist> {
    const bpplistItem = await this.crudService.findById(id);

    this.validationService.validateOrganizerForUpdate(updateBpplistDto);
    this.validationService.validateSelfInvitationForUpdate(
      updateBpplistDto,
      bpplistItem.name,
    );

    const previousInvitedFrom = bpplistItem.invitedFrom;

    await this.invitationService.handleInviterChange(
      updateBpplistDto.invitedFrom,
      previousInvitedFrom,
    );

    Object.assign(bpplistItem, updateBpplistDto);

    this.validationService.handleAttendanceTimestamp(
      bpplistItem,
      updateBpplistDto.attended,
    );

    return this.crudService.save(bpplistItem);
  }

  async updateAttended(id: string, attended: string): Promise<Bpplist> {
    return this.attendanceService.updateAttended(id, attended);
  }

  async updateHasLeft(id: string, hasLeft: boolean): Promise<Bpplist> {
    return this.statusService.updateHasLeft(id, hasLeft);
  }

  async updateStudentStatus(
    id: string,
    isStudent: boolean,
    untilWhen: Date | null,
  ): Promise<Bpplist> {
    return this.statusService.updateStudentStatus(id, isStudent, untilWhen);
  }

  async getStatistics(): Promise<{ attended: number; total: number }> {
    return this.statisticsService.getBasicStatistics();
  }

  async getAttendanceStatistics(): Promise<{
    attendedCount: number;
    totalCount: number;
  }> {
    return this.statisticsService.getAttendanceStatistics();
  }
}
