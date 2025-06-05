import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from './schemas/members.schema/members.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MemberCrudService } from './services/member-crud.service';
import { MemberValidationService } from './services/member-validation.service';
import { MemberInvitationService } from './services/member-invitation.service';
import { MemberStatisticsService } from './services/member-statistics.service';
import { MemberAttendanceService } from './services/member-attendance.service';
import { MemberStatusService } from './services/member-status.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
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
