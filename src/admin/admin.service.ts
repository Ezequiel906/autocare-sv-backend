import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateVehicleDto } from '../vehicles/dto/update-vehicle.dto';
import { CreateAdminServiceDto } from './dto/create-admin-service.dto';
import { UpdateAdminAppointmentWorkDto } from './dto/update-admin-appointment-work.dto';
import { UpdateAdminCustomerDto } from './dto/update-admin-customer.dto';
import { UpdateAdminServiceDto } from './dto/update-admin-service.dto';
import { UpdateAdminSettingsDto } from './dto/update-admin-settings.dto';

const globalSettingsId = 1;

const adminSettingsSelect = {
  businessName: true,
  phone: true,
  email: true,
  address: true,
  openingHours: true,
  oilChangeIntervalKm: true,
} satisfies Prisma.BusinessSettingsSelect;

type AdminAppointmentFilters = {
  date?: string;
  status?: AppointmentStatus;
  search?: string;
};

type AdminVehicleFilters = {
  search?: string;
  type?: string;
};

type AdminServiceFilters = {
  search?: string;
  category?: string;
  active?: 'true' | 'false';
};

type AdminServiceHistoryFilters = {
  search?: string;
  date?: string;
};

const adminServiceHistorySelect = {
  id: true,
  date: true,
  mileage: true,
  description: true,
  observations: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      plate: true,
      type: true,
      color: true,
    },
  },
  appointment: {
    select: {
      id: true,
      date: true,
      status: true,
      appointmentServices: {
        select: {
          price: true,
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { serviceId: 'asc' },
      },
    },
  },
} satisfies Prisma.ServiceHistorySelect;

type AdminServiceHistory = Prisma.ServiceHistoryGetPayload<{
  select: typeof adminServiceHistorySelect;
}>;

const adminServiceSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  category: true,
  price: true,
  duration: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ServiceSelect;

type AdminCatalogService = Prisma.ServiceGetPayload<{
  select: typeof adminServiceSelect;
}>;

const adminCustomerSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const adminVehicleSelect = {
  id: true,
  brand: true,
  model: true,
  year: true,
  plate: true,
  type: true,
  color: true,
  mileage: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
} satisfies Prisma.VehicleSelect;

type AdminVehicle = Prisma.VehicleGetPayload<{
  select: typeof adminVehicleSelect;
}>;

const todayAppointmentSelect = {
  id: true,
  date: true,
  status: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      plate: true,
    },
  },
  appointmentServices: {
    select: {
      price: true,
      service: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { serviceId: 'asc' },
  },
} satisfies Prisma.AppointmentSelect;

const adminAppointmentSelect = {
  id: true,
  date: true,
  status: true,
  customerNotes: true,
  technicianNotes: true,
  mileage: true,
  observations: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      plate: true,
      type: true,
      color: true,
      mileage: true,
    },
  },
  appointmentServices: {
    select: {
      price: true,
      service: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          duration: true,
        },
      },
    },
    orderBy: { serviceId: 'asc' },
  },
} satisfies Prisma.AppointmentSelect;

const adminAppointmentDetailSelect = {
  ...adminAppointmentSelect,
  serviceHistory: {
    select: {
      id: true,
      date: true,
      mileage: true,
      description: true,
      observations: true,
    },
  },
} satisfies Prisma.AppointmentSelect;

