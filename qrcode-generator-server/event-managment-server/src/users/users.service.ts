import { Injectable } from '@nestjs/common';

import { User, UserDocument } from './schemas/users.schema/users.schema.js';
import {
  UserCrudService,
  CreateUserDto,
} from './services/user-crud.service.js';
import { UserValidationService } from './services/user-validation.service.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly crudService: UserCrudService,
    private readonly validationService: UserValidationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.validationService.validateCreateUser(createUserDto);
    return this.crudService.create(createUserDto);
  }

  async findOne(username: string): Promise<UserDocument | undefined> {
    const user = await this.crudService.findOne(username);
    return user || undefined;
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.crudService.findById(userId);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.crudService.findAll();
  }

  async deleteUser(userId: string): Promise<void> {
    return this.crudService.deleteUser(userId);
  }
}
