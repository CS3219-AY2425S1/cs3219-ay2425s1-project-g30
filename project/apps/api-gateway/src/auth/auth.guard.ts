import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies['access_token'];
    const refreshToken = request.cookies['refresh_token'];

    if (!accessToken) {
      if (!refreshToken) {
        throw new UnauthorizedException('No token found');
      }
      const { newAccessToken, newRefreshToken } = await this.authService.refreshToken(refreshToken);
      if (!newAccessToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      request.cookies['access_token'] = newAccessToken;
      request.cookies['refresh_token'] = newRefreshToken;
    }

    const data = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'verify' }, token),
    );

    request.user = data;
    return true;
  }
}
