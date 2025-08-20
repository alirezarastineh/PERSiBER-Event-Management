import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Guest, GuestDocument } from '../schemas/guests.schema/guests.schema';

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
    const guests = await this.guestModel.find().exec();

    const invitedMap: { [key: string]: number } = {};

    // Reset all drink coupons to 0
    await this.guestModel.updateMany({}, { drinksCoupon: 0 });

    // Count invitations for each guest
    guests.forEach(guest => {
      if (guest.invitedFrom) {
        invitedMap[guest.invitedFrom] =
          (invitedMap[guest.invitedFrom] || 0) + 1;
      }
    });

    // Update drink coupons based on invitations
    for (const [name, count] of Object.entries(invitedMap)) {
      await this.guestModel.updateOne(
        { name },
        { $inc: { drinksCoupon: count } },
      );
    }

    // Apply discount coupons
    guests.forEach(async guest => {
      let discountCoupons = 0;

      if (studentDiscountActive && guest.isStudent) {
        discountCoupons += 1;
      }

      if (ladyDiscountActive && guest.isLady) {
        discountCoupons += 1;
      }

      const totalDrinksCoupon = guest.drinksCoupon + discountCoupons;
      await this.guestModel.updateOne(
        { _id: guest._id },
        { drinksCoupon: totalDrinksCoupon },
      );
    });
  }
}
