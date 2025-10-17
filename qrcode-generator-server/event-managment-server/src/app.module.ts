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
        // Connection pooling and performance optimizations
        maxPoolSize: 50, // Maximum number of connections in the pool
        minPoolSize: 10, // Minimum number of connections in the pool
        serverSelectionTimeoutMS: 5000, // Timeout for server selection
        socketTimeoutMS: 45000, // Socket timeout
        family: 4, // Use IPv4, skip trying IPv6
        // Compression for better network performance
        compressors: ['zlib'],
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
