import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Member,
  MemberDocument,
} from './schemas/members.schema/members.schema';
import { Model } from 'mongoose';
import { CreateMemberDto } from './dto/create-member.dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
  ) {}

  async findAll(): Promise<{
    members: Member[];
    statistics: { attendedCount: number; totalCount: number };
  }> {
    const members = await this.memberModel.find().exec();
    await this.recalculateMembersInvited();
    const statistics = await this.getAttendanceStatistics();
    return { members, statistics };
  }

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const createdMember = new this.memberModel(createMemberDto);
    const member = await createdMember.save();

    if (createMemberDto.invitedFrom) {
      await this.incrementMembersInvited(createMemberDto.invitedFrom);
    }

    return member;
  }

  async delete(id: string): Promise<void> {
    const result = await this.memberModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Member with ID "${id}" not found`);
    }
  }

  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException(`Member with ID "${id}" not found`);
    }

    if (
      updateMemberDto.invitedFrom &&
      updateMemberDto.invitedFrom !== member.invitedFrom
    ) {
      await this.incrementMembersInvited(updateMemberDto.invitedFrom);
      if (member.invitedFrom) {
        await this.decrementMembersInvited(member.invitedFrom);
      }
    }

    Object.assign(member, updateMemberDto);
    return member.save();
  }

  async updateAttended(id: string, attended: string): Promise<Member> {
    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException(`Member with ID "${id}" not found`);
    }
    member.attended = attended;
    return member.save();
  }

  async getStatistics(): Promise<{ attended: number; total: number }> {
    const total = await this.memberModel.countDocuments().exec();
    const attended = await this.memberModel
      .countDocuments({ attended: 'Yes' })
      .exec();
    return { attended, total };
  }

  private async incrementMembersInvited(inviterName: string): Promise<void> {
    const inviter = await this.memberModel
      .findOne({ name: inviterName })
      .exec();
    if (inviter) {
      inviter.membersInvited += 1;
      await inviter.save();
    }
  }

  private async decrementMembersInvited(inviterName: string): Promise<void> {
    const inviter = await this.memberModel
      .findOne({ name: inviterName })
      .exec();
    if (inviter) {
      inviter.membersInvited -= 1;
      await inviter.save();
    }
  }

  private async recalculateMembersInvited(): Promise<void> {
    const members = await this.memberModel.find().exec();

    await this.memberModel.updateMany({}, { membersInvited: 0 });

    const invitedMap: { [key: string]: number } = {};

    members.forEach((member) => {
      if (member.invitedFrom) {
        invitedMap[member.invitedFrom] =
          (invitedMap[member.invitedFrom] || 0) + 1;
      }
    });

    for (const [name, count] of Object.entries(invitedMap)) {
      await this.memberModel.updateMany(
        { name },
        { $set: { membersInvited: count } },
      );
    }
  }

  async getAttendanceStatistics(): Promise<{
    attendedCount: number;
    totalCount: number;
  }> {
    const totalCount = await this.memberModel.countDocuments().exec();
    const attendedCount = await this.memberModel
      .countDocuments({ attended: 'Yes' })
      .exec();
    return { attendedCount, totalCount };
  }
}
