import { Injectable, Logger } from '@nestjs/common';

import { CreateGuestDto } from './dto/create-guest.dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto/update-guest.dto';
import { GuestDocument } from './schemas/guests.schema/guests.schema';
import { DrinksCouponService } from './services/drinks-coupon.service';
import { GuestAttendanceService } from './services/guest-attendance.service';
import { GuestCrudService } from './services/guest-crud.service';
import { GuestDiscountsService } from './services/guest-discounts.service';
import { GuestStatisticsService } from './services/guest-statistics.service';
import { GuestStatusService } from './services/guest-status.service';
import { GuestValidationService } from './services/guest-validation.service';

@Injectable()
export class GuestsService {
  private readonly logger = new Logger(GuestsService.name);
  constructor(
    private readonly crudService: GuestCrudService,
    private readonly attendanceService: GuestAttendanceService,
    private readonly statusService: GuestStatusService,
    private readonly statisticsService: GuestStatisticsService,
    private readonly discountsService: GuestDiscountsService,
    private readonly drinksCouponService: DrinksCouponService,
    private readonly validationService: GuestValidationService,
  ) {}

  async findAll(userRole: string): Promise<{
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
    const guests = await this.crudService.findAll();
    const statistics = await this.statisticsService.getAttendanceStatistics(
      userRole,
      this.discountsService.getStudentDiscountStatus(),
      this.discountsService.getLadyDiscountStatus(),
    );
    return { guests, statistics };
  }

  async create(
    createGuestDto: CreateGuestDto,
    userRole: string,
    userName: string,
  ): Promise<GuestDocument> {
    return this.crudService.create(createGuestDto, userRole, userName);
  }

  async findOrCreateGuest(
    name: string,
    userRole: string,
    userName: string,
  ): Promise<GuestDocument> {
    return this.attendanceService.findOrCreateGuest(name, userRole, userName);
  }

  async delete(id: string, userRole: string, userName: string): Promise<void> {
    const guest = await this.crudService.findById(id);

    this.logger.log(
      `Guest ${guest.name} (${id}) deleted by ${userName} (${userRole})`,
    );

    if (guest.invitedFrom) {
      await this.drinksCouponService.decrementDrinksCoupon(guest.invitedFrom);
    }

    await this.crudService.delete(guest);
    await this.drinksCouponService.recalculateDrinksCoupons(
      this.discountsService.getStudentDiscountStatus(),
      this.discountsService.getLadyDiscountStatus(),
    );
  }

  async update(
    id: string,
    updateGuestDto: UpdateGuestDto,
    userRole: string,
    userName: string,
  ): Promise<GuestDocument> {
    const guest = await this.crudService.findById(id);
    const previousInvitedFrom = guest.invitedFrom;

    this.logger.log(
      `Guest ${guest.name} (${id}) updated by ${userName} (${userRole})`,
    );

    await this.validationService.validateInviter(
      updateGuestDto.invitedFrom,
      guest.name,
    );
    await this.drinksCouponService.handleInviterChange(
      updateGuestDto.invitedFrom,
      previousInvitedFrom,
    );

    Object.assign(guest, updateGuestDto);

    this.validationService.handleAttendanceTimestamp(
      guest,
      updateGuestDto.attended,
    );

    await this.crudService.save(guest);

    if (
      updateGuestDto.isStudent !== undefined ||
      updateGuestDto.isLady !== undefined
    ) {
      await this.discountsService.applyDiscounts(guest);
    }

    return guest;
  }

  async updateAttended(
    id: string,
    attended: string,
    userRole: string,
  ): Promise<GuestDocument> {
    return this.attendanceService.updateAttended(id, attended, userRole);
  }

  async updateStudentStatus(
    id: string,
    isStudent: boolean,
    untilWhen: Date | null,
    userRole: string,
    userName: string,
  ): Promise<GuestDocument> {
    this.logger.log(
      `Student status for guest ${id} set to ${isStudent} by ${userName} (${userRole})`,
    );
    return this.statusService.updateStudentStatus(id, isStudent, untilWhen);
  }

  async updateLadyStatus(
    id: string,
    isLady: boolean,
    userRole: string,
    userName: string,
  ): Promise<GuestDocument> {
    this.logger.log(
      `Lady status for guest ${id} set to ${isLady} by ${userName} (${userRole})`,
    );
    return this.statusService.updateLadyStatus(id, isLady);
  }

  async findByName(name: string): Promise<GuestDocument> {
    return this.crudService.findByNameOrThrow(name);
  }

  async findById(id: string): Promise<GuestDocument> {
    return this.crudService.findById(id);
  }

  async getStatistics(): Promise<{ attended: number; total: number }> {
    return this.statisticsService.getBasicStatistics();
  }

  toggleStudentDiscount(
    active: boolean,
    userRole: string,
    userName: string,
  ): void {
    this.logger.log(
      `Student discount ${active ? 'enabled' : 'disabled'} by ${userName} (${userRole})`,
    );
    this.discountsService.toggleStudentDiscount(active);
  }

  toggleLadyDiscount(
    active: boolean,
    userRole: string,
    userName: string,
  ): void {
    this.logger.log(
      `Lady discount ${active ? 'enabled' : 'disabled'} by ${userName} (${userRole})`,
    );
    this.discountsService.toggleLadyDiscount(active);
  }

  async getAttendanceStatistics(userRole?: string): Promise<{
    attendedCount: number;
    totalCount: number;
    studentsCount?: number;
    ladiesCount?: number;
    drinksCouponsCount?: number;
    freeEntryCount?: number;
    studentDiscountActive?: boolean;
    ladyDiscountActive?: boolean;
  }> {
    return this.statisticsService.getAttendanceStatistics(
      userRole,
      this.discountsService.getStudentDiscountStatus(),
      this.discountsService.getLadyDiscountStatus(),
    );
  }

  async adjustDrinksCoupon(
    id: string,
    adjustment: number,
    userRole: string,
    userName: string,
  ): Promise<GuestDocument> {
    this.logger.log(
      `Drinks coupon for guest ${id} adjusted by ${adjustment} by ${userName} (${userRole})`,
    );
    return this.drinksCouponService.adjustDrinksCoupon(id, adjustment);
  }
}
