import { Injectable } from '@nestjs/common';

import { MemberCrudService } from './member-crud.service';

@Injectable()
export class MemberInvitationService {
  constructor(private readonly crudService: MemberCrudService) {}

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
    const members = await this.crudService.findAll();

    // Reset all invitation counts to 0
    await this.crudService.updateMany({}, { membersInvited: 0 });

    // Calculate invitation counts
    const invitedMap: { [key: string]: number } = {};

    members.forEach(member => {
      if (member.invitedFrom) {
        invitedMap[member.invitedFrom] =
          (invitedMap[member.invitedFrom] || 0) + 1;
      }
    });

    // Update invitation counts for each member
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
