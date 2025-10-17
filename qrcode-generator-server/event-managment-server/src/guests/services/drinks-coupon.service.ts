import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Guest,
  GuestDocument,
} from '../schemas/guests.schema/guests.schema.js';

@Injectable()
export class DrinksCouponService {
  constructor(
    @InjectModel(Guest.name) private readonly guestModel: Model<GuestDocument>,
  ) {}

  async adjustDrinksCoupon(
    id: string,
    adjustment: number,
  ): Promise<GuestDocument> {
    const guest = await this.guestModel.findById(id).exec();
    if (!guest) {
      throw new NotFoundException(`Guest with ID "${id}" not found`);
    }

    guest.drinksCoupon += adjustment;
    // Ensure drink coupons don't go below 0
    guest.drinksCoupon = Math.max(0, guest.drinksCoupon);

    await guest.save();
    return guest;
  }

  async incrementDrinksCoupon(inviterName: string): Promise<void> {
    const inviter = await this.guestModel.findOne({ name: inviterName }).exec();
    if (inviter) {
      inviter.drinksCoupon += 1;
      await inviter.save();
    }
  }

  async decrementDrinksCoupon(inviterName: string): Promise<void> {
    const inviter = await this.guestModel.findOne({ name: inviterName }).exec();
    if (inviter) {
      inviter.drinksCoupon = Math.max(0, inviter.drinksCoupon - 1);
      await inviter.save();
    }
  }

  async handleInviterChange(
    newInviter: string,
    previousInviter: string,
  ): Promise<void> {
    if (newInviter === previousInviter) return;

    if (newInviter) {
      await this.incrementDrinksCoupon(newInviter);
    }

    if (previousInviter) {
      await this.decrementDrinksCoupon(previousInviter);
    }
  }

  async recalculateDrinksCoupons(
    studentDiscountActive: boolean,
    ladyDiscountActive: boolean,
  ): Promise<void> {
    // Use lean() to get plain objects - much faster
    const guests = await this.guestModel.find().lean().exec();

    const invitedMap: { [key: string]: number } = {};

    // Count invitations for each guest
    for (const guest of guests) {
      if (guest.invitedFrom) {
        invitedMap[guest.invitedFrom] =
          (invitedMap[guest.invitedFrom] || 0) + 1;
      }
    }

    // Build bulk operations array
    const bulkOps = [];

    // Reset all drink coupons to 0
    bulkOps.push({
      updateMany: {
        filter: {},
        update: { $set: { drinksCoupon: 0 } },
      },
    });

    // Update drink coupons based on invitations and discounts in one pass
    for (const guest of guests) {
      let totalCoupons = invitedMap[guest.name] || 0;

      // Add discount coupons
      if (studentDiscountActive && guest.isStudent) {
        totalCoupons += 1;
      }

      if (ladyDiscountActive && guest.isLady) {
        totalCoupons += 1;
      }

      if (totalCoupons > 0) {
        bulkOps.push({
          updateOne: {
            filter: { _id: guest._id },
            update: { $set: { drinksCoupon: totalCoupons } },
          },
        });
      }
    }

    // Execute all updates in one batch operation - MUCH faster!
    if (bulkOps.length > 0) {
      await this.guestModel.bulkWrite(bulkOps);
    }
  }
}
