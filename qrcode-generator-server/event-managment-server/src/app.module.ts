import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminController } from './admin/admin.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { BpplistModule } from './bpplist/bpplist.module.js';
import { GuestsModule } from './guests/guests.module.js';
import { MembersModule } from './members/members.module.js';
import { UsersModule } from './users/users.module.js';

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
