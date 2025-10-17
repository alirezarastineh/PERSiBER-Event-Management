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

import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles/roles.guard.js';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface.js';

import { CreateGuestDto } from './dto/create-guest.dto/create-guest.dto.js';
import { UpdateGuestDto } from './dto/update-guest.dto/update-guest.dto.js';
import { GuestsService } from './guests.service.js';
import { GuestDocument } from './schemas/guests.schema/guests.schema.js';

@Controller('guests')
@UseGuards(JwtAuthGuard)
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Get()
  async getAllGuests(@Request() req: RequestWithUser): Promise<{
    guests: GuestDocument[];
    statistics: {
      attendedCount: number;
      totalCount: number;
      studentsCount?: number;
      ladiesCount?: number;
      drinksCouponsCount?: number;
      freeEntryCount?: number;
    };
  }> {
    const userRole = req.user.role;
    const { guests, statistics } = await this.guestsService.findAll(userRole);
    return { guests, statistics };
  }

  @Get('by-id/:id')
  async getGuestById(@Param('id') id: string): Promise<GuestDocument> {
    return this.guestsService.findById(id);
  }

  @Get('by-name/:name')
  async getGuestByName(@Param('name') name: string): Promise<GuestDocument> {
    return this.guestsService.findByName(name);
  }

  @Post('add')
  @Roles('admin', 'master', 'user')
  @UseGuards(RolesGuard)
  async createGuest(
    @Body() createGuestDto: CreateGuestDto,
    @Request() req: RequestWithUser,
  ): Promise<GuestDocument> {
    const userRole = req.user.role;
    const userName = req.user.username;
    return this.guestsService.create(createGuestDto, userRole, userName);
  }

  @Post('find-or-create')
  async findOrCreateGuest(
    @Body('name') name: string,
    @Request() req: RequestWithUser,
  ): Promise<GuestDocument> {
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
    @Request() req: RequestWithUser,
  ): Promise<GuestDocument> {
    const userRole = req.user.role;
    const userName = req.user.username;
    return this.guestsService.update(
      guestId,
      updateGuestDto,
      userRole,
      userName,
    );
  }

  @Patch(':id/attended')
  async updateAttendedStatus(
    @Param('id') guestId: string,
    @Body('attended') attended: string,
    @Request() req: RequestWithUser,
  ): Promise<GuestDocument> {
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
    @Request() req: RequestWithUser,
  ): Promise<GuestDocument> {
    const userRole = req.user.role;
    const userName = req.user.username;
    return this.guestsService.updateStudentStatus(
      guestId,
      isStudent,
      untilWhen,
      userRole,
      userName,
    );
  }

  @Patch(':id/lady')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async updateLadyStatus(
    @Param('id') guestId: string,
    @Body('isLady') isLady: boolean,
    @Request() req: RequestWithUser,
  ): Promise<GuestDocument> {
    const userRole = req.user.role;
    const userName = req.user.username;
    return this.guestsService.updateLadyStatus(
      guestId,
      isLady,
      userRole,
      userName,
    );
  }

  @Patch(':id/drinks-coupon')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async adjustDrinksCoupon(
    @Param('id') guestId: string,
    @Body('adjustment') adjustment: number,
    @Request() req: RequestWithUser,
  ): Promise<GuestDocument> {
    const userRole = req.user.role;
    const userName = req.user.username;
    return this.guestsService.adjustDrinksCoupon(
      guestId,
      adjustment,
      userRole,
      userName,
    );
  }

  @Patch('discounts/toggle-student')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async toggleStudentDiscount(
    @Body('active') active: boolean,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userRole = req.user.role;
    const userName = req.user.username;
    this.guestsService.toggleStudentDiscount(active, userRole, userName);
    return {
      message: `Student discount is now ${active ? 'active' : 'inactive'}`,
    };
  }

  @Patch('discounts/toggle-lady')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async toggleLadyDiscount(
    @Body('active') active: boolean,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userRole = req.user.role;
    const userName = req.user.username;
    this.guestsService.toggleLadyDiscount(active, userRole, userName);
    return {
      message: `Lady discount is now ${active ? 'active' : 'inactive'}`,
    };
  }

  @Delete(':id')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async deleteGuest(
    @Param('id') guestId: string,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userRole = req.user.role;
    const userName = req.user.username;
    await this.guestsService.delete(guestId, userRole, userName);
    return {
      message: `Guest ${guestId} deleted successfully`,
    };
  }
}
