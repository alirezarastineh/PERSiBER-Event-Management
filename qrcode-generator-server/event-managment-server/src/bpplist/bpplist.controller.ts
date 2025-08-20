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
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';

import { BpplistService } from './bpplist.service';
import { CreateBpplistDto } from './dto/create-bpplist.dto/create-bpplist.dto';
import { UpdateBpplistDto } from './dto/update-bpplist.dto/update-bpplist.dto';

@Controller('bpplist')
@UseGuards(JwtAuthGuard)
export class BpplistController {
  constructor(private readonly bpplistService: BpplistService) {}

  @Get()
  async getAllBpplist() {
    const { bpplist, statistics } = await this.bpplistService.findAll();
    return { bpplist, statistics };
  }

  @Post()
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async createBpplistItem(@Body() createBpplistDto: CreateBpplistDto) {
    return this.bpplistService.create(createBpplistDto);
  }

  @Patch(':id')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateBpplistItem(
    @Param('id') itemId: string,
    @Body() updateBpplistDto: UpdateBpplistDto,
  ) {
    return this.bpplistService.update(itemId, updateBpplistDto);
  }

  @Patch(':id/attended')
  async updateAttendedStatus(
    @Param('id') itemId: string,
    @Body('attended') attended: string,
  ) {
    return this.bpplistService.updateAttended(itemId, attended);
  }

  @Patch(':id/hasLeft')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateHasLeftStatus(
    @Param('id') itemId: string,
    @Body('hasLeft') hasLeft: boolean,
  ) {
    return this.bpplistService.updateHasLeft(itemId, hasLeft);
  }

  @Patch(':id/student')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateStudentStatus(
    @Param('id') itemId: string,
    @Body('isStudent') isStudent: boolean,
    @Body('untilWhen') untilWhen: Date | null,
  ) {
    return this.bpplistService.updateStudentStatus(
      itemId,
      isStudent,
      untilWhen,
    );
  }

  @Delete(':id')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async deleteBpplistItem(@Param('id') itemId: string) {
    return this.bpplistService.delete(itemId);
  }
}
