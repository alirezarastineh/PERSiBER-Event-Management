import { Injectable, BadRequestException } from '@nestjs/common';

import { BpplistDocument } from '../schemas/bpplist.schema/bpplist.schema.js';

import { BpplistCrudService } from './bpplist-crud.service.js';
import { BpplistStatisticsService } from './bpplist-statistics.service.js';

@Injectable()
export class BpplistAttendanceService {
  constructor(
    private readonly crudService: BpplistCrudService,
    private readonly statisticsService: BpplistStatisticsService,
  ) {}

  async updateAttended(id: string, attended: string): Promise<BpplistDocument> {
    const bpplistItem = await this.crudService.findById(id);

    if (bpplistItem.attended === 'Yes' && attended === 'Yes') {
      throw new BadRequestException('BBP list item is already attended');
    }

    bpplistItem.attended = attended;

    if (attended === 'Yes') {
      bpplistItem.attendedAt = new Date();
    } else {
      bpplistItem.attendedAt = null;
    }

    await this.crudService.save(bpplistItem);

    // Refresh statistics after attendance update
    await this.statisticsService.getAttendanceStatistics();

    return bpplistItem;
  }
}
