
import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UserProfileDto, UpdateUserDto } from '@repo/dtos/user';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly supabaseService: SupabaseService) {}
  private readonly PROFILES_TABLE = 'profiles';

  /**
   * Handles errors by logging the error message and throwing an RpcException.
   *
   * @private
   * @param {string} operation - The name of the operation where the error occurred.
   * @param {any} error - The error object that was caught. This can be any type of error, including a NestJS HttpException.
   * @throws {RpcException} - Throws an RpcException wrapping the original error.
   */
  private handleError(operation: string, error: any): never {
    this.logger.error(`Error at ${operation}: ${error.message}`);

    throw new RpcException(error);
  }

  async allUsers() {
    const { data,  error} = await this.supabaseService
      .getClient()
      .from(this.PROFILES_TABLE)
      .select(`id, email, username`)
      .order('username', { ascending: true })
      .single();
    if (error) {
      this.handleError(
        'fetch all users',
        new BadRequestException(error.message)
      );
    }

    return { data };
  }
  
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserProfileDto> {
    const { username, email } = updateUserDto;
    
    // Check if username or email already exists
    const { data: existingUser, error: fetchError } = await this.supabaseService
      .getClient()
      .from(this.PROFILES_TABLE)
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .neq('id', id)
      .single();

    if (fetchError) {
      this.handleError(
        'check existing user', 
        new BadRequestException(fetchError.message)
      );
    }

    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }

    // Proceed with the update
    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.PROFILES_TABLE)
      .update({ username, email })
      .eq('id', id)
      .single();
    if (error) {
      this.handleError(
        'update user', 
        new BadRequestException(error.message)
      );
    }
    return data;
  }
  
  async updateUserPrivilege(id: string) {
    const existingUser = await this.supabaseService.getClient().auth.getUser(id);
    if (!existingUser) {
      throw new BadRequestException('User not found');
    }
    
    // Get the current role of the user
    const { data: currentUserData, error: fetchError } = await this.supabaseService
      .getClient()
      .from(this.PROFILES_TABLE)
      .select('role')
      .eq('id', id)
      .single();

    if (fetchError) {
      this.handleError(
        'fetch user data', 
        new BadRequestException(fetchError.message)
      );
    }
    
    // Update the role
    const newRole = currentUserData.role == 'Admin' ? 'User' : 'Admin';
    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.PROFILES_TABLE)
      .update({ role: newRole })
      .eq('id', id)
      .single();

    if (error) {
      this.handleError(
        'update privilege', 
        new BadRequestException(error.message)
      );
    }
    return { data };
  }
  
  async deleteUser(id: string) {
    // Check if user exists
    const existingUser = await this.supabaseService.getClient().auth.getUser(id);
    if (!existingUser) {
      throw new BadRequestException('User not found');
    }
    
    // Delete the user
    await this.supabaseService.getClient().auth.admin.deleteUser(id);
    const { error } = await this.supabaseService
      .getClient()
      .from(this.PROFILES_TABLE)
      .delete()
      .eq('id', id);
      
    if (error) {
      this.handleError('delete user', error);
    }
    return true;
  }
}
