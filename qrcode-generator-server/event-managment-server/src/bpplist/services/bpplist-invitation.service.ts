import { Injectable } from '@nestjs/common';

import { BpplistCrudService } from './bpplist-crud.service';

@Injectable()
export class BpplistInvitationService {
  constructor(private readonly crudService: BpplistCrudService) {}

  async incrementMembersInvited(inviterName: string): Promise<void> {
    const inviter = await this.crudService.findByName(inviterName);
    if (inviter) {
      inviter.membersInvited += 1;
      await this.crudService.save(inviter);
    }
  }

  async decrementMembersInvited(inviterName: string): Promise<void> {
    const inviter = await this.crudService.findByName(inviterName);
    if (inviter) {
      inviter.membersInvited = Math.max(0, inviter.membersInvited - 1);
      await this.crudService.save(inviter);
    }
  }

  async recalculateMembersInvited(): Promise<void> {
    const bpplist = await this.crudService.findAll();

    // Reset all invitation counts to 0
    await this.crudService.updateMany({}, { membersInvited: 0 });

    // Calculate invitation counts
    const invitedMap: { [key: string]: number } = {};

    for (const item of bpplist) {
      if (item.invitedFrom) {
        invitedMap[item.invitedFrom] = (invitedMap[item.invitedFrom] || 0) + 1;
      }
    }

    // Update invitation counts for each item
    for (const [name, count] of Object.entries(invitedMap)) {
      await this.crudService.updateMany(
        { name },
        { $set: { membersInvited: count } },
      );
    }
  }

  async handleInviterChange(
    newInviter?: string,
    previousInviter?: string,
  ): Promise<void> {
    if (newInviter && newInviter !== previousInviter) {
      await this.incrementMembersInvited(newInviter);
      if (previousInviter) {
        await this.decrementMembersInvited(previousInviter);
      }
    }

    if (!newInviter && previousInviter) {
      await this.decrementMembersInvited(previousInviter);
    }
  }
}
