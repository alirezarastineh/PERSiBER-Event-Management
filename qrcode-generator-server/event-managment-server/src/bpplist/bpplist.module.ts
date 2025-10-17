import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { BpplistController } from './bpplist.controller.js';
import { BpplistService } from './bpplist.service.js';
import {
  Bpplist,
  BpplistSchema,
} from './schemas/bpplist.schema/bpplist.schema.js';
import { BpplistAttendanceService } from './services/bpplist-attendance.service.js';
import { BpplistCrudService } from './services/bpplist-crud.service.js';
import { BpplistInvitationService } from './services/bpplist-invitation.service.js';
import { BpplistStatisticsService } from './services/bpplist-statistics.service.js';
import { BpplistStatusService } from './services/bpplist-status.service.js';
import { BpplistValidationService } from './services/bpplist-validation.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bpplist.name, schema: BpplistSchema }]),
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
