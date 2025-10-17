import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

import { CreateGuestDto } from '../dto/create-guest.dto/create-guest.dto.js';
import {
  Guest,
  GuestDocument,
} from '../schemas/guests.schema/guests.schema.js';

@Injectable()
export class GuestCrudService {
  constructor(
    @InjectModel(Guest.name) private readonly guestModel: Model<GuestDocument>,
  ) {}

  async findAll(): Promise<GuestDocument[]> {
    return this.guestModel.find().exec();
  }

  async findById(id: string): Promise<GuestDocument> {
    const guest = await this.guestModel.findById(id).exec();
    if (!guest) {
      throw new NotFoundException(`Guest with ID "${id}" not found`);
    }
    return guest;
  }

  async findByName(name: string): Promise<GuestDocument | null> {
    return this.guestModel.findOne({ name }).exec();
  }

  async findByNameOrThrow(name: string): Promise<GuestDocument> {
    const guest = await this.findByName(name);
    if (!guest) {
      throw new NotFoundException(`Guest with name "${name}" not found`);
    }
    return guest;
  }

  async create(
    createGuestDto: CreateGuestDto,
    userRole: string,
    userName: string,
  ): Promise<Document<unknown, Guest> & GuestDocument & { __v: number }> {
    if (userRole === 'user') {
      createGuestDto.attended = 'Yes';
    }

    const guestData = {
      ...createGuestDto,
      addedBy: userName,
      attendedAt: createGuestDto.attended === 'Yes' ? new Date() : null,
    };

    const createdGuest = new this.guestModel(guestData);
    return createdGuest.save();
  }

  async delete(guest: GuestDocument): Promise<void> {
    await guest.deleteOne();
  }

  async save(guest: GuestDocument): Promise<GuestDocument> {
    return guest.save();
  }
}
