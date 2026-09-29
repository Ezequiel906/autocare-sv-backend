import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const serviceHistorySelect = {
  id: true,
  date: true,
  mileage: true,
  description: true,
  observations: true,
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

type ServiceHistoryDetails = Prisma.ServiceHistoryGetPayload<{
  select: typeof serviceHistorySelect;
}>;

@Injectable()
export class ServiceHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    const history = await this.prisma.serviceHistory.findMany({
      where: { userId },
      select: serviceHistorySelect,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    return history.map((record) => this.serialize(record));
  }

  private serialize(record: ServiceHistoryDetails) {
    return {
      id: record.id,
      date: record.date,
      mileage: record.mileage,
      description: record.description,
      observations: record.observations,
      vehicle: record.vehicle,
      appointment: record.appointment
        ? {
            id: record.appointment.id,
            date: record.appointment.date,
            status: record.appointment.status,
            services: record.appointment.appointmentServices.map((item) => ({
              id: item.service.id,
              name: item.service.name,
              price: item.price.toFixed(2),
            })),
          }
        : null,
    };
  }
}
