import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // Admin/Supervisor can list staff (e.g. to pick a technician for assignment).
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Get()
  async findAll(@Query('role') role?: UserRole, @Query('search') search?: string) {
    const all = await this.users.findAll();
    let filtered = role ? all.filter((u) => u.role === role) : all;
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    // Never expose password hashes.
    return filtered.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
    }));
  }
}
