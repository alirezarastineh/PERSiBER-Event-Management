import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guest, GuestDocument } from '../schemas/guests.schema/guests.schema';

@Injectable()
export class GuestValidationService {
  constructor(
    @InjectModel(Guest.name) private readonly guestModel: Model<GuestDocument>,
  ) {}

  async validateInviter(inviterName: string, guestName: string): Promise<void> {
    if (!inviterName) return;

    if (inviterName === guestName) {
      throw new Error('A guest cannot invite themselves.');
    }

    const inviterExists = await this.guestModel
      .findOne({ name: inviterName })
      .exec();
    if (!inviterExists) {
      throw new Error(
        `Inviter "${inviterName}" does not exist in the guest list.`,
      );
    }
  }

  handleAttendanceTimestamp(guest: GuestDocument, attended: string): void {
    if (attended === undefined) return;

    guest.attendedAt = attended === 'Yes' ? new Date() : null;
  }
}
