import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { GuestsController } from './guests.controller.js';
import { GuestsService } from './guests.service.js';
import { Guest, GuestSchema } from './schemas/guests.schema/guests.schema.js';
import { DrinksCouponService } from './services/drinks-coupon.service.js';
import { GuestAttendanceService } from './services/guest-attendance.service.js';
import { GuestCrudService } from './services/guest-crud.service.js';
import { GuestDiscountsService } from './services/guest-discounts.service.js';
import { GuestStatisticsService } from './services/guest-statistics.service.js';
import { GuestStatusService } from './services/guest-status.service.js';
import { GuestValidationService } from './services/guest-validation.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Guest.name, schema: GuestSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '1h';
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expiresIn as unknown as number,
          },
        };
      },
    }),
    ConfigModule,
  ],
  providers: [
    GuestsService,
    GuestCrudService,
    GuestAttendanceService,
    GuestStatusService,
    GuestStatisticsService,
    GuestDiscountsService,
    DrinksCouponService,
    GuestValidationService,
  ],
  controllers: [GuestsController],
})
export class GuestsModule {}
