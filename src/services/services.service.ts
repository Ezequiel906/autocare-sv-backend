import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const catalogServiceSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  category: true,
  price: true,
  duration: true,
} satisfies Prisma.ServiceSelect;

type CatalogService = Prisma.ServiceGetPayload<{
  select: typeof catalogServiceSelect;
}>;

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string) {
    const services = await this.prisma.service.findMany({
      where: category ? { active: true, category } : { active: true },
      select: catalogServiceSelect,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });

    return services.map((service) => this.serialize(service));
  }

  async findOne(id: number) {
    const service = await this.prisma.service.findFirst({
      where: { id, active: true },
      select: catalogServiceSelect,
    });

    return this.requireService(service);
  }

  async findBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug, active: true },
      select: catalogServiceSelect,
    });

    return this.requireService(service);
  }

  private requireService(service: CatalogService | null) {
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.serialize(service);
  }

  private serialize(service: CatalogService) {
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      category: service.category,
      price: service.price.toFixed(2),
      duration: service.duration,
    };
  }
}
