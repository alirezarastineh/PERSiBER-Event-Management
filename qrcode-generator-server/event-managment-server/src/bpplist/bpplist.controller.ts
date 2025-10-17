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

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles/roles.guard';

import { BpplistService } from './bpplist.service';
import { CreateBpplistDto } from './dto/create-bpplist.dto/create-bpplist.dto';
import { UpdateBpplistDto } from './dto/update-bpplist.dto/update-bpplist.dto';
import { Bpplist } from './schemas/bpplist.schema/bpplist.schema';

@Controller('bpplist')
@UseGuards(JwtAuthGuard)
export class BpplistController {
  constructor(private readonly bpplistService: BpplistService) {}

  @Get()
  async getAllBpplist(): Promise<{
    bpplist: Bpplist[];
    statistics: { attendedCount: number; totalCount: number };
  }> {
    const { bpplist, statistics } = await this.bpplistService.findAll();
    return { bpplist, statistics };
  }

  @Post()
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async createBpplistItem(
    @Body() createBpplistDto: CreateBpplistDto,
  ): Promise<Bpplist> {
    return this.bpplistService.create(createBpplistDto);
  }

  @Patch(':id')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateBpplistItem(
    @Param('id') itemId: string,
    @Body() updateBpplistDto: UpdateBpplistDto,
  ): Promise<Bpplist> {
    return this.bpplistService.update(itemId, updateBpplistDto);
  }

  @Patch(':id/attended')
  async updateAttendedStatus(
    @Param('id') itemId: string,
    @Body('attended') attended: string,
  ): Promise<Bpplist> {
    return this.bpplistService.updateAttended(itemId, attended);
  }

  @Patch(':id/hasLeft')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateHasLeftStatus(
    @Param('id') itemId: string,
    @Body('hasLeft') hasLeft: boolean,
  ): Promise<Bpplist> {
    return this.bpplistService.updateHasLeft(itemId, hasLeft);
  }

  @Patch(':id/student')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateStudentStatus(
    @Param('id') itemId: string,
    @Body('isStudent') isStudent: boolean,
    @Body('untilWhen') untilWhen: Date | null,
  ): Promise<Bpplist> {
    return this.bpplistService.updateStudentStatus(
      itemId,
      isStudent,
      untilWhen,
    );
  }

  @Delete(':id')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async deleteBpplistItem(@Param('id') itemId: string): Promise<void> {
    return this.bpplistService.delete(itemId);
  }
}
