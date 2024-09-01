import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Guest, GuestDocument } from './schemas/guests.schema/guests.schema';
import { Model} from 'mongoose';
import { CreateGuestDto } from './dto/create-guest.dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto/update-guest.dto';

@Injectable()
export class GuestsService {
  private studentDiscountActive = false;
  private ladyDiscountActive = false;

  constructor(
    @InjectModel(Guest.name) private guestModel: Model<GuestDocument>,
  ) {}

  async findAll(userRole: string): Promise<{
    guests: GuestDocument[];
    statistics: {
      attendedCount: number;
      totalCount: number;
      studentsCount?: number;
      ladiesCount?: number;
      drinksCouponsCount?: number;
      freeEntryCount?: number;
    };
  }> {
    const guests = await this.guestModel.find().exec();
    const statistics = await this.getAttendanceStatistics(userRole);
    return { guests, statistics };
  }

  async create(createGuestDto: CreateGuestDto): Promise<GuestDocument> {
    const createdGuest = new this.guestModel(createGuestDto);
    const guest = await createdGuest.save();

    if (createGuestDto.invitedFrom) {
      await this.incrementDrinksCoupon(createGuestDto.invitedFrom);
    }

    await this.applyDiscounts(guest);
    await this.recalculateDrinksCoupons();
    return guest;
  }

  async findOrCreateGuest(name: string): Promise<GuestDocument> {
    let guest = await this.guestModel.findOne({ name }).exec();

    if (!guest) {
      const createGuestDto: CreateGuestDto = { name };
      guest = await this.create(createGuestDto);
    }
    return guest as GuestDocument;
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
    await this.recalculateDrinksCoupons();
  }

  async update(
    id: string,
    updateGuestDto: UpdateGuestDto,
  ): Promise<GuestDocument> {
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

    if (updateGuestDto.invitedFrom !== guest.invitedFrom) {
      if (updateGuestDto.invitedFrom) {
        await this.incrementDrinksCoupon(updateGuestDto.invitedFrom);
      }

      if (previousInvitedFrom) {
        await this.decrementDrinksCoupon(previousInvitedFrom);
      }
    }

    Object.assign(guest, updateGuestDto);

    await guest.save();

    if (
      updateGuestDto.isStudent !== undefined ||
      updateGuestDto.isLady !== undefined
    ) {
      await this.applyDiscounts(guest);
    }

    return guest;
  }

  async updateAttended(
    id: string,
    attended: string,
    userRole: string,
  ): Promise<GuestDocument> {
    const guest = await this.guestModel.findById(id).exec();
    if (!guest) {
      throw new NotFoundException(`Guest with ID "${id}" not found`);
    }
    guest.attended = attended;
    await guest.save();

    await this.getAttendanceStatistics(userRole);
    return guest;
  }

  async updateStudentStatus(
    id: string,
    isStudent: boolean,
    untilWhen: Date | null,
  ): Promise<GuestDocument> {
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

  async updateLadyStatus(id: string, isLady: boolean): Promise<GuestDocument> {
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

  async findByName(name: string): Promise<GuestDocument> {
    const guest = await this.guestModel.findOne({ name }).exec();
    if (!guest) {
      throw new NotFoundException(`Guest with name "${name}" not found`);
    }
    return guest;
  }

  async findById(id: string): Promise<GuestDocument> {
    const guest = await this.guestModel.findById(id).exec();
    if (!guest) {
      throw new NotFoundException(`Guest with ID "${id}" not found`);
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
      await this.guestModel.updateOne(
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

      const totalDrinksCoupon = guest.drinksCoupon + discountCoupons;
      await this.guestModel.updateOne(
        { _id: guest._id },
        { drinksCoupon: totalDrinksCoupon },
      );
    });
  }

  async getAttendanceStatistics(userRole?: string): Promise<{
    attendedCount: number;
    totalCount: number;
    studentsCount?: number;
    ladiesCount?: number;
    drinksCouponsCount?: number;
    freeEntryCount?: number;
  }> {
    const totalCount = await this.guestModel.countDocuments().exec();
    const attendedCount = await this.guestModel
      .countDocuments({ attended: 'Yes' })
      .exec();

    if (userRole === 'admin' || userRole === 'master') {
      const studentsCount = await this.guestModel
        .countDocuments({ isStudent: true })
        .exec();
      const ladiesCount = await this.guestModel
        .countDocuments({ isLady: true })
        .exec();
      const drinksCouponsCount = await this.guestModel
        .aggregate([
          {
            $group: {
              _id: null,
              totalDrinks: { $sum: '$drinksCoupon' },
            },
          },
        ])
        .exec()
        .then((result) => (result[0] ? result[0].totalDrinks : 0));
      const freeEntryCount = await this.guestModel
        .countDocuments({ freeEntry: true })
        .exec();

      return {
        attendedCount,
        totalCount,
        studentsCount,
        ladiesCount,
        drinksCouponsCount,
        freeEntryCount,
      };
    }

    return { attendedCount, totalCount };
  }
}
