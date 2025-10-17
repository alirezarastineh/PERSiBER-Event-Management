import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Guest,
  GuestDocument,
} from '../schemas/guests.schema/guests.schema.js';

@Injectable()
export class GuestDiscountsService {
  private studentDiscountActive = false;
  private ladyDiscountActive = false;

  constructor(
    @InjectModel(Guest.name) private readonly guestModel: Model<GuestDocument>,
  ) {}

  getStudentDiscountStatus(): boolean {
    return this.studentDiscountActive;
  }

  getLadyDiscountStatus(): boolean {
    return this.ladyDiscountActive;
  }

  toggleStudentDiscount(active: boolean): void {
    if (this.studentDiscountActive !== active) {
      this.studentDiscountActive = active;
      this.adjustDrinksCouponsForDiscount('student', active);
    }
  }

  toggleLadyDiscount(active: boolean): void {
    if (this.ladyDiscountActive !== active) {
      this.ladyDiscountActive = active;
      this.adjustDrinksCouponsForDiscount('lady', active);
    }
  }

  async applyDiscounts(guest: GuestDocument): Promise<void> {
    let discountCoupons = 0;

    if (this.studentDiscountActive && guest.isStudent) {
      discountCoupons += 1;
    }

    if (this.ladyDiscountActive && guest.isLady) {
      discountCoupons += 1;
    }

    if (guest.drinksCoupon !== discountCoupons) {
      guest.drinksCoupon = discountCoupons;
      await guest.save();
    }
  }

  async updateStudentStatus(
    guest: GuestDocument,
    isStudent: boolean,
    untilWhen: Date | null,
  ): Promise<void> {
    if (guest.isStudent !== isStudent && this.studentDiscountActive) {
      guest.drinksCoupon += isStudent ? 1 : -1;
      guest.drinksCoupon = Math.max(0, guest.drinksCoupon);
    }

    guest.isStudent = isStudent;
    guest.untilWhen = isStudent ? untilWhen : null;
  }

  async updateLadyStatus(guest: GuestDocument, isLady: boolean): Promise<void> {
    if (guest.isLady !== isLady && this.ladyDiscountActive) {
      guest.drinksCoupon += isLady ? 1 : -1;
      guest.drinksCoupon = Math.max(0, guest.drinksCoupon);
    }

    guest.isLady = isLady;
  }

  private async adjustDrinksCouponsForDiscount(
    type: 'student' | 'lady',
    active: boolean,
  ): Promise<void> {
    const guests = await this.guestModel.find().exec();

    for (const guest of guests) {
      if (type === 'student' && guest.isStudent) {
        guest.drinksCoupon = active
          ? guest.drinksCoupon + 1
          : Math.max(0, guest.drinksCoupon - 1);
      }

      if (type === 'lady' && guest.isLady) {
        guest.drinksCoupon = active
          ? guest.drinksCoupon + 1
          : Math.max(0, guest.drinksCoupon - 1);
      }

      await guest.save();
    }
  }
}
