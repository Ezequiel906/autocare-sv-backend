import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServiceHistoryService } from './service-history.service';

type AuthenticatedRequest = Request & { user: { id: number } };

@Controller('service-history')
@UseGuards(JwtAuthGuard)
export class ServiceHistoryController {
  constructor(
    private readonly serviceHistoryService: ServiceHistoryService,
  ) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.serviceHistoryService.findAll(request.user.id);
  }
}
