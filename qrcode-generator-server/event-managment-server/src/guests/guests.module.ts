import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { GuestsController } from './guests.controller';
import { GuestsService } from './guests.service';
import { Guest, GuestSchema } from './schemas/guests.schema/guests.schema';
import { DrinksCouponService } from './services/drinks-coupon.service';
import { GuestAttendanceService } from './services/guest-attendance.service';
import { GuestCrudService } from './services/guest-crud.service';
import { GuestDiscountsService } from './services/guest-discounts.service';
import { GuestStatisticsService } from './services/guest-statistics.service';
import { GuestStatusService } from './services/guest-status.service';
import { GuestValidationService } from './services/guest-validation.service';

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
