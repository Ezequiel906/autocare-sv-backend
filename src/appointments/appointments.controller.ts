import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

type AuthenticatedRequest = Request & {
  user: { id: number; role: UserRole };
};

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() data: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(request.user.id, data);
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.appointmentsService.findAll(request.user.id);
  }

  @Patch(':id/cancel')
  cancel(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.appointmentsService.cancel(request.user, id);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.confirm(id);
  }

  @Patch(':id/start')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  start(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.start(id);
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.complete(id);
  }

  @Get(':id')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.appointmentsService.findOne(request.user.id, id);
  }
}
