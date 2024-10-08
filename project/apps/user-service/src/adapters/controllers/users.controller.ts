import { Controller } from '@nestjs/common';

import { UsersService } from 'src/domain/ports/users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Example
  // @MessagePattern({ cmd: 'findAll' })
  // async findAll() {}
}
