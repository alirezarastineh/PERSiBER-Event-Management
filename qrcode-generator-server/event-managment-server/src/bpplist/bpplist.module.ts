import { Module } from '@nestjs/common';
import { BpplistController } from './bpplist.controller';
import { BpplistService } from './bpplist.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Bpplist,
  BpplistSchema,
} from './schemas/bpplist.schema/bpplist.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BpplistCrudService } from './services/bpplist-crud.service';
import { BpplistValidationService } from './services/bpplist-validation.service';
import { BpplistInvitationService } from './services/bpplist-invitation.service';
import { BpplistStatisticsService } from './services/bpplist-statistics.service';
import { BpplistAttendanceService } from './services/bpplist-attendance.service';
import { BpplistStatusService } from './services/bpplist-status.service';

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
