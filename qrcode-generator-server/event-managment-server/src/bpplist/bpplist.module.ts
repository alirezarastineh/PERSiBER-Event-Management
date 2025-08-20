import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { BpplistController } from './bpplist.controller';
import { BpplistService } from './bpplist.service';
import {
  Bpplist,
  BpplistSchema,
} from './schemas/bpplist.schema/bpplist.schema';
import { BpplistAttendanceService } from './services/bpplist-attendance.service';
import { BpplistCrudService } from './services/bpplist-crud.service';
import { BpplistInvitationService } from './services/bpplist-invitation.service';
import { BpplistStatisticsService } from './services/bpplist-statistics.service';
import { BpplistStatusService } from './services/bpplist-status.service';
import { BpplistValidationService } from './services/bpplist-validation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bpplist.name, schema: BpplistSchema }]),
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
    BpplistService,
    BpplistCrudService,
    BpplistValidationService,
    BpplistInvitationService,
    BpplistStatisticsService,
    BpplistAttendanceService,
    BpplistStatusService,
  ],
  controllers: [BpplistController],
})
export class BpplistModule {}
