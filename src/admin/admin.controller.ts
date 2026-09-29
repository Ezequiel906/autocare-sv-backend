import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateVehicleDto } from '../vehicles/dto/update-vehicle.dto';
import { AdminService } from './admin.service';
import { CreateAdminServiceDto } from './dto/create-admin-service.dto';
import { GetAdminAppointmentsDto } from './dto/get-admin-appointments.dto';
import { GetAdminCustomersDto } from './dto/get-admin-customers.dto';
import { GetAdminServiceHistoryDto } from './dto/get-admin-service-history.dto';
import { GetAdminServicesDto } from './dto/get-admin-services.dto';
import { GetAdminVehiclesDto } from './dto/get-admin-vehicles.dto';
import { UpdateAdminAppointmentWorkDto } from './dto/update-admin-appointment-work.dto';
import { UpdateAdminCustomerDto } from './dto/update-admin-customer.dto';
import { UpdateAdminServiceDto } from './dto/update-admin-service.dto';
import { UpdateAdminSettingsDto } from './dto/update-admin-settings.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  updateSettings(@Body() data: UpdateAdminSettingsDto) {
    return this.adminService.updateSettings(data);
  }

  @Get('appointments')
  getAppointments(@Query() query: GetAdminAppointmentsDto) {
    return this.adminService.getAppointments(query);
  }

  @Get('appointments/:id')
  getAppointment(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getAppointment(id);
  }

  @Patch('appointments/:id/work-data')
  updateAppointmentWorkData(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAdminAppointmentWorkDto,
  ) {
    return this.adminService.updateAppointmentWorkData(id, data);
  }

  @Get('vehicles')
  getVehicles(@Query() query: GetAdminVehiclesDto) {
    return this.adminService.getVehicles(query);
  }

  @Get('vehicles/:id')
  getVehicle(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getVehicle(id);
  }

  @Patch('vehicles/:id')
  updateVehicle(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateVehicleDto,
  ) {
    return this.adminService.updateVehicle(id, data);
  }

  @Delete('vehicles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeVehicle(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeVehicle(id);
  }

  @Get('customers')
  getCustomers(@Query() query: GetAdminCustomersDto) {
    return this.adminService.getCustomers(query.search);
  }

  @Get('customers/:id')
  getCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCustomer(id);
  }

  @Patch('customers/:id')
  updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAdminCustomerDto,
  ) {
    return this.adminService.updateCustomer(id, data);
  }

  @Get('services')
  getServices(@Query() query: GetAdminServicesDto) {
    return this.adminService.getServices(query);
  }

  @Get('services/:id')
  getService(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getService(id);
  }

  @Post('services')
  createService(@Body() data: CreateAdminServiceDto) {
    return this.adminService.createService(data);
  }

  @Patch('services/:id')
  updateService(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAdminServiceDto,
  ) {
    return this.adminService.updateService(id, data);
  }

  @Get('service-history')
  getServiceHistory(@Query() query: GetAdminServiceHistoryDto) {
    return this.adminService.getServiceHistory(query);
  }

  @Get('service-history/:id')
  getServiceHistoryRecord(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getServiceHistoryRecord(id);
  }
}
