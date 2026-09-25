import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const requiredRole = this.reflector.get<string>(
      'role',
      context.getHandler(),
    );

    if (!req.user) {
      throw new UnauthorizedException('user not authenticated');
    }
    const userrole = req.user.role;
    if (userrole !== requiredRole && userrole !== 'ADMIN') {
      throw new UnauthorizedException('not authorized to access this route');
    }

    return true;
  }
}
