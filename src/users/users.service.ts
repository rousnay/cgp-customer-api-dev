import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersCreateDTO } from './users.create.dto';
import { Users } from './users.entity';
import { PasswordService } from '../auth/password.service';
// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UsersService {
  // private readonly users = [
  //   {
  //     userId: 1,
  //     username: 'john',
  //     password: 'changeme',
  //   },
  //   {
  //     userId: 2,
  //     username: 'maria',
  //     password: 'guess',
  //   },
  // ];

  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private readonly passwordService: PasswordService,
  ) {}

  // async findOne(username: string): Promise<User | undefined> {
  //   return await this.userRepository.find((user) => user.username === username);
  // }

  public async getUsers(): Promise<Users[]> {
    return await this.userRepository.find();
  }

  public async getUser(username: string): Promise<Users | undefined> {
    return await this.userRepository.findOne({
      where: { username: username },
    });
    // return await this.userRepository.find((user) => user.username === username);
  }

  public async createUser(usersCreateDTO: UsersCreateDTO): Promise<Users> {
    const hashedPassword = await this.passwordService.hashPassword(
      usersCreateDTO.password,
    );

    const newUser = { ...usersCreateDTO, password: hashedPassword };
    return await this.userRepository.save(newUser);
  }

  public async editUser(
    userId: number,
    usersCreateDTO: UsersCreateDTO,
  ): Promise<Users> {
    const editedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!editedUser) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await this.passwordService.hashPassword(
      usersCreateDTO.password,
    );

    const updatedUser = { ...usersCreateDTO, password: hashedPassword };

    const result = await this.userRepository.update(
      { id: userId },
      updatedUser,
    );
    console.log(result);
    return editedUser;
  }

  public async deleteUser(userId: number): Promise<void> {
    await this.userRepository.delete(userId);
  }
}
