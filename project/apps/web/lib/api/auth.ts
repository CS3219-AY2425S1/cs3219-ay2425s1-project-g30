import { SignInDto, SignUpDto } from '@repo/dtos/auth';
import { UserSessionDto, UserDataDto } from '@repo/dtos/users';

import { apiCall } from './apiClient';

export const signUp = async (signUpDto: SignUpDto): Promise<UserSessionDto> =>
  await apiCall('post', '/api/auth/signup', signUpDto);

export const signIn = async (signInDto: SignInDto): Promise<UserSessionDto> =>
  await apiCall('post', '/api/auth/signin', signInDto);

export const signOut = async () => await apiCall<void>('post', '/auth/signout');

export const me = async (): Promise<UserDataDto> =>
  await apiCall('get', '/auth/me');
