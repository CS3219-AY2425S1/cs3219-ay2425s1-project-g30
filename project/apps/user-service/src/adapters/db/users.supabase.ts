import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { collectionMetadataDto } from '@repo/dtos/metadata';
import {
  ChangePasswordDto,
  UpdateUserDto,
  UserCollectionDto,
  UserDataDto,
  UserFiltersDto,
} from '@repo/dtos/users';
import { ROLE } from '@repo/dtos/generated/enums/auth.enums';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UsersRepository } from 'src/domain/ports/users.repository';

@Injectable()
export class SupabaseUsersRepository implements UsersRepository {
  private supabaseUrl: string;
  private supabaseKey: string;
  private supabase: SupabaseClient;

  private readonly PROFILES_TABLE = 'profiles';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // To pass the access token for authenticated requests
  private getSupabaseClientWithToken(accessToken: string) {
    const supabase = createClient(this.supabaseUrl, this.supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
    return supabase;
  }

  async findAll(filters: UserFiltersDto): Promise<UserCollectionDto> {
    const { email, username, offset, limit } = filters;

    let queryBuilder = this.supabase
      .from(this.PROFILES_TABLE)
      .select('*', { count: 'exact' });

    if (email || username) {
      const orFilter = [];
      if (email) {
        orFilter.push(`email.eq.${email}`);
      }
      if (username) {
        orFilter.push(`username.eq.${username}`);
      }
      if (orFilter.length > 0) {
        queryBuilder = queryBuilder.or(orFilter.join(','));
      }
    }

    const totalCountQuery = queryBuilder;

    let dataQuery = queryBuilder;
    if (limit) {
      if (offset) {
        dataQuery = dataQuery.range(offset, offset + limit - 1); // Supabase range is inclusive
      } else {
        dataQuery = dataQuery.limit(limit);
      }
    }

    // Execute the data query
    const { data: users, error } = await dataQuery;

    // Execute the total count query
    const { count: totalCount, error: totalCountError } = await totalCountQuery;

    if (error || totalCountError) {
      throw error || totalCountError;
    }

    const metadata: collectionMetadataDto = {
      count: users ? users.length : 0,
      totalCount: totalCount ?? 0,
    };

    return {
      metadata,
      users,
    } as UserCollectionDto;
  }

  async findById(id: string): Promise<UserDataDto> {
    const { data, error } = await this.supabase
      .from(this.PROFILES_TABLE)
      .select()
      .eq('id', id)
      .single<UserDataDto>();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateById(body: {
    updateUserDto: UpdateUserDto;
    accessToken: string;
  }): Promise<UserDataDto> {
    const { id, email: newEmail, username: newUsername } = body.updateUserDto;

    // Use Supabase client with access token
    const supabase = this.getSupabaseClientWithToken(body.accessToken);

    // Update user details in auth table
    const { error: authError } = await supabase.auth.updateUser({
      email: newEmail,
      data: { username: newUsername },
    });

    if (authError) {
      throw authError;
    }

    // Update user details in profiles table
    const { data, error } = await this.supabase
      .from(this.PROFILES_TABLE)
      .update({
        email: newEmail,
        username: newUsername,
      })
      .eq('id', id)
      .select()
      .single<UserDataDto>();

    if (error) {
      throw error;
    }
    return data;
  }

  async updatePrivilegeById(id: string): Promise<any> {
    const user = await this.findById(id);
    const newRole = user.role == ROLE.Admin ? ROLE.User : ROLE.Admin;

    // Update user role in auth table
    const { error: authError } = await this.supabase.auth.admin.updateUserById(
      id,
      {
        role: newRole.toLowerCase(),
      },
    );

    if (authError) {
      throw authError;
    }

    // Update user role in profiles table
    const { data, error } = await this.supabase
      .from(this.PROFILES_TABLE)
      .update({ role: newRole })
      .eq('id', id)
      .select()
      .single<UserDataDto>();

    if (error) {
      throw error;
    }

    console.error(data);

    return data;
  }

  async changePasswordById(body: {
    changePasswordDto: ChangePasswordDto;
    accessToken: string;
  }): Promise<UserDataDto> {
    const user = await this.findById(body.changePasswordDto.id);

    // Use Supabase client with access token
    const supabase = this.getSupabaseClientWithToken(body.accessToken);

    // Update user details in auth table
    const { error: authError } = await supabase.auth.updateUser({
      password: body.changePasswordDto.newPassword,
    });

    if (authError) {
      throw authError;
    }

    return user;
  }

  async deleteById(id: string): Promise<UserDataDto> {
    // Delete user from auth table
    const { error: authError } = await this.supabase.auth.admin.deleteUser(id);
    if (authError) {
      throw authError;
    }

    // Delete user from profiles table
    const { data, error } = await this.supabase
      .from(this.PROFILES_TABLE)
      .delete()
      .eq('id', id)
      .single<UserDataDto>();

    if (error) {
      throw error;
    }

    return data;
  }
}
