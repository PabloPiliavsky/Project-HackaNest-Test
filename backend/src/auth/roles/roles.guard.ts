import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { auth } from '../auth';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const session = await auth.api.getSession({
      headers: new Headers(request.headers as Record<string, string>)
    });

    if (!session || !session.user) {
      throw new UnauthorizedException('Need to be logged in to perform this action');
    }

    if (!requiredRoles.includes(session.user.role)) {
      throw new UnauthorizedException(`Access denied. You require one of the following roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
