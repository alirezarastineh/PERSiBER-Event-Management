import { Injectable } from '@nestjs/common';

import { BpplistDocument } from '../schemas/bpplist.schema/bpplist.schema';

import { BpplistCrudService } from './bpplist-crud.service';

@Injectable()
export class BpplistStatusService {
  constructor(private readonly crudService: BpplistCrudService) {}

  async updateHasLeft(id: string, hasLeft: boolean): Promise<BpplistDocument> {
    const bpplistItem = await this.crudService.findById(id);
    bpplistItem.hasLeft = hasLeft;
    return this.crudService.save(bpplistItem);
  }

  async updateStudentStatus(
    id: string,
    isStudent: boolean,
    untilWhen: Date | null,
  ): Promise<BpplistDocument> {
    const bpplistItem = await this.crudService.findById(id);
    bpplistItem.isStudent = isStudent;
    bpplistItem.untilWhen = isStudent ? untilWhen : null;
    return this.crudService.save(bpplistItem);
  }
}
