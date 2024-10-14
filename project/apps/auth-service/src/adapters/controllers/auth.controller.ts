import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SignInDto, SignUpDto } from '@repo/dtos/auth';
import { AuthService } from 'src/domain/ports/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'signup' })
  async signUp(@Payload() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @MessagePattern({ cmd: 'signin' })
  async signIn(@Payload() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto);
  }

  @MessagePattern({ cmd: 'signout' })
  async signOut() {
    return await this.authService.signOut();
  }

  @MessagePattern({ cmd: 'verify' })
  async verify(@Payload() accessToken: string) {
    return await this.authService.verifyUser(accessToken);
  }

  @MessagePattern({ cmd: 'me' })
  async me(@Payload() accessToken: string) {
    return await this.authService.me(accessToken);
  }

  @MessagePattern({ cmd: 'refresh' })
  async refresh(@Payload() refreshToken: string) {
    return await this.authService.refreshUserSession(refreshToken);
  }
}
