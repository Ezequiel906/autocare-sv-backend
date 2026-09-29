import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

const appointmentSelect = {
  id: true,
  date: true,
  status: true,
  customerNotes: true,
  createdAt: true,
  updatedAt: true,
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

type AppointmentDetails = Prisma.AppointmentGetPayload<{
  select: typeof appointmentSelect;
}>;

const completedAppointmentSelect = {
  ...appointmentSelect,
  serviceHistory: {
    select: {
      id: true,
      appointmentId: true,
      date: true,
      mileage: true,
      description: true,
      observations: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.AppointmentSelect;

type CompletedAppointmentDetails = Prisma.AppointmentGetPayload<{
  select: typeof completedAppointmentSelect;
}>;

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, data: CreateAppointmentDto) {
    if (new Set(data.serviceIds).size !== data.serviceIds.length) {
      throw new BadRequestException('Service IDs must be unique');
    }

    const appointmentDate = new Date(data.date);

    if (appointmentDate <= new Date()) {
      throw new BadRequestException('Appointment date must be in the future');
    }

    const appointment = await this.prisma.$transaction(async (transaction) => {
      const vehicle = await transaction.vehicle.findFirst({
        where: { id: data.vehicleId, userId },
        select: { id: true },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      const services = await transaction.service.findMany({
        where: { id: { in: data.serviceIds }, active: true },
        select: { id: true, price: true },
      });

      if (services.length !== data.serviceIds.length) {
        throw new BadRequestException(
          'One or more services are unavailable',
        );
      }

      return transaction.appointment.create({
        data: {
          userId,
          vehicleId: vehicle.id,
          date: appointmentDate,
          status: AppointmentStatus.PENDING,
          customerNotes: data.customerNotes,
          appointmentServices: {
            create: services.map((service) => ({
              serviceId: service.id,
              price: service.price,
            })),
          },
        },
        select: appointmentSelect,
      });
    });

    return this.serialize(appointment);
  }

  async findAll(userId: number) {
    const appointments = await this.prisma.appointment.findMany({
      where: { userId },
      select: appointmentSelect,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    return appointments.map((appointment) => this.serialize(appointment));
  }

  async findOne(userId: number, id: number) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, userId },
      select: appointmentSelect,
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.serialize(appointment);
  }

  async cancel(user: { id: number; role: UserRole }, id: number) {
    const appointment = await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.appointment.findFirst({
        where:
          user.role === UserRole.ADMIN ? { id } : { id, userId: user.id },
        select: { id: true, status: true },
      });

      if (!current) {
        throw new NotFoundException('Appointment not found');
      }

      if (
        current.status !== AppointmentStatus.PENDING &&
        current.status !== AppointmentStatus.CONFIRMED
      ) {
        throw new ConflictException('Appointment cannot be cancelled');
      }

      return transaction.appointment.update({
        where: { id: current.id },
        data: { status: AppointmentStatus.CANCELLED },
        select: appointmentSelect,
      });
    });

    return this.serialize(appointment);
  }

  async confirm(id: number) {
    const appointment = await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.appointment.findUnique({
        where: { id },
        select: { id: true, status: true },
      });

      if (!current) {
        throw new NotFoundException('Appointment not found');
      }

      if (current.status !== AppointmentStatus.PENDING) {
        throw new ConflictException(
          'La cita no puede confirmarse desde su estado actual.',
        );
      }

      return transaction.appointment.update({
        where: { id: current.id },
        data: { status: AppointmentStatus.CONFIRMED },
        select: appointmentSelect,
      });
    });

    return this.serialize(appointment);
  }

  async start(id: number) {
    const appointment = await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.appointment.findUnique({
        where: { id },
        select: { id: true, status: true },
      });

      if (!current) {
        throw new NotFoundException('Appointment not found');
      }

      if (current.status !== AppointmentStatus.CONFIRMED) {
        throw new ConflictException(
          'La cita no puede iniciarse desde su estado actual.',
        );
      }

      return transaction.appointment.update({
        where: { id: current.id },
        data: { status: AppointmentStatus.IN_SERVICE },
        select: appointmentSelect,
      });
    });

    return this.serialize(appointment);
  }

  async complete(id: number) {
    const appointment = await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.appointment.findUnique({
        where: { id },
        select: {
          id: true,
          userId: true,
          vehicleId: true,
          date: true,
          status: true,
          mileage: true,
          observations: true,
          user: { select: { id: true } },
          vehicle: { select: { id: true } },
          serviceHistory: { select: { id: true } },
          appointmentServices: {
            select: { service: { select: { name: true, slug: true } } },
            orderBy: { serviceId: 'asc' },
          },
        },
      });

      if (!current) {
        throw new NotFoundException('Appointment not found');
      }

      if (current.status !== AppointmentStatus.IN_SERVICE) {
        throw new ConflictException(
          'La cita no puede completarse desde su estado actual.',
        );
      }

      if (
        current.user.id !== current.userId ||
        current.vehicle.id !== current.vehicleId
      ) {
        throw new ConflictException('La cita tiene relaciones inválidas.');
      }

      if (current.serviceHistory) {
        throw new ConflictException(
          'La cita ya tiene un historial de servicio.',
        );
      }

      const description = current.appointmentServices
        .map((item) => item.service.name)
        .join(', ');

      if (!description) {
        throw new ConflictException('La cita no tiene servicios asociados.');
      }

      const includesOilChange = current.appointmentServices.some(
        (item) => item.service.slug === 'cambio-de-aceite',
      );
      let historyObservations = current.observations;

      if (includesOilChange && current.mileage !== null) {
        const settings = await transaction.businessSettings.upsert({
          where: { id: 1 },
          update: {},
          create: { id: 1 },
          select: { oilChangeIntervalKm: true },
        });
        const nextMileage = new Intl.NumberFormat('en-US').format(
          current.mileage + settings.oilChangeIntervalKm,
        );
        const recommendation =
          `Próximo cambio de aceite recomendado a los ${nextMileage} km.`;
        historyObservations = historyObservations
          ? `${historyObservations} ${recommendation}`
          : recommendation;
      }

      await transaction.serviceHistory.create({
        data: {
          userId: current.userId,
          vehicleId: current.vehicleId,
          appointmentId: current.id,
          date: current.date,
          mileage: current.mileage,
          description,
          observations: historyObservations,
        },
      });

      return transaction.appointment.update({
        where: { id: current.id },
        data: { status: AppointmentStatus.COMPLETED },
        select: completedAppointmentSelect,
      });
    });

    return this.serializeCompleted(appointment);
  }

  private serialize(appointment: AppointmentDetails) {
    return {
      id: appointment.id,
      date: appointment.date,
      status: appointment.status,
      customerNotes: appointment.customerNotes,
      vehicle: appointment.vehicle,
      services: appointment.appointmentServices.map((item) => ({
        ...item.service,
        price: item.price.toFixed(2),
      })),
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }

  private serializeCompleted(appointment: CompletedAppointmentDetails) {
    return {
      ...this.serialize(appointment),
      serviceHistory: appointment.serviceHistory,
    };
  }
}
