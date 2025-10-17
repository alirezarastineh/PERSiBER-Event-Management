import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles/roles.guard.js';

import { CreateMemberDto } from './dto/create-member.dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto/update-member.dto.js';
import { MembersService } from './members.service.js';
import { Member } from './schemas/members.schema/members.schema.js';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async getAllMembers(): Promise<{
    members: Member[];
    statistics: {
      attendedCount: number;
      totalCount: number;
    };
  }> {
    const { members, statistics } = await this.membersService.findAll();
    return { members, statistics };
  }

  @Post()
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async createMember(
    @Body() createMemberDto: CreateMemberDto,
  ): Promise<Member> {
    return this.membersService.create(createMemberDto);
  }

  @Patch(':id')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateMember(
    @Param('id') memberId: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ): Promise<Member> {
    return this.membersService.update(memberId, updateMemberDto);
  }

  @Patch(':id/attended')
  async updateAttendedStatus(
    @Param('id') memberId: string,
    @Body('attended') attended: string,
  ): Promise<Member> {
    return this.membersService.updateAttended(memberId, attended);
  }

  @Patch(':id/hasLeft')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateHasLeftStatus(
    @Param('id') memberId: string,
    @Body('hasLeft') hasLeft: boolean,
  ): Promise<Member> {
    return this.membersService.updateHasLeft(memberId, hasLeft);
  }

  @Patch(':id/student')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateStudentStatus(
    @Param('id') memberId: string,
    @Body('isStudent') isStudent: boolean,
    @Body('untilWhen') untilWhen: Date | null,
  ): Promise<Member> {
    return this.membersService.updateStudentStatus(
      memberId,
      isStudent,
      untilWhen,
    );
  }

  @Delete(':id')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async deleteMember(
    @Param('id') memberId: string,
  ): Promise<{ message: string }> {
    await this.membersService.delete(memberId);
    return {
      message: `Member ${memberId} deleted successfully`,
    };
  }
}
