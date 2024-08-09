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
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto/update-guest.dto';

@Controller('guests')
@UseGuards(JwtAuthGuard)
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Get()
  async getAllGuests() {
    const { guests, statistics } = await this.guestsService.findAll();
    return { guests, statistics };
  }

  @Get(':name')
  async getGuestByName(@Param('name') name: string) {
    return this.guestsService.findByName(name);
  }

  @Post('add')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async createGuest(@Body() createGuestDto: CreateGuestDto) {
    return this.guestsService.create(createGuestDto);
  }

  @Post('add-paid')
  async createPaidGuest(@Body('name') name: string) {
    return this.guestsService.create({ name, alreadyPaid: true });
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
  ) {
    return this.guestsService.updateAttended(guestId, attended);
  }

  @Delete(':id')
  @Roles('admin', 'master')
  @UseGuards(RolesGuard)
  async deleteGuest(@Param('id') guestId: string) {
    return this.guestsService.delete(guestId);
  }
}
