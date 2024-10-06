import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SignInDto, SignUpDto } from '@repo/dtos/auth';

import { AuthService } from 'src/domain/ports/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'signup' })
  async signUp(@Payload() signUpDto: SignUpDto) {
    const { userData, session } = await this.authService.signUp(signUpDto);
    return { userData, session };
  }

  @MessagePattern({ cmd: 'signin' })
  async signIn(@Payload() signInDto: SignInDto) {
    const { userData, session } = await this.authService.signIn(signInDto);
    return { userData, session };
  }

  @MessagePattern({ cmd: 'me' })
  async me(@Payload() token: string) {
    const userData = await this.authService.me(token);
    return { userData }; // check: necessary to wrap in object?
  }

  @MessagePattern({ cmd: 'verify' })
  async verifyUser(@Payload() token: string) {
    const data = await this.authService.verifyUser(token);
    return data;
  }
}
