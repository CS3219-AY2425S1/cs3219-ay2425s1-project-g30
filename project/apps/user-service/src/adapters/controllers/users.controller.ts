import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SignInDto, SignUpDto } from '@repo/dtos/auth';

import { UsersService } from 'src/domain/ports/users.service';

@Controller()
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'signup' })
  async signUp(@Payload() signUpDto: SignUpDto) {
    const { userData, session } = await this.usersService.signUp(signUpDto);
    return { userData, session };
  }

  @MessagePattern({ cmd: 'signin' })
  async signIn(@Payload() signInDto: SignInDto) {
    const { userData, session } = await this.usersService.signIn(signInDto);
    return { userData, session };
  }

  @MessagePattern({ cmd: 'me' })
  async me(@Payload() token: string) {
    const userData = await this.usersService.me(token);
    return { userData }; // check: necessary to wrap in object?
  }

  @MessagePattern({ cmd: 'verify' })
  async verifyUser(@Payload() token: string) {
    const data = await this.usersService.verifyUser(token);
    return data;
  }
}
