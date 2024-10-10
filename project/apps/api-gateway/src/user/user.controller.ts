  
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Put,
  Req,
  Res,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  UpdateUserDto,
  updateUserSchema
} from '@repo/dtos/user';
import { ZodValidationPipe } from '@repo/pipes/zod-validation-pipe.pipe';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
@Controller('user')
export class UserController {
  constructor(
    @Inject('USER_SERVICE')
    private readonly authServiceClient: ClientProxy,
    private readonly userServiceClient: ClientProxy,
  ) {}
  
  @Get('all-users')
  async getAllUsers(@Req() request: Request, @Res() res: Response) {
    const token = request.cookies['access_token'];
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ user: null });
    }
    
    // Check if user is admin
    const { userData } = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, token)
    );
    if (userData.role !== 'admin') {
      return res.status(HttpStatus.FORBIDDEN).json({ message: 'Access denied' });
    }
    
    const { allUserData } = await firstValueFrom(
      this.userServiceClient.send({ cmd: 'all_users' }, {})
    );
    return res.status(HttpStatus.OK).json({ allUserData });
  }
  
  @Put(':id')
  async updateUser(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) // validation on the body only
    updateUserDto: UpdateUserDto,
  ) {
    const token = request.cookies['access_token'];
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ user: null });
    }

    // Check if admin or user is updating their own account
    const { userData } = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, token)
    );
    if (userData.role != 'admin' && userData.id != id) {
      return res.status(HttpStatus.FORBIDDEN).json({ message: 'Access denied.' });
    }
    
    const { data } = await firstValueFrom(
      this.userServiceClient.send(
        { cmd: 'update_user' },
        { id, ...updateUserDto })
      );
    return res.status(HttpStatus.OK).json({ data });
  }
  
  @Delete(':id')
  async deleteUser(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') id: string
  ) {
    const token = request.cookies['access_token'];
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ user: null });
    }
    
    // Check if admin or user is deleting their own account
    const { userData } = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, token)
    );
    if (userData.role != 'admin' && userData.id != id) {
      return res.status(HttpStatus.FORBIDDEN).json({ message: 'Access denied.' });
    }
    
    this.userServiceClient.send({ cmd: 'delete_user' }, id)
    if (userData.id === id) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
    }
    return res.status(HttpStatus.OK).json({ message: 'Account deleted successfully' });
  }
  
  @Patch(':id')
  async updateUserPrivilege(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const token = request.cookies['access_token'];
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ user: null });
    }
    
    // Check if user is admin
    const { userData } = await firstValueFrom(
      this.authServiceClient.send({ cmd: 'me' }, token)
    );
    if (userData.role != 'admin') {
      return res.status(HttpStatus.FORBIDDEN).json({ message: 'Access denied.' });
    }

    const { data } = await firstValueFrom(
      this.userServiceClient.send({ cmd: 'update_privilege' }, id)
    );
    return res.status(HttpStatus.OK).json({ data });
  }
}
