import { Injectable } from '@nestjs/common';

import { GuestDocument } from '../schemas/guests.schema/guests.schema';

import { GuestCrudService } from './guest-crud.service';
import { GuestDiscountsService } from './guest-discounts.service';

@Injectable()
export class GuestStatusService {
  constructor(
    private readonly crudService: GuestCrudService,
    private readonly discountsService: GuestDiscountsService,
  ) {}

  async updateStudentStatus(
    id: string,
    isStudent: boolean,
    untilWhen: Date | null,
  ): Promise<GuestDocument> {
    const guest = await this.crudService.findById(id);

    await this.discountsService.updateStudentStatus(
      guest,
      isStudent,
      untilWhen,
    );

    return this.crudService.save(guest);
  }

  async updateLadyStatus(id: string, isLady: boolean): Promise<GuestDocument> {
    const guest = await this.crudService.findById(id);

    await this.discountsService.updateLadyStatus(guest, isLady);

    return this.crudService.save(guest);
  }
}
