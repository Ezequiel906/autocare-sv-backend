import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const password = await bcrypt.hash(data.password, 12);
    const user = await this.usersService.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password,
    });
    const accessToken = await this.jwtService.signAsync({ sub: user.id });

    return { user, accessToken };
  }

  async login(data: LoginDto) {
    const user = await this.usersService.findCredentialsByEmail(data.email);

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const authenticatedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    const accessToken = await this.jwtService.signAsync({ sub: user.id });

    return { user: authenticatedUser, accessToken };
  }
}
