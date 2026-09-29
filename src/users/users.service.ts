import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const userWithoutPassword = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const userCredentials = {
  ...userWithoutPassword,
  password: true,
} satisfies Prisma.UserSelect;

type UserWithoutPassword = Prisma.UserGetPayload<{
  select: typeof userWithoutPassword;
}>;

type CreateUserData = Pick<
  Prisma.UserCreateInput,
  'name' | 'email' | 'phone' | 'password' | 'role'
>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<UserWithoutPassword | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: userWithoutPassword,
    });
  }

  findById(id: number): Promise<UserWithoutPassword | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: userWithoutPassword,
    });
  }

  findCredentialsByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: userCredentials,
    });
  }

  create(data: CreateUserData): Promise<UserWithoutPassword> {
    return this.prisma.user.create({
      data,
      select: userWithoutPassword,
    });
  }
}
