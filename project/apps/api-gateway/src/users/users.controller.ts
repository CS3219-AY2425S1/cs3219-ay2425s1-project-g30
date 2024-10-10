import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
  ) {}

  // @Get()
  // async getUsers() {}

  // @Get(':id')
  // async getUserById() {}

  // other CRUD methods
}
