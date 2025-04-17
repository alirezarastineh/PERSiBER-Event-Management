import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Bpplist,
  BpplistDocument,
} from './schemas/bpplist.schema/bpplist.schema';
import { Model } from 'mongoose';
import { CreateBpplistDto } from './dto/create-bpplist.dto/create-bpplist.dto';
import { UpdateBpplistDto } from './dto/update-bpplist.dto/update-bpplist.dto';

@Injectable()
export class BpplistService {
  constructor(
    @InjectModel(Bpplist.name)
    private readonly bpplistModel: Model<BpplistDocument>,
  ) {}

  async findAll(): Promise<{
    bpplist: Bpplist[];
    statistics: { attendedCount: number; totalCount: number };
  }> {
    const bpplist = await this.bpplistModel.find().exec();
    await this.recalculateMembersInvited();
    const statistics = await this.getAttendanceStatistics();
    return { bpplist, statistics };
  }

  async create(createBpplistDto: CreateBpplistDto): Promise<Bpplist> {
    if (
      createBpplistDto.organizer &&
      !['Kourosh', 'Sobhan', 'Mutual'].includes(createBpplistDto.organizer)
    ) {
      throw new BadRequestException(
        'Organizer must be either "Kourosh", "Sobhan", or "Mutual".',
      );
    }

    if (
      createBpplistDto.invitedFrom &&
      createBpplistDto.invitedFrom === createBpplistDto.name
    ) {
      throw new BadRequestException('A member cannot invite themselves.');
    }

    const createdBpplist = new this.bpplistModel(createBpplistDto);
    const bpplistItem = await createdBpplist.save();

    if (createBpplistDto.invitedFrom) {
      await this.incrementMembersInvited(createBpplistDto.invitedFrom);
    }

    return bpplistItem;
  }

  async delete(id: string): Promise<void> {
    const bpplistItem = await this.bpplistModel.findById(id).exec();
    if (!bpplistItem) {
      throw new NotFoundException(`BBP list item with ID "${id}" not found`);
    }

    if (bpplistItem.invitedFrom) {
      await this.decrementMembersInvited(bpplistItem.invitedFrom);
    }

    await bpplistItem.deleteOne();
  }

  async update(
    id: string,
    updateBpplistDto: UpdateBpplistDto,
  ): Promise<Bpplist> {
    const bpplistItem = await this.bpplistModel.findById(id).exec();
    if (!bpplistItem) {
      throw new NotFoundException(`BBP list item with ID "${id}" not found`);
    }

    if (
      updateBpplistDto.organizer &&
      !['Kourosh', 'Sobhan', 'Mutual'].includes(updateBpplistDto.organizer)
    ) {
      throw new BadRequestException(
        'Organizer must be either "Kourosh", "Sobhan", or "Mutual".',
      );
    }

    if (
      updateBpplistDto.invitedFrom &&
      updateBpplistDto.invitedFrom === bpplistItem.name
    ) {
      throw new BadRequestException('A member cannot invite themselves.');
    }

    const previousInvitedFrom = bpplistItem.invitedFrom;

    if (
      updateBpplistDto.invitedFrom &&
      updateBpplistDto.invitedFrom !== bpplistItem.invitedFrom
    ) {
      await this.incrementMembersInvited(updateBpplistDto.invitedFrom);
      if (previousInvitedFrom) {
        await this.decrementMembersInvited(previousInvitedFrom);
      }
    }

    if (!updateBpplistDto.invitedFrom && previousInvitedFrom) {
      await this.decrementMembersInvited(previousInvitedFrom);
    }

    Object.assign(bpplistItem, updateBpplistDto);
    return bpplistItem.save();
  }

  async updateAttended(id: string, attended: string): Promise<Bpplist> {
    const bpplistItem = await this.bpplistModel.findById(id).exec();
    if (!bpplistItem) {
      throw new NotFoundException(`BBP list item with ID "${id}" not found`);
    }
    bpplistItem.attended = attended;
    await bpplistItem.save();

    await this.getAttendanceStatistics();

    return bpplistItem;
  }

  async updateHasLeft(id: string, hasLeft: boolean): Promise<Bpplist> {
    const bpplistItem = await this.bpplistModel.findById(id).exec();
    if (!bpplistItem) {
      throw new NotFoundException(`BBP list item with ID "${id}" not found`);
    }
    bpplistItem.hasLeft = hasLeft;
    return bpplistItem.save();
  }

  async updateStudentStatus(
    id: string,
    isStudent: boolean,
    untilWhen: Date | null,
  ): Promise<Bpplist> {
    const bpplistItem = await this.bpplistModel.findById(id).exec();
    if (!bpplistItem) {
      throw new NotFoundException(`BBP list item with ID "${id}" not found`);
    }
    bpplistItem.isStudent = isStudent;
    bpplistItem.untilWhen = isStudent ? untilWhen : null;
    return bpplistItem.save();
  }

  async getStatistics(): Promise<{ attended: number; total: number }> {
    const total = await this.bpplistModel.countDocuments().exec();
    const attended = await this.bpplistModel
      .countDocuments({ attended: 'Yes' })
      .exec();
    return { attended, total };
  }

  private async incrementMembersInvited(inviterName: string): Promise<void> {
    const inviter = await this.bpplistModel
      .findOne({ name: inviterName })
      .exec();
    if (inviter) {
      inviter.membersInvited += 1;
      await inviter.save();
    }
  }

  private async decrementMembersInvited(inviterName: string): Promise<void> {
    const inviter = await this.bpplistModel
      .findOne({ name: inviterName })
      .exec();
    if (inviter) {
      inviter.membersInvited = Math.max(0, inviter.membersInvited - 1);
      await inviter.save();
    }
  }

  private async recalculateMembersInvited(): Promise<void> {
    const bpplist = await this.bpplistModel.find().exec();

    await this.bpplistModel.updateMany({}, { membersInvited: 0 });

    const invitedMap: { [key: string]: number } = {};

    bpplist.forEach((item) => {
      if (item.invitedFrom) {
        invitedMap[item.invitedFrom] = (invitedMap[item.invitedFrom] || 0) + 1;
      }
    });

    for (const [name, count] of Object.entries(invitedMap)) {
      await this.bpplistModel.updateMany(
        { name },
        { $set: { membersInvited: count } },
      );
    }
  }

  async getAttendanceStatistics(): Promise<{
    attendedCount: number;
    totalCount: number;
  }> {
    const totalCount = await this.bpplistModel.countDocuments().exec();
    const attendedCount = await this.bpplistModel
      .countDocuments({ attended: 'Yes' })
      .exec();
    return { attendedCount, totalCount };
  }
}
