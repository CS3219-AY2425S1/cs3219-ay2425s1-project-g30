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
    let accessToken = request.cookies['access_token'];
    const refreshToken = request.cookies['refresh_token'];

    if (!accessToken) {
      if (!refreshToken) {
        throw new UnauthorizedException('No token found');
      }
      
      const { newAccessToken, newRefreshToken } = await firstValueFrom(
        this.userServiceClient.send({ cmd: 'refreshToken' }, refreshToken),
      )
      
      if (!newAccessToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
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
      
      accessToken = newAccessToken;
    }
    
    const data = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'verify' }, token),
    );

    request.user = data;
    return true;
  }
}
