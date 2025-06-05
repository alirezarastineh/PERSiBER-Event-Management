import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Guest, GuestSchema } from './schemas/guests.schema/guests.schema';
import { GuestsService } from './guests.service';
import { GuestsController } from './guests.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GuestStatisticsService } from './services/guest-statistics.service';
import { GuestDiscountsService } from './services/guest-discounts.service';
import { DrinksCouponService } from './services/drinks-coupon.service';
import { GuestValidationService } from './services/guest-validation.service';
import { GuestCrudService } from './services/guest-crud.service';
import { GuestAttendanceService } from './services/guest-attendance.service';
import { GuestStatusService } from './services/guest-status.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Guest.name, schema: GuestSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
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
