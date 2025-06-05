import { Injectable, BadRequestException } from '@nestjs/common';
import { GuestDocument } from '../schemas/guests.schema/guests.schema';
import { CreateGuestDto } from '../dto/create-guest.dto/create-guest.dto';
import { GuestCrudService } from './guest-crud.service';
import { GuestStatisticsService } from './guest-statistics.service';
import { GuestDiscountsService } from './guest-discounts.service';

@Injectable()
export class GuestAttendanceService {
  constructor(
    private readonly crudService: GuestCrudService,
    private readonly statisticsService: GuestStatisticsService,
    private readonly discountsService: GuestDiscountsService,
  ) {}

  async findOrCreateGuest(
    name: string,
    userRole: string,
    userName: string,
  ): Promise<GuestDocument> {
    let guest = await this.crudService.findByName(name);

    if (!guest) {
      const createGuestDto: CreateGuestDto = { name };
      guest = await this.crudService.create(createGuestDto, userRole, userName);
    }
    return guest;
  }

  async updateAttended(
    id: string,
    attended: string,
    userRole: string,
  ): Promise<GuestDocument> {
    const guest = await this.crudService.findById(id);

    if (guest.attended === 'Yes' && attended === 'Yes') {
      throw new BadRequestException('Guest is already attended');
    }

    guest.attended = attended;

    if (attended === 'Yes') {
      guest.attendedAt = new Date();
    } else {
      guest.attendedAt = null;
    }

    await this.crudService.save(guest);

    // Refresh statistics after attendance update
    await this.statisticsService.getAttendanceStatistics(
      userRole,
      this.discountsService.getStudentDiscountStatus(),
      this.discountsService.getLadyDiscountStatus(),
    );

    return guest;
  }
}
