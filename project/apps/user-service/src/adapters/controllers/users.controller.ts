import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SignInDto, SignUpDto } from '@repo/dtos/auth';
import { UserAuthRecordDto, UserSessionDto } from '@repo/dtos/users';

import { UsersService } from 'src/domain/ports/users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Example
  // @MessagePattern({ cmd: 'findAll' })
  // async findAll() {}
}
