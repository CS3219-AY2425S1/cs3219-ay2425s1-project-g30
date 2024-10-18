import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  SignInDto,
  signInSchema,
  SignUpDto,
  signUpSchema,
} from '@repo/dtos/auth';
import { ZodValidationPipe } from '@repo/pipes/zod-validation-pipe.pipe';
import { Request, Response } from 'express';

import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserSessionDto } from '@repo/dtos/users';
import { AuthGuard } from './auth.guard';
import { EnvService } from 'src/env/env.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
    private readonly envService: EnvService,
  ) {}

  @Post('signup')
  @UsePipes(new ZodValidationPipe(signUpSchema))
  async signUp(@Body() body: SignUpDto, @Res() res: Response) {
    const { userData, session } = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'signup' }, body),
    );
    const NODE_ENV = this.envService.get('NODE_ENV');
    res.cookie('access_token', session.access_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refresh_token', session.refresh_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 1 week
    });

    return res
      .status(HttpStatus.OK)
      .json({ userData, session } as UserSessionDto);
  }

  @Post('signin')
  @UsePipes(new ZodValidationPipe(signInSchema))
  async signIn(@Body() body: SignInDto, @Res() res: Response) {
    const { userData, session } = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'signin' }, body),
    );
    const NODE_ENV = this.envService.get('NODE_ENV');
    res.cookie('access_token', session.access_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refresh_token', session.refresh_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 1 week
    });

    return res
      .status(HttpStatus.OK)
      .json({ userData, session } as UserSessionDto);
  }

  @Post('signout')
  @UseGuards(AuthGuard)
  async signOut(@Res() res: Response) {
    this.authServiceClient.send({ cmd: 'signout' }, {});
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return res
      .status(HttpStatus.OK)
      .json({ message: 'Signed out successfully' });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request, @Res() res: Response) {
    const accessToken = req.cookies['access_token'];
    const userData = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, accessToken),
    );

    return res.status(HttpStatus.OK).json(userData);
  }
}
