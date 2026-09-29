import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: number) {
    return this.prisma.vehicle.findMany({ where: { userId } });
  }

  async findOne(userId: number, id: number) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, userId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async create(userId: number, data: CreateVehicleDto) {
    try {
      return await this.prisma.vehicle.create({
        data: {
          userId,
          brand: data.brand,
          model: data.model,
          year: data.year,
          plate: data.plate,
          type: data.type,
          color: data.color,
          mileage: data.mileage,
        },
      });
    } catch (error) {
      this.handleDuplicatePlate(error);
    }
  }

  async update(userId: number, id: number, data: UpdateVehicleDto) {
    try {
      const result = await this.prisma.vehicle.updateMany({
        where: { id, userId },
        data,
      });

      if (result.count === 0) {
        throw new NotFoundException('Vehicle not found');
      }

      return this.findOne(userId, id);
    } catch (error) {
      this.handleDuplicatePlate(error);
    }
  }

  async remove(userId: number, id: number): Promise<void> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, userId },
      select: {
        id: true,
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

    const result = await this.prisma.vehicle.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Vehicle not found');
    }
  }

  private handleDuplicatePlate(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Plate is already registered');
    }

    throw error;
  }
}
