import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Member, MemberSchema } from './schemas/members.schema/members.schema';
import { MemberAttendanceService } from './services/member-attendance.service';
import { MemberCrudService } from './services/member-crud.service';
import { MemberInvitationService } from './services/member-invitation.service';
import { MemberStatisticsService } from './services/member-statistics.service';
import { MemberStatusService } from './services/member-status.service';
import { MemberValidationService } from './services/member-validation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
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
    MembersService,
    MemberCrudService,
    MemberValidationService,
    MemberInvitationService,
    MemberStatisticsService,
    MemberAttendanceService,
    MemberStatusService,
  ],
  controllers: [MembersController],
})
export class MembersModule {}
