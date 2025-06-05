import { Injectable, BadRequestException } from '@nestjs/common';
import { MemberDocument } from '../schemas/members.schema/members.schema';
import { MemberCrudService } from './member-crud.service';
import { MemberStatisticsService } from './member-statistics.service';

@Injectable()
export class MemberAttendanceService {
  constructor(
    private readonly crudService: MemberCrudService,
    private readonly statisticsService: MemberStatisticsService,
  ) {}

  async updateAttended(id: string, attended: string): Promise<MemberDocument> {
    const member = await this.crudService.findById(id);

    if (member.attended === 'Yes' && attended === 'Yes') {
      throw new BadRequestException('Member is already attended');
    }

    member.attended = attended;

    if (attended === 'Yes') {
      member.attendedAt = new Date();
    } else {
      member.attendedAt = null;
    }

    await this.crudService.save(member);

    // Refresh statistics after attendance update
    await this.statisticsService.getAttendanceStatistics();

    return member;
  }
}
