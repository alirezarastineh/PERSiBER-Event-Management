import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';

import { CreateBpplistDto } from '../dto/create-bpplist.dto/create-bpplist.dto';
import {
  Bpplist,
  BpplistDocument,
} from '../schemas/bpplist.schema/bpplist.schema';

@Injectable()
export class BpplistCrudService {
  constructor(
    @InjectModel(Bpplist.name)
    private readonly bpplistModel: Model<BpplistDocument>,
  ) {}

  async findAll(): Promise<BpplistDocument[]> {
    return this.bpplistModel.find().exec();
  }

  async findById(id: string): Promise<BpplistDocument> {
    const bpplistItem = await this.bpplistModel.findById(id).exec();
    if (!bpplistItem) {
      throw new NotFoundException(`BBP list item with ID "${id}" not found`);
    }
    return bpplistItem;
  }

  async findByName(name: string): Promise<BpplistDocument | null> {
    return this.bpplistModel.findOne({ name }).exec();
  }

  async create(createBpplistDto: CreateBpplistDto): Promise<BpplistDocument> {
    const bpplistData = {
      ...createBpplistDto,
      attendedAt: createBpplistDto.attended === 'Yes' ? new Date() : null,
    };

    const createdBpplist = new this.bpplistModel(bpplistData);
    return createdBpplist.save();
  }

  async delete(bpplistItem: BpplistDocument): Promise<void> {
    await bpplistItem.deleteOne();
  }

  async save(bpplistItem: BpplistDocument): Promise<BpplistDocument> {
    return bpplistItem.save();
  }

  async countDocuments(
    filter: FilterQuery<BpplistDocument> = {},
  ): Promise<number> {
    return this.bpplistModel.countDocuments(filter).exec();
  }

  async updateMany(
    filter: FilterQuery<BpplistDocument>,
    update: UpdateQuery<BpplistDocument>,
  ): Promise<void> {
    await this.bpplistModel.updateMany(filter, update);
  }
}
