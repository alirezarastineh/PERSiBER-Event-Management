import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    @InjectModel(Member.name)
    private readonly memberModel: Model<MemberDocument>,
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
    if (
      createMemberDto.organizer &&
      !['Kourosh', 'Sobhan', 'Mutual'].includes(createMemberDto.organizer)
    ) {
      throw new BadRequestException(
        'Organizer must be either "Kourosh", "Sobhan", or "Mutual".',
      );
    }

    if (
      createMemberDto.invitedFrom &&
      createMemberDto.invitedFrom === createMemberDto.name
    ) {
      throw new BadRequestException('A member cannot invite themselves.');
    }

    const createdMember = new this.memberModel(createMemberDto);
    const member = await createdMember.save();

    if (createMemberDto.invitedFrom) {
      await this.incrementMembersInvited(createMemberDto.invitedFrom);
    }

    return member;
  }

  async delete(id: string): Promise<void> {
    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException(`Member with ID "${id}" not found`);
    }

    if (member.invitedFrom) {
      await this.decrementMembersInvited(member.invitedFrom);
    }

    await member.deleteOne();
  }

  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException(`Member with ID "${id}" not found`);
    }

    if (
      updateMemberDto.organizer &&
      !['Kourosh', 'Sobhan', 'Mutual'].includes(updateMemberDto.organizer)
    ) {
      throw new BadRequestException(
        'Organizer must be either "Kourosh", "Sobhan", or "Mutual".',
      );
    }

    if (
      updateMemberDto.invitedFrom &&
      updateMemberDto.invitedFrom === member.name
    ) {
      throw new BadRequestException('A member cannot invite themselves.');
    }

    const previousInvitedFrom = member.invitedFrom;

    if (
      updateMemberDto.invitedFrom &&
      updateMemberDto.invitedFrom !== member.invitedFrom
    ) {
      await this.incrementMembersInvited(updateMemberDto.invitedFrom);
      if (previousInvitedFrom) {
        await this.decrementMembersInvited(previousInvitedFrom);
      }
    }

    if (!updateMemberDto.invitedFrom && previousInvitedFrom) {
      await this.decrementMembersInvited(previousInvitedFrom);
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
    await member.save();

    await this.getAttendanceStatistics();

    return member;
  }

  async updateHasLeft(id: string, hasLeft: boolean): Promise<Member> {
    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException(`Member with ID "${id}" not found`);
    }
    member.hasLeft = hasLeft;
    return member.save();
  }

  async updateStudentStatus(
    id: string,
    isStudent: boolean,
    untilWhen: Date | null,
  ): Promise<Member> {
    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException(`Member with ID "${id}" not found`);
    }
    member.isStudent = isStudent;
    member.untilWhen = isStudent ? untilWhen : null;
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
      inviter.membersInvited = Math.max(0, inviter.membersInvited - 1);
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
