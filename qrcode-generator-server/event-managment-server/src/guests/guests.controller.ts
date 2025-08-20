import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';

import { CreateGuestDto } from './dto/create-guest.dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto/update-guest.dto';
import { GuestsService } from './guests.service';

@Controller('guests')
@UseGuards(JwtAuthGuard)
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Get()
  async getAllGuests(@Request() req: any) {
    const userRole = req.user.role;
    const { guests, statistics } = await this.guestsService.findAll(userRole);
    return { guests, statistics };
  }

  @Get('by-id/:id')
  async getGuestById(@Param('id') id: string) {
    return this.guestsService.findById(id);
  }

  @Get('by-name/:name')
  async getGuestByName(@Param('name') name: string) {
    return this.guestsService.findByName(name);
  }

  @Post('add')
  @Roles('admin', 'master', 'user')
  @UseGuards(RolesGuard)
  async createGuest(
    @Body() createGuestDto: CreateGuestDto,
    @Request() req: any,
  ) {
    const userRole = req.user.role;
    const userName = req.user.username;
    return this.guestsService.create(createGuestDto, userRole, userName);
  }

  @Post('find-or-create')
  async findOrCreateGuest(@Body('name') name: string, @Request() req: any) {
    const userRole = req.user.role;
    const userName = req.user.username;
    return this.guestsService.findOrCreateGuest(name, userRole, userName);
  }

  @Patch(':id')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateGuest(
    @Param('id') guestId: string,
    @Body() updateGuestDto: UpdateGuestDto,
  ) {
    return this.guestsService.update(guestId, updateGuestDto);
  }

  @Patch(':id/attended')
  async updateAttendedStatus(
    @Param('id') guestId: string,
    @Body('attended') attended: string,
    @Request() req: any,
  ) {
    const userRole = req.user.role;
    return this.guestsService.updateAttended(guestId, attended, userRole);
  }

  @Patch(':id/student')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateStudentStatus(
    @Param('id') guestId: string,
    @Body('isStudent') isStudent: boolean,
    @Body('untilWhen') untilWhen: Date | null,
  ) {
    return this.guestsService.updateStudentStatus(
      guestId,
      isStudent,
      untilWhen,
    );
  }

  @Patch(':id/lady')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateLadyStatus(
    @Param('id') guestId: string,
    @Body('isLady') isLady: boolean,
  ) {
    return this.guestsService.updateLadyStatus(guestId, isLady);
  }

  @Patch(':id/drinks-coupon')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async adjustDrinksCoupon(
    @Param('id') guestId: string,
    @Body('adjustment') adjustment: number,
  ) {
    return this.guestsService.adjustDrinksCoupon(guestId, adjustment);
  }

  @Patch('discounts/toggle-student')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async toggleStudentDiscount(@Body('active') active: boolean) {
    this.guestsService.toggleStudentDiscount(active);
    return {
      message: `Student discount is now ${active ? 'active' : 'inactive'}`,
    };
  }

  @Patch('discounts/toggle-lady')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async toggleLadyDiscount(@Body('active') active: boolean) {
    this.guestsService.toggleLadyDiscount(active);
    return {
      message: `Lady discount is now ${active ? 'active' : 'inactive'}`,
    };
  }

  @Delete(':id')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async deleteGuest(@Param('id') guestId: string) {
    return this.guestsService.delete(guestId);
  }
}
