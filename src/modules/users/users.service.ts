import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { Authority } from './entities/authority.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Authority)
    private readonly authoritiesRepository: Repository<Authority>,
  ) {}

  async registerUser(dto: RegisterDto): Promise<User> {
    const [authority] = await this.authoritiesRepository.find({
      where: { name: In(['ROLE_USER']) },
    });
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      login: dto.login,
      password: hashedPassword,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      sex: dto.sex,
      birthday: dto.birthday ? new Date(dto.birthday) : null,
      langKey: dto.langKey || 'it',
      activated: true,
      authorities: authority ? [authority] : [],
      createdBy: dto.login,
    });
    return this.usersRepository.save(user);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const authorities = await this.authoritiesRepository.find({
      where: { name: In(['ROLE_USER']) },
    });
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      birthday: createUserDto.birthday ? new Date(createUserDto.birthday) : null,
      authorities,
      createdBy: 'system',
    });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['authorities'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['authorities'],
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { login: login.toLowerCase() },
      relations: ['authorities'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, {
      ...updateUserDto,
      birthday: updateUserDto.birthday ? new Date(updateUserDto.birthday) : user.birthday,
      lastModifiedBy: 'system',
    });
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
