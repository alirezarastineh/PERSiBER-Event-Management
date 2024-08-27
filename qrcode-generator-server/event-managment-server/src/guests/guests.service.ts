import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Guest, GuestDocument } from './schemas/guests.schema/guests.schema';
import { Model } from 'mongoose';
import { CreateGuestDto } from './dto/create-guest.dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto/update-guest.dto';

@Injectable()
export class GuestsService {
  private studentDiscountActive = false;
  private ladyDiscountActive = false;

  constructor(
    @InjectModel(Guest.name) private guestModel: Model<GuestDocument>,
  ) {}

  async findAll(): Promise<{
    guests: Guest[];
    statistics: { attendedCount: number; totalCount: number };
  }> {
    const guests = await this.guestModel.find().exec();
    const statistics = await this.getAttendanceStatistics();
    return { guests, statistics };
  }

  async create(createGuestDto: CreateGuestDto): Promise<Guest> {
    const createdGuest = new this.guestModel(createGuestDto);
    const guest = await createdGuest.save();

    if (createGuestDto.invitedFrom) {
      await this.incrementDrinksCoupon(createGuestDto.invitedFrom);
    }

    await this.applyDiscounts(guest);
    return guest;
  }

  async delete(id: string): Promise<void> {
    const guest = await this.guestModel.findById(id).exec();
    if (!guest) {
      throw new NotFoundException(`Guest with ID "${id}" not found`);
    }

    if (guest.invitedFrom) {
      await this.decrementDrinksCoupon(guest.invitedFrom);
    }

    await guest.deleteOne();
  }

  async update(id: string, updateGuestDto: UpdateGuestDto): Promise<Guest> {
    const guest = await this.guestModel.findById(id).exec();
    if (!guest) {
      throw new NotFoundException(`Guest with ID "${id}" not found`);
    }

    const previousInvitedFrom = guest.invitedFrom;

    if (
      updateGuestDto.invitedFrom &&
      updateGuestDto.invitedFrom === guest.name
    ) {
      throw new Error('A guest cannot invite themselves.');
    }

    if (updateGuestDto.invitedFrom) {
      const inviterExists = await this.guestModel
        .findOne({ name: updateGuestDto.invitedFrom })
        .exec();
      if (!inviterExists) {
        throw new Error(
          `Inviter "${updateGuestDto.invitedFrom}" does not exist in the guest list.`,
        );
      }
    }

    if (
      updateGuestDto.invitedFrom &&
      updateGuestDto.invitedFrom !== guest.invitedFrom
    ) {
      await this.incrementDrinksCoupon(updateGuestDto.invitedFrom);

      if (previousInvitedFrom) {
        await this.decrementDrinksCoupon(previousInvitedFrom);
      }
    }

    if (!updateGuestDto.invitedFrom && previousInvitedFrom) {
      await this.decrementDrinksCoupon(previousInvitedFrom);
    }

    Object.assign(guest, updateGuestDto);
    await guest.save();

    await this.applyDiscounts(guest);

    return guest;
  }

  async updateAttended(id: string, attended: string): Promise<Guest> {
    const guest = await this.guestModel.findById(id).exec();
    if (!guest) {
      throw new NotFoundException(`Guest with ID "${id}" not found`);
    }
    guest.attended = attended;
    await guest.save();

    await this.getAttendanceStatistics();
    return guest;
  }

  async updateStudentStatus(
    id: string,
    isStudent: boolean,
    untilWhen: Date | null,
  ): Promise<Guest> {
    const guest = await this.guestModel.findById(id).exec();
    if (!guest) {
      throw new NotFoundException(`Guest with ID "${id}" not found`);
    }

    if (guest.isStudent !== isStudent && this.studentDiscountActive) {
      guest.drinksCoupon += isStudent ? 1 : -1;
      guest.drinksCoupon = Math.max(0, guest.drinksCoupon);
    }

    guest.isStudent = isStudent;
    guest.untilWhen = isStudent ? untilWhen : null;
    await guest.save();

    return guest;
  }

  async updateLadyStatus(id: string, isLady: boolean): Promise<Guest> {
    const guest = await this.guestModel.findById(id).exec();
    if (!guest) {
      throw new NotFoundException(`Guest with ID "${id}" not found`);
    }

    if (guest.isLady !== isLady && this.ladyDiscountActive) {
      guest.drinksCoupon += isLady ? 1 : -1;
      guest.drinksCoupon = Math.max(0, guest.drinksCoupon);
    }

    guest.isLady = isLady;
    await guest.save();

    return guest;
  }

  async findByName(name: string): Promise<Guest> {
    const guest = await this.guestModel.findOne({ name }).exec();
    if (!guest) {
      throw new NotFoundException(`Guest with name "${name}" not found`);
    }
    return guest;
  }

  async getStatistics(): Promise<{ attended: number; total: number }> {
    const total = await this.guestModel.countDocuments().exec();
    const attended = await this.guestModel
      .countDocuments({ attended: 'Yes' })
      .exec();
    return { attended, total };
  }

  private async incrementDrinksCoupon(inviterName: string): Promise<void> {
    const inviter = await this.guestModel.findOne({ name: inviterName }).exec();
    if (inviter) {
      inviter.drinksCoupon += 1;
      await inviter.save();
    }
  }

  private async decrementDrinksCoupon(inviterName: string): Promise<void> {
    const inviter = await this.guestModel.findOne({ name: inviterName }).exec();
    if (inviter) {
      inviter.drinksCoupon = Math.max(0, inviter.drinksCoupon - 1);
      await inviter.save();
    }
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

  private async adjustDrinksCouponsForDiscount(
    type: 'student' | 'lady',
    active: boolean,
  ): Promise<void> {
    const guests = await this.guestModel.find().exec();

    guests.forEach(async (guest) => {
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
    });
  }

  private async applyDiscounts(guest: GuestDocument): Promise<void> {
    // Apply discounts based on the current state of the discounts
    if (this.studentDiscountActive && guest.isStudent) {
      guest.drinksCoupon += 1;
    }

    if (this.ladyDiscountActive && guest.isLady) {
      guest.drinksCoupon += 1;
    }

    await guest.save();
  }

  private async recalculateDrinksCoupons(): Promise<void> {
    const guests = await this.guestModel.find().exec();

    const invitedMap: { [key: string]: number } = {};

    await this.guestModel.updateMany({}, { drinksCoupon: 0 });

    guests.forEach((guest) => {
      if (guest.invitedFrom) {
        invitedMap[guest.invitedFrom] =
          (invitedMap[guest.invitedFrom] || 0) + 1;
      }
    });

    for (const [name, count] of Object.entries(invitedMap)) {
      await this.guestModel.updateMany(
        { name },
        { $inc: { drinksCoupon: count } },
      );
    }

    guests.forEach(async (guest) => {
      let discountCoupons = 0;

      if (this.studentDiscountActive && guest.isStudent) {
        discountCoupons += 1;
      }

      if (this.ladyDiscountActive && guest.isLady) {
        discountCoupons += 1;
      }

      const newDrinksCoupon = Math.max(0, discountCoupons);
      await this.guestModel.updateOne(
        { _id: guest._id },
        { drinksCoupon: newDrinksCoupon },
      );
    });
  }

  async getAttendanceStatistics(): Promise<{
    attendedCount: number;
    totalCount: number;
  }> {
    const totalCount = await this.guestModel.countDocuments().exec();
    const attendedCount = await this.guestModel
      .countDocuments({ attended: 'Yes' })
      .exec();
    return { attendedCount, totalCount };
  }
}
