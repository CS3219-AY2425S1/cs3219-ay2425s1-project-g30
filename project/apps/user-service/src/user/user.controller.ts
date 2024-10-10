import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateUserDto } from '@repo/dtos/user';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'all_users' })
  async getAllUsers(@Payload() token: string) {
    return await this.userService.allUsers();
  }

  @MessagePattern({ cmd: 'update_user' })
  async updateUser(@Payload() payload: {id: string, updateUserDto: UpdateUserDto}) {
    const { id, updateUserDto } = payload;
    return await this.userService.updateUser(id, updateUserDto);
  }

  @MessagePattern({ cmd: 'update_privilege' })
  async updateUserPrivilege(id: string) {
    return await this.userService.updateUserPrivilege(id);
  }
  
  @MessagePattern({ cmd: 'delete_user' })
  async deleteUser(id: string) {
    return await this.userService.deleteUser(id);
  }
}
