import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['token']; // to fix: token here is always undefined

    if (!token) {
      throw new UnauthorizedException('No token found');
    }

    const data = await this.authService.verifyUser(token);

    if (!data) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = data;
    return true;
  }
}
