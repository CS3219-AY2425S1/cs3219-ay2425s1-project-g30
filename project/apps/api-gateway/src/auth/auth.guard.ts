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
    const response = context.switchToHttp().getResponse();
    const accessToken = request.cookies['access_token'];
    const refreshToken = request.cookies['refresh_token'];

    if (accessToken) {
      request.user = await firstValueFrom(
        this.authServiceClient.send({ cmd: 'verify' }, accessToken),
      );
      return true;
    }

    // Check if refresh token exists
    if (!refreshToken) {
      throw new UnauthorizedException('No token found');
    }

    try {
      const { access_token: newAccessToken, refresh_token: newRefreshToken } =
        await firstValueFrom(
          this.authServiceClient.send({ cmd: 'refresh' }, refreshToken),
        );

      // Update new tokens in request and response cookies
      request.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      response.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      response.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 * 1000, // 1 week
      });

      // Get user data with new access token
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
