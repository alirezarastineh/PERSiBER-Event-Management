import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { UsersService } from 'src/users/users.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Roles('admin', 'master')
  @Get('users')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Roles('admin', 'master')
  @Delete('user/:id')
  async deleteUser(@Param('id') userId: string, @Request() req) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'master' && req.user.role !== 'master') {
      throw new ForbiddenException('Admins cannot delete masters');
    }

    if (
      user.role === 'master' &&
      req.user.role === 'master' &&
      userId !== req.user.sub
    ) {
      throw new ForbiddenException('You cannot delete another master');
    }

    return this.usersService.deleteUser(userId);
  }

  @Roles('master')
  @Patch('user/:id/role')
  async updateRole(
    @Param('id') userId: string,
    @Body('role') role: string,
    @Request() req,
  ) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (role === 'master' || user.role === 'master') {
      throw new ForbiddenException(
        'You cannot assign or remove the master role',
      );
    }

    return this.authService.updateRole(userId, role);
  }
}
