import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
  {
    name: 'Cambio de aceite',
    slug: 'cambio-de-aceite',
    category: 'Mantenimiento',
    description:
      'Cambio de aceite del motor con revisión básica de niveles y componentes relacionados.',
    price: '35.00',
    duration: 45,
    active: true,
  },
  {
    name: 'Filtros',
    slug: 'filtros',
    category: 'Mantenimiento',
    description:
      'Revisión y reemplazo de filtros según el estado y las necesidades del vehículo.',
    price: '25.00',
    duration: 30,
    active: true,
  },
  {
    name: 'Control de fluidos',
    slug: 'control-de-fluidos',
    category: 'Mantenimiento',
    description:
      'Revisión de los principales niveles y condiciones de los fluidos del vehículo.',
    price: '20.00',
    duration: 25,
    active: true,
  },
  {
    name: 'Baterías',
    slug: 'baterias',
    category: 'Electricidad',
    description:
      'Revisión del estado de la batería y sistema de carga del vehículo.',
    price: '15.00',
    duration: 20,
    active: true,
  },
  {
    name: 'Inspección rápida',
    slug: 'inspeccion-rapida',
    category: 'Inspección',
    description:
      'Inspección visual de componentes básicos como frenos, neumáticos, luces y limpiaparabrisas.',
    price: '20.00',
    duration: 30,
    active: true,
  },
  {
    name: 'Mantenimiento básico',
    slug: 'mantenimiento-basico',
    category: 'Mantenimiento',
    description:
      'Revisión general y mantenimiento preventivo de los principales componentes del vehículo.',
    price: '45.00',
    duration: 60,
    active: true,
  },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
