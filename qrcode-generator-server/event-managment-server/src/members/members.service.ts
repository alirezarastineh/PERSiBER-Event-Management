import { Injectable } from '@nestjs/common';

import { CreateMemberDto } from './dto/create-member.dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto/update-member.dto';
import { Member } from './schemas/members.schema/members.schema';
import { MemberAttendanceService } from './services/member-attendance.service';
import { MemberCrudService } from './services/member-crud.service';
import { MemberInvitationService } from './services/member-invitation.service';
import { MemberStatisticsService } from './services/member-statistics.service';
import { MemberStatusService } from './services/member-status.service';
import { MemberValidationService } from './services/member-validation.service';

@Injectable()
export class MembersService {
  constructor(
    private readonly crudService: MemberCrudService,
    private readonly validationService: MemberValidationService,
    private readonly invitationService: MemberInvitationService,
    private readonly statisticsService: MemberStatisticsService,
    private readonly attendanceService: MemberAttendanceService,
    private readonly statusService: MemberStatusService,
  ) {}

  async findAll(): Promise<{
    members: Member[];
    statistics: { attendedCount: number; totalCount: number };
  }> {
    const members = await this.crudService.findAll();
    await this.invitationService.recalculateMembersInvited();
    const statistics = await this.statisticsService.getAttendanceStatistics();
    return { members, statistics };
  }

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    this.validationService.validateOrganizerForCreate(createMemberDto);
    this.validationService.validateSelfInvitationForCreate(createMemberDto);

    const member = await this.crudService.create(createMemberDto);

    if (createMemberDto.invitedFrom) {
      await this.invitationService.incrementMembersInvited(
        createMemberDto.invitedFrom,
      );
    }

    return member;
  }

  async delete(id: string): Promise<void> {
    const member = await this.crudService.findById(id);

    if (member.invitedFrom) {
      await this.invitationService.decrementMembersInvited(member.invitedFrom);
    }

    await this.crudService.delete(member);
  }

  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const member = await this.crudService.findById(id);

    this.validationService.validateOrganizerForUpdate(updateMemberDto);
    this.validationService.validateSelfInvitationForUpdate(
      updateMemberDto,
      member.name,
    );

    const previousInvitedFrom = member.invitedFrom;

    await this.invitationService.handleInviterChange(
      updateMemberDto.invitedFrom,
      previousInvitedFrom,
    );

    Object.assign(member, updateMemberDto);

    this.validationService.handleAttendanceTimestamp(
      member,
      updateMemberDto.attended,
    );

    return this.crudService.save(member);
  }

  async updateAttended(id: string, attended: string): Promise<Member> {
    return this.attendanceService.updateAttended(id, attended);
  }

  async updateHasLeft(id: string, hasLeft: boolean): Promise<Member> {
    return this.statusService.updateHasLeft(id, hasLeft);
  }

  async updateStudentStatus(
    id: string,
    isStudent: boolean,
    untilWhen: Date | null,
  ): Promise<Member> {
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
