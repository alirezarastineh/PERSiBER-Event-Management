import { Injectable } from '@nestjs/common';

import { MemberCrudService } from './member-crud.service.js';

@Injectable()
export class MemberStatisticsService {
  constructor(private readonly crudService: MemberCrudService) {}

  async getBasicStatistics(): Promise<{ attended: number; total: number }> {
    const total = await this.crudService.countDocuments();
    const attended = await this.crudService.countDocuments({ attended: 'Yes' });
    return { attended, total };
  }

  async getAttendanceStatistics(): Promise<{
    attendedCount: number;
    totalCount: number;
  }> {
    const totalCount = await this.crudService.countDocuments();
    const attendedCount = await this.crudService.countDocuments({
      attended: 'Yes',
    });
    return { attendedCount, totalCount };
  }
}
