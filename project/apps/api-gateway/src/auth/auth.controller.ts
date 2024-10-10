import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
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
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
  ) {}

  @Post('signup')
  @UsePipes(new ZodValidationPipe(signUpSchema))
  async signUp(@Body() body: SignUpDto, @Res() res: Response) {
    const { userData, session } = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'signup' }, body),
    );

    res.cookie('token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.status(HttpStatus.OK).json({ userData });
  }

  @Post('signin')
  @UsePipes(new ZodValidationPipe(signInSchema))
  async signIn(@Body() body: SignInDto, @Res() res: Response) {
    const { userData, session } = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'signin' }, body),
    );
    res.cookie('token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.status(HttpStatus.OK).json({ userData });
  }

  @Post('signout')
  async signOut(@Res() res: Response) {
    res.clearCookie('token');
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Signed out successfully' });
  }

  @Get('me')
  async me(@Req() request: Request, @Res() res: Response) {
    const token = request.cookies['token'];
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ user: null });
    }
    const userData = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, token),
    );
    return res.status(HttpStatus.OK).json({ userData });
  }
}
