import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE } from '@repo/dtos/generated/enums/auth.enums';
import { ROLES_KEY } from './roles.decorator';

// Must be used in conjunction with AuthGuard, so that the user will be populated with role
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (requiredRoles.some((role) => user.role == role)) {
      return true;
    } else {
      throw new ForbiddenException(
        'You do not have permission for this resource',
      );
    }
  }
}
