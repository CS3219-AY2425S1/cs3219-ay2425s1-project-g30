import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Req,
  Inject,
  UsePipes,
  Query,
  ForbiddenException,
  BadRequestException,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  UpdateUserDto,
  userFiltersSchema,
  UserFiltersDto,
  updateUserSchema,
  changePasswordSchema,
  ChangePasswordDto,
} from '@repo/dtos/users';
import { ZodValidationPipe } from '@repo/pipes/zod-validation-pipe.pipe';
import { ROLE } from '@repo/dtos/generated/enums/auth.enums';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Request, Response } from 'express';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(
    @Inject('USER_SERVICE')
    private readonly usersServiceClient: ClientProxy,

    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
  ) {}

  @Get()
  @Roles(ROLE.Admin)
  @UsePipes(new ZodValidationPipe(userFiltersSchema))
  async getUsers(@Query() filters: UserFiltersDto) {
    return this.usersServiceClient.send({ cmd: 'get_users' }, filters);
  }

  @Get(':id')
  async getUserById(@Req() req: Request, @Param('id') id: string) {
    return this.usersServiceClient.send({ cmd: 'get_user' }, id);
  }

  @Put(':id')
  async updateUser(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) // validation on the body only
    updateUserDto: UpdateUserDto,
  ) {
    if (id != updateUserDto.id) {
      throw new BadRequestException('ID in URL does not match ID in body');
    }

    // Check if admin or user is updating their own account
    const accessToken = req.cookies['access_token'];
    const userData = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, accessToken),
    );

    if (userData.role != ROLE.Admin && userData.id != id) {
      throw new ForbiddenException('Access denied.');
    }

    return this.usersServiceClient.send({ cmd: 'update_user' }, updateUserDto);
  }

  @Patch(':id')
  @Roles(ROLE.Admin)
  async updateUserPrivilegeById(@Param('id') id: string) {
    return this.usersServiceClient.send({ cmd: 'update_privilege' }, id);
  }

  @Patch('password/:id')
  async changePasswordById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(changePasswordSchema))
    changePasswordDto: ChangePasswordDto,
  ) {
    if (id != changePasswordDto.id) {
      throw new BadRequestException('ID in URL does not match ID in body');
    }

    // Check if user is admin or user is changing their own password
    const accessToken = req.cookies['access_token'];
    const userData = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, accessToken),
    );

    if (userData.role != ROLE.Admin && userData.id != id) {
      throw new ForbiddenException('Access denied.');
    }

    const updatedUser = await firstValueFrom(
      this.usersServiceClient.send(
        { cmd: 'change_password' },
        changePasswordDto,
      ),
    );

    // Sign back in and update cookies with new password
    const { session } = await firstValueFrom(
      this.authServiceClient.send(
        { cmd: 'signin' },
        {
          email: updatedUser.email,
          password: changePasswordDto.newPassword,
        },
      ),
    );

    res.cookie('access_token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    res.cookie('refresh_token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 1 week
    });

    return res.status(HttpStatus.OK).json(updatedUser);
  }

  @Delete(':id')
  async deleteUserById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const accessToken = req.cookies['access_token'];

    // Check if admin is deleting user or user is deleting their own account
    const userData = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, accessToken),
    );

    if (userData.role != ROLE.Admin && userData.id != id) {
      throw new ForbiddenException('Access denied.');
    }

    // Delete user and clear session
    const isDeleted = await firstValueFrom(
      this.usersServiceClient.send({ cmd: 'delete_user' }, id),
    );
    await this.authServiceClient.send({ cmd: 'signout' }, {});
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return res.status(HttpStatus.OK).json(isDeleted);
  }
}
