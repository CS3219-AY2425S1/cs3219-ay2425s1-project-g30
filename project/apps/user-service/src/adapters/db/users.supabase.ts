import { Injectable } from '@nestjs/common';
import { EnvService } from 'src/env/env.service';
import { ROLE } from '@repo/dtos/generated/enums/auth.enums';
import { collectionMetadataDto } from '@repo/dtos/metadata';
import {
  UpdateUserDto,
  UserCollectionDto,
  UserDataDto,
  UserFiltersDto,
} from '@repo/dtos/users';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UsersRepository } from 'src/domain/ports/users.repository';
@Injectable()
export class SupabaseUsersRepository implements UsersRepository {
  private supabase: SupabaseClient;

  private readonly PROFILES_TABLE = 'profiles';

  constructor(private envService: EnvService) {
    const supabaseUrl = this.envService.get('SUPABASE_URL');
    const supabaseKey = this.envService.get('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
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

  async updateById(userDetails: UpdateUserDto): Promise<UserDataDto> {
    const {
      id,
      email: newEmail,
      username: newUsername,
      password: newPassword,
    } = userDetails;

    // Update user email and/or password in auth table
    const { error: authError } = await this.supabase.auth.updateUser({
      email: newEmail,
      password: newPassword,
      data: { username: newUsername },
    });

    if (authError) {
      throw authError;
    }

    // Update user details in profiles table
    const updateData: any = {};
    if (newEmail) {
      updateData.email = newEmail;
    }
    if (newUsername) {
      updateData.username = newUsername;
    }

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