type AdminAppointment = Prisma.AppointmentGetPayload<{
  select: typeof adminAppointmentSelect;
}>;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  getSettings() {
    return this.prisma.businessSettings.upsert({
      where: { id: globalSettingsId },
      update: {},
      create: { id: globalSettingsId },
      select: adminSettingsSelect,
    });
  }

  async updateSettings(data: UpdateAdminSettingsDto) {
    const businessName = data.businessName?.trim();
    const phone = data.phone?.trim();
    const email = data.email?.trim();
    const address = data.address?.trim();
    const openingHours = data.openingHours?.trim();
    const updateData: Prisma.BusinessSettingsUpdateInput = {
      ...(businessName !== undefined && { businessName }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(openingHours !== undefined && { openingHours }),
      ...(data.oilChangeIntervalKm !== undefined && {
        oilChangeIntervalKm: data.oilChangeIntervalKm,
      }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    return this.prisma.businessSettings.upsert({
      where: { id: globalSettingsId },
      update: updateData,
      create: {
        id: globalSettingsId,
        businessName: businessName ?? 'AutoCare SV',
        phone: phone ?? '',
        email: email ?? '',
        address: address ?? '',
        openingHours: openingHours ?? '',
        oilChangeIntervalKm: data.oilChangeIntervalKm ?? 5000,
      },
      select: adminSettingsSelect,
    });
  }

  async getAppointments(filters: AdminAppointmentFilters = {}) {
    const where: Prisma.AppointmentWhereInput = {};

    if (filters.date) {
      const start = this.parseLocalDate(filters.date);
      where.date = { gte: start, lt: this.addDays(start, 1) };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const search = filters.search?.trim();

    if (search) {
      where.OR = [
        {
          user: {
            is: {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
              ],
            },
          },
        },
        {
          vehicle: {
            is: {
              OR: [
                { plate: { contains: search } },
                { brand: { contains: search } },
                { model: { contains: search } },
              ],
            },
          },
        },
      ];
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      select: adminAppointmentSelect,
      orderBy: [{ date: 'asc' }, { id: 'asc' }],
    });

    return appointments.map((appointment) =>
      this.serializeAppointment(appointment),
    );
  }

  async getAppointment(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      select: adminAppointmentDetailSelect,
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return {
      ...this.serializeAppointment(appointment),
      serviceHistory: appointment.serviceHistory,
    };
  }

  async updateAppointmentWorkData(
    id: number,
    data: UpdateAdminAppointmentWorkDto,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status !== AppointmentStatus.IN_SERVICE) {
      throw new ConflictException(
        'Work data can only be updated while the appointment is in service',
      );
    }

    const hasValue = [
      data.technicianNotes,
      data.mileage,
      data.observations,
    ].some((value) => value !== undefined && value !== null);

    if (!hasValue) {
      throw new BadRequestException('No valid fields to update');
    }

    const updateData: Prisma.AppointmentUpdateInput = {
      ...(data.technicianNotes !== undefined && {
        technicianNotes: this.normalizeOptionalText(data.technicianNotes),
      }),
      ...(data.mileage !== undefined && { mileage: data.mileage }),
      ...(data.observations !== undefined && {
        observations: this.normalizeOptionalText(data.observations),
      }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: updateData,
      select: adminAppointmentSelect,
    });

    return this.serializeAppointment(updatedAppointment);
  }

  private normalizeOptionalText(value: string | null): string | null {
    if (value === null) {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  async getVehicles(filters: AdminVehicleFilters = {}) {
    const where: Prisma.VehicleWhereInput = {};
    const search = filters.search?.trim();
    const type = filters.type?.trim();

    if (search) {
      where.OR = [
        { plate: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
        {
          user: {
            is: {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
              ],
            },
          },
        },
      ];
    }

    if (type) {
      where.type = type;
    }

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      select: adminVehicleSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return vehicles.map((vehicle) => this.serializeVehicle(vehicle));
  }

  async getVehicle(id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: adminVehicleSelect,
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return this.serializeVehicle(vehicle);
  }

  async updateVehicle(id: number, data: UpdateVehicleDto) {
    try {
      const vehicle = await this.prisma.vehicle.update({
        where: { id },
        data,
        select: adminVehicleSelect,
      });

      return this.serializeVehicle(vehicle);
    } catch (error) {
      this.handleVehicleMutationError(error);
    }
  }

  async removeVehicle(id: number): Promise<void> {
    try {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id },
        select: {
          _count: {
            select: {
              appointments: true,
              serviceHistory: true,
            },
          },
        },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      if (
        vehicle._count.appointments > 0 ||
        vehicle._count.serviceHistory > 0
      ) {
        throw new ConflictException(
          'Vehicle cannot be deleted because it has associated appointments or service history',
        );
      }

      await this.prisma.vehicle.delete({ where: { id } });
    } catch (error) {
      this.handleVehicleMutationError(error);
    }
  }

  async getCustomers(searchValue?: string) {
    const search = searchValue?.trim();
    const where: Prisma.UserWhereInput = {
      role: UserRole.CUSTOMER,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: adminCustomerSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  async getCustomer(id: number) {
    const customer = await this.prisma.user.findFirst({
      where: { id, role: UserRole.CUSTOMER },
      select: adminCustomerSelect,
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const [vehiclesCount, appointmentsCount, completedAppointmentsCount] =
      await Promise.all([
        this.prisma.vehicle.count({ where: { userId: id } }),
        this.prisma.appointment.count({ where: { userId: id } }),
        this.prisma.appointment.count({
          where: { userId: id, status: AppointmentStatus.COMPLETED },
        }),
      ]);

    return {
      ...customer,
      vehiclesCount,
      appointmentsCount,
      completedAppointmentsCount,
    };
  }

  async updateCustomer(id: number, data: UpdateAdminCustomerDto) {
    const updateData: Prisma.UserUpdateManyMutationInput = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    try {
      const result = await this.prisma.user.updateMany({
        where: { id, role: UserRole.CUSTOMER },
        data: updateData,
      });

      if (result.count === 0) {
        throw new NotFoundException('Customer not found');
      }

      const customer = await this.prisma.user.findUnique({
        where: { id },
        select: adminCustomerSelect,
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      return customer;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email is already registered');
      }

      throw error;
    }
  }

  async getServices(filters: AdminServiceFilters = {}) {
    const where: Prisma.ServiceWhereInput = {};
    const search = filters.search?.trim();
    const category = filters.category?.trim();

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (filters.active !== undefined) {
      where.active = filters.active === 'true';
    }

    const services = await this.prisma.service.findMany({
      where,
      select: adminServiceSelect,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });

    return services.map((service) => this.serializeAdminService(service));
  }

  async getService(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select: adminServiceSelect,
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.serializeAdminService(service);
  }

  async createService(data: CreateAdminServiceDto) {
    try {
      const service = await this.prisma.service.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          category: data.category,
          price: data.price,
          duration: data.duration,
          active: data.active ?? true,
        },
        select: adminServiceSelect,
      });

      return this.serializeAdminService(service);
    } catch (error) {
      this.handleServiceMutationError(error);
    }
  }

  async updateService(id: number, data: UpdateAdminServiceDto) {
    const updateData: Prisma.ServiceUpdateInput = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.duration !== undefined && { duration: data.duration }),
      ...(data.active !== undefined && { active: data.active }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    try {
      const service = await this.prisma.service.update({
        where: { id },
        data: updateData,
        select: adminServiceSelect,
      });

      return this.serializeAdminService(service);
    } catch (error) {
      this.handleServiceMutationError(error);
    }
  }

  async getServiceHistory(filters: AdminServiceHistoryFilters = {}) {
    const where: Prisma.ServiceHistoryWhereInput = {};
    const search = filters.search?.trim();

    if (filters.date) {
      const start = this.parseLocalDate(filters.date);
      where.date = { gte: start, lt: this.addDays(start, 1) };
    }

    if (search) {
      where.OR = [
        {
          user: {
            is: {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
              ],
            },
          },
        },
        {
          vehicle: {
            is: {
              OR: [
                { plate: { contains: search } },
                { brand: { contains: search } },
                { model: { contains: search } },
              ],
            },
          },
        },
        {
          appointment: {
            is: {
              appointmentServices: {
                some: {
                  service: { is: { name: { contains: search } } },
                },
              },
            },
          },
        },
      ];
    }

    const history = await this.prisma.serviceHistory.findMany({
      where,
      select: adminServiceHistorySelect,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    return history.map((record) => this.serializeServiceHistory(record));
  }

  async getServiceHistoryRecord(id: number) {
    const record = await this.prisma.serviceHistory.findUnique({
      where: { id },
      select: adminServiceHistorySelect,
    });

    if (!record) {
      throw new NotFoundException('Service history not found');
    }

    return this.serializeServiceHistory(record);
  }

  private serializeServiceHistory(record: AdminServiceHistory) {
    return {
      id: record.id,
      date: record.date,
      mileage: record.mileage,
      description: record.description,
      observations: record.observations,
      customer: record.user,
      vehicle: record.vehicle,
      services:
        record.appointment?.appointmentServices.map((item) => ({
          id: item.service.id,
          name: item.service.name,
          price: item.price.toFixed(2),
        })) ?? [],
      appointment: record.appointment
        ? {
            id: record.appointment.id,
            date: record.appointment.date,
            status: record.appointment.status,
          }
        : null,
    };
  }

  private serializeAdminService(service: AdminCatalogService) {
    return {
      ...service,
      price: service.price.toFixed(2),
    };
  }

  private handleServiceMutationError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Slug is already registered');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Service not found');
      }
    }

    throw error;
  }

  private serializeVehicle(vehicle: AdminVehicle) {
    const { user, ...details } = vehicle;
    return { ...details, customer: user };
  }

  private handleVehicleMutationError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Plate is already registered');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Vehicle not found');
      }
    }

    throw error;
  }

  private serializeAppointment(appointment: AdminAppointment) {
    return {
      id: appointment.id,
      date: appointment.date,
      status: appointment.status,
      customer: appointment.user,
      vehicle: appointment.vehicle,
      services: appointment.appointmentServices.map((item) => ({
        id: item.service.id,
        name: item.service.name,
        slug: item.service.slug,
        category: item.service.category,
        price: item.price.toFixed(2),
        duration: item.service.duration,
      })),
      customerNotes: appointment.customerNotes,
      technicianNotes: appointment.technicianNotes,
      mileage: appointment.mileage,
      observations: appointment.observations,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }

  async getDashboard() {
    const todayStart = this.startOfDay(new Date());
    const tomorrowStart = this.addDays(todayStart, 1);
    const weekStart = this.addDays(todayStart, -6);

    const [
      totalCustomers,
      totalVehicles,
      totalServices,
      totalCompletedAppointments,
      totalRevenueResult,
      todayAppointments,
      weeklyAppointments,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.vehicle.count(),
      this.prisma.service.count({ where: { active: true } }),
      this.prisma.appointment.count({
        where: { status: AppointmentStatus.COMPLETED },
      }),
      this.prisma.appointmentService.aggregate({
        where: {
          appointment: { status: AppointmentStatus.COMPLETED },
        },
        _sum: { price: true },
      }),
      this.prisma.appointment.findMany({
        where: {
          date: { gte: todayStart, lt: tomorrowStart },
        },
        select: todayAppointmentSelect,
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.appointment.findMany({
        where: {
          date: { gte: weekStart, lt: tomorrowStart },
        },
        select: {
          date: true,
          status: true,
          appointmentServices: {
            select: { price: true },
          },
        },
      }),
    ]);

    const countTodayByStatus = (status: AppointmentStatus) =>
      todayAppointments.filter((appointment) => appointment.status === status)
        .length;

    return {
      appointmentsSummary: {
        todayAppointments: todayAppointments.length,
        pendingAppointments: countTodayByStatus(AppointmentStatus.PENDING),
        confirmedAppointments: countTodayByStatus(
          AppointmentStatus.CONFIRMED,
        ),
        inServiceAppointments: countTodayByStatus(
          AppointmentStatus.IN_SERVICE,
        ),
        completedAppointments: countTodayByStatus(
          AppointmentStatus.COMPLETED,
        ),
        cancelledAppointments: countTodayByStatus(
          AppointmentStatus.CANCELLED,
        ),
      },
      generalSummary: {
        totalCustomers,
        totalVehicles,
        totalServices,
        totalCompletedAppointments,
      },
      revenue: {
        todayRevenue: this.sumCompletedRevenue(todayAppointments),
        totalRevenue: (totalRevenueResult._sum.price ?? new Prisma.Decimal(0)).toFixed(
          2,
        ),
      },
      todaySchedule: todayAppointments.map((appointment) => ({
        id: appointment.id,
        date: appointment.date,
        status: appointment.status,
        customer: appointment.user,
        vehicle: appointment.vehicle,
        services: appointment.appointmentServices.map((item) => ({
          id: item.service.id,
          name: item.service.name,
          price: item.price.toFixed(2),
        })),
      })),
      weeklyStats: this.buildWeeklyStats(
        weekStart,
        weeklyAppointments,
      ),
    };
  }

  private buildWeeklyStats(
    weekStart: Date,
    appointments: Array<{
      date: Date;
      status: AppointmentStatus;
      appointmentServices: Array<{ price: Prisma.Decimal }>;
    }>,
  ) {
    const stats = Array.from({ length: 7 }, (_, index) => {
      const date = this.addDays(weekStart, index);

      return {
        date: this.formatDate(date),
        appointments: 0,
        completed: 0,
        revenue: new Prisma.Decimal(0),
      };
    });
    const statsByDate = new Map(stats.map((day) => [day.date, day]));

    for (const appointment of appointments) {
      const day = statsByDate.get(this.formatDate(appointment.date));

      if (!day) {
        continue;
      }

      day.appointments += 1;

      if (appointment.status === AppointmentStatus.COMPLETED) {
        day.completed += 1;
        day.revenue = appointment.appointmentServices.reduce(
          (total, item) => total.plus(item.price),
          day.revenue,
        );
      }
    }

    return stats.map((day) => ({
      ...day,
      revenue: day.revenue.toFixed(2),
    }));
  }

  private sumCompletedRevenue(
    appointments: Array<{
      status: AppointmentStatus;
      appointmentServices: Array<{ price: Prisma.Decimal }>;
    }>,
  ): string {
    return appointments
      .filter(
        (appointment) => appointment.status === AppointmentStatus.COMPLETED,
      )
      .reduce(
        (total, appointment) =>
          appointment.appointmentServices.reduce(
            (appointmentTotal, item) => appointmentTotal.plus(item.price),
            total,
          ),
        new Prisma.Decimal(0),
      )
      .toFixed(2);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private parseLocalDate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
