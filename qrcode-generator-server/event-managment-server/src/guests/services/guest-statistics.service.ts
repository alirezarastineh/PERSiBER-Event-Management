import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guest, GuestDocument } from '../schemas/guests.schema/guests.schema';

@Injectable()
export class GuestStatisticsService {
  constructor(
    @InjectModel(Guest.name) private readonly guestModel: Model<GuestDocument>,
  ) {}

  async getBasicStatistics(): Promise<{ attended: number; total: number }> {
    const total = await this.guestModel.countDocuments().exec();
    const attended = await this.guestModel
      .countDocuments({ attended: 'Yes' })
      .exec();
    return { attended, total };
  }

  async getAttendanceStatistics(
    userRole?: string,
    studentDiscountActive?: boolean,
    ladyDiscountActive?: boolean,
  ): Promise<{
    attendedCount: number;
    totalCount: number;
    studentsCount?: number;
    ladiesCount?: number;
    drinksCouponsCount?: number;
    freeEntryCount?: number;
    studentDiscountActive?: boolean;
    ladyDiscountActive?: boolean;
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
        studentDiscountActive,
        ladyDiscountActive,
      };
    }

    return { attendedCount, totalCount };
  }
}
