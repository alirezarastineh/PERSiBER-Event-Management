import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminController } from './admin/admin.controller';
import { AuthModule } from './auth/auth.module';
import { BpplistModule } from './bpplist/bpplist.module';
import { GuestsModule } from './guests/guests.module';
import { MembersModule } from './members/members.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    GuestsModule,
    MembersModule,
    BpplistModule,
  ],
  controllers: [AdminController],
})
export class AppModule {}
