import { Injectable } from '@nestjs/common';

import { MemberDocument } from '../schemas/members.schema/members.schema.js';

import { MemberCrudService } from './member-crud.service.js';

@Injectable()
export class MemberStatusService {
  constructor(private readonly crudService: MemberCrudService) {}

  async updateHasLeft(id: string, hasLeft: boolean): Promise<MemberDocument> {
    const member = await this.crudService.findById(id);
    member.hasLeft = hasLeft;
    return this.crudService.save(member);
  }

  async updateStudentStatus(
    id: string,
    isStudent: boolean,
    untilWhen: Date | null,
  ): Promise<MemberDocument> {
    const member = await this.crudService.findById(id);
    member.isStudent = isStudent;
    member.untilWhen = isStudent ? untilWhen : null;
    return this.crudService.save(member);
  }
}
