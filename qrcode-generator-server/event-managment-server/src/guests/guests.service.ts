import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Guest } from './schemas/guests.schema/guests.schema';
import { Model } from 'mongoose';
import { CreateGuestDto } from './dto/create-guest.dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto/update-guest.dto';

@Injectable()
export class GuestsService {
  constructor(@InjectModel(Guest.name) private guestModel: Model<Guest>) {}

  async findAll(): Promise<{
    guests: Guest[];
    statistics: { attendedCount: number; totalCount: number };
  }> {
    const guests = await this.guestModel.find().exec();
    await this.recalculateDrinksCoupons();
    const statistics = await this.getAttendanceStatistics();
    return { guests, statistics };
  }

  async create(createGuestDto: CreateGuestDto): Promise<Guest> {
    const createdGuest = new this.guestModel(createGuestDto);
    const guest = await createdGuest.save();

    if (createGuestDto.invitedFrom) {
      await this.incrementDrinksCoupon(createGuestDto.invitedFrom);
    }

    return guest;
  }

  async delete(id: string): Promise<void> {
    const result = await this.guestModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Guest with ID "${id}" not found`);
    }
  }

  async update(id: string, updateGuestDto: UpdateGuestDto): Promise<Guest> {
    const guest = await this.guestModel.findById(id).exec();
    if (!guest) {
      throw new NotFoundException(`Guest with ID "${id}" not found`);
    }

    if (
      updateGuestDto.invitedFrom &&
      updateGuestDto.invitedFrom !== guest.invitedFrom
    ) {
      await this.incrementDrinksCoupon(updateGuestDto.invitedFrom);
      if (guest.invitedFrom) {
        await this.decrementDrinksCoupon(guest.invitedFrom);
      }
    }

    Object.assign(guest, updateGuestDto);
    return guest.save();
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
    guest.isStudent = isStudent;
    guest.untilWhen = isStudent ? untilWhen : null;
    return guest.save();
  }

  async createPaidGuest(name: string): Promise<Guest> {
    return this.create({ name, alreadyPaid: true });
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
      inviter.drinksCoupon -= 1;
      await inviter.save();
    }
  }

  private async recalculateDrinksCoupons(): Promise<void> {
    const guests = await this.guestModel.find().exec();

    await this.guestModel.updateMany({}, { drinksCoupon: 0 });

    const invitedMap: { [key: string]: number } = {};

    guests.forEach((guest) => {
      if (guest.invitedFrom) {
        invitedMap[guest.invitedFrom] =
          (invitedMap[guest.invitedFrom] || 0) + 1;
      }
    });

    for (const [name, count] of Object.entries(invitedMap)) {
      await this.guestModel.updateMany(
        { name },
        { $set: { drinksCoupon: count } },
      );
    }
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
