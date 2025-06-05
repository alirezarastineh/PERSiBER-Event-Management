import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema/users.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserCrudService } from './services/user-crud.service';
import { UserValidationService } from './services/user-validation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService, UserCrudService, UserValidationService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
