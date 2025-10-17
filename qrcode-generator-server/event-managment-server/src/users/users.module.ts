import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './schemas/users.schema/users.schema.js';
import { UserCrudService } from './services/user-crud.service.js';
import { UserValidationService } from './services/user-validation.service.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService, UserCrudService, UserValidationService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
