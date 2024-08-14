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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard/jwt-auth.guard';
import { MembersService } from './members.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { CreateMemberDto } from './dto/create-member.dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto/update-member.dto';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async getAllMembers() {
    const { members, statistics } = await this.membersService.findAll();
    return { members, statistics };
  }

  @Post()
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async createMember(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Patch(':id')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateMember(
    @Param('id') memberId: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.update(memberId, updateMemberDto);
  }

  @Patch(':id/attended')
  async updateAttendedStatus(
    @Param('id') memberId: string,
    @Body('attended') attended: string,
  ) {
    return this.membersService.updateAttended(memberId, attended);
  }

  @Patch(':id/hasLeft')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateHasLeftStatus(
    @Param('id') memberId: string,
    @Body('hasLeft') hasLeft: boolean,
  ) {
    return this.membersService.updateHasLeft(memberId, hasLeft);
  }

  @Patch(':id/student')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateStudentStatus(
    @Param('id') memberId: string,
    @Body('isStudent') isStudent: boolean,
    @Body('untilWhen') untilWhen: Date | null,
  ) {
    return this.membersService.updateStudentStatus(
      memberId,
      isStudent,
      untilWhen,
    );
  }

  @Delete(':id')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async deleteMember(@Param('id') memberId: string) {
    return this.membersService.delete(memberId);
  }
}
