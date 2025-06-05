import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Member,
  MemberDocument,
} from '../schemas/members.schema/members.schema';
import { Model } from 'mongoose';
import { CreateMemberDto } from '../dto/create-member.dto/create-member.dto';

@Injectable()
export class MemberCrudService {
  constructor(
    @InjectModel(Member.name)
    private readonly memberModel: Model<MemberDocument>,
  ) {}

  async findAll(): Promise<MemberDocument[]> {
    return this.memberModel.find().exec();
  }

  async findById(id: string): Promise<MemberDocument> {
    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException(`Member with ID "${id}" not found`);
    }
    return member;
  }

  async findByName(name: string): Promise<MemberDocument | null> {
    return this.memberModel.findOne({ name }).exec();
  }

  async create(createMemberDto: CreateMemberDto): Promise<MemberDocument> {
    const memberData = {
      ...createMemberDto,
      attendedAt: createMemberDto.attended === 'Yes' ? new Date() : null,
    };

    const createdMember = new this.memberModel(memberData);
    return createdMember.save();
  }

  async delete(member: MemberDocument): Promise<void> {
    await member.deleteOne();
  }

  async save(member: MemberDocument): Promise<MemberDocument> {
    return member.save();
  }

  async countDocuments(filter: any = {}): Promise<number> {
    return this.memberModel.countDocuments(filter).exec();
  }

  async updateMany(filter: any, update: any): Promise<void> {
    await this.memberModel.updateMany(filter, update);
  }
}
