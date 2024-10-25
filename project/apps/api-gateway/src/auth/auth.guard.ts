import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EnvService } from 'src/env/env.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
    private readonly envService: EnvService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const accessToken = request.cookies['access_token'];
    const refreshToken = request.cookies['refresh_token'];

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No token found');
    }

    try {
      if (accessToken) {
        request.user = await firstValueFrom(
          this.authServiceClient.send({ cmd: 'verify' }, accessToken),
        );
        return true;
      }

      const { access_token: newAccessToken, refresh_token: newRefreshToken } =
        await firstValueFrom(
          this.authServiceClient.send({ cmd: 'refresh' }, refreshToken),
        );
      const NODE_ENV = this.envService.get('NODE_ENV');

      // Update new tokens in response cookies
      response.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      response.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 * 1000, // 1 week
      });

      // Update original request with new access token and user
      request.cookies['access_token'] = newAccessToken;
      request.user = await firstValueFrom(
        this.authServiceClient.send({ cmd: 'verify' }, newAccessToken),
      );

      return true;
    } catch {
      // If refresh token is invalid
      throw new UnauthorizedException('Invalid token');
    }
  }
}
