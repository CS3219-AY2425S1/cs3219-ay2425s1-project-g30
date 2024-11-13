import { SetMetadata } from '@nestjs/common';
import { ROLE } from '@repo/dtos/generated/enums/auth.enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ROLE[]) => SetMetadata(ROLES_KEY, roles);
