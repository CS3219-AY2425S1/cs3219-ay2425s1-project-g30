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
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
@UseGuards(AuthGuard) // comment out if we dw auth for now
export class UsersController {
  constructor(
    @Inject('USER_SERVICE')
    private readonly usersServiceClient: ClientProxy,

    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
  ) {}

  @Get()
  @UsePipes(new ZodValidationPipe(userFiltersSchema))
  async getUsers(@Req() req: Request, @Query() filters: UserFiltersDto) {
    const accessToken = req.cookies['access_token'];

    // Check if user is admin, else forbid access [DELETE once role guard is implemented]
    const userData = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, accessToken),
    );

    if (userData.role != 'Admin') {
      throw new ForbiddenException('Access denied.');
    }

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

    // Check if admin or user is updating their own account [DELETE once role guard is implemented]
    const accessToken = req.cookies['access_token'];
    const userData = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, accessToken),
    );

    if (userData.role != 'Admin' && userData.id != id) {
      throw new ForbiddenException('Access denied.');
    }

    return this.usersServiceClient.send(
      { cmd: 'update_user' },
      { updateUserDto, accessToken },
    );
  }

  @Patch(':id')
  async updateUserPrivilegeById(@Req() req: Request, @Param('id') id: string) {
    const accessToken = req.cookies['access_token'];

    // Check if user is admin [DELETE once role guard is implemented]
    const { userData } = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, accessToken),
    );
    if (userData.role != 'Admin') {
      throw new ForbiddenException('Access denied.');
    }

    return this.usersServiceClient.send({ cmd: 'update_privilege' }, id);
  }

  @Patch('password/:id')
  async changePasswordById(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(changePasswordSchema))
    changePasswordDto: ChangePasswordDto,
  ) {
    if (id != changePasswordDto.id) {
      throw new BadRequestException('ID in URL does not match ID in body');
    }

    // Check if user is admin or user is changing their own password [DELETE once role guard is implemented]
    const accessToken = req.cookies['access_token'];
    const { userData } = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, accessToken),
    );

    if (userData.role != 'Admin' && userData.id != id) {
      throw new ForbiddenException('Access denied.');
    }

    // Check if old password matches
    const { error } = await firstValueFrom(
      this.authServiceClient.send(
        { cmd: 'sign_in' },
        {
          email: userData.email,
          password: changePasswordDto.oldPassword,
        },
      ),
    );

    if (error) {
      throw new BadRequestException('Old password is incorrect');
    }

    return this.usersServiceClient.send(
      { cmd: 'change_password' },
      { changePasswordDto, accessToken },
    );
  }

  @Delete(':id')
  async deleteUserById(@Req() req: Request, @Param('id') id: string) {
    const accessToken = req.cookies['access_token'];

    // Check if admin is deleting, else deny access [DELETE once role guard is implemented]
    const { userData } = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, accessToken),
    );

    if (userData.role != 'Admin') {
      throw new ForbiddenException('Access denied.');
    }

    return this.usersServiceClient.send({ cmd: 'delete_user' }, id);
  }
}
