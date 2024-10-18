import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateUserDto, UserFiltersDto } from '@repo/dtos/users';
import { UsersService } from 'src/domain/ports/users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'get_users' })
  async getUsers(@Payload() filters: UserFiltersDto) {
    return await this.usersService.findAll(filters);
  }

  @MessagePattern({ cmd: 'get_user' })
  async getUserById(@Payload() id: string) {
    return await this.usersService.findById(id);
  }

  @MessagePattern({ cmd: 'update_user' })
  async updateUserById(@Payload() payload: UpdateUserDto) {
    return await this.usersService.updateById(payload);
  }

  @MessagePattern({ cmd: 'update_privilege' })
  async updateUserPrivilegeById(@Payload() id: string) {
    return await this.usersService.updatePrivilegeById(id);
  }

  @MessagePattern({ cmd: 'delete_user' })
  async deleteUserById(@Payload() id: string) {
    return await this.usersService.deleteById(id);
  }
}
