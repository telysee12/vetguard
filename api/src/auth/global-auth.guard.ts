import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  private readonly publicRoutes: { method: string; pathRegex: RegExp }[] = [
    { method: 'POST', pathRegex: /^\/api\/v1\/auth\/login$/ },
    { method: 'POST', pathRegex: /^\/api\/v1\/register$/ },
    { method: 'POST', pathRegex: /^\/api\/v1\/password-reset\// },
    { method: 'POST', pathRegex: /^\/api\/v1\/upload$/ },
    // Public endpoint for viewing approved basic vets (for public vet directory)
    { method: 'GET', pathRegex: /^\/api\/v1\/register\/public\/basic-vets$/ },
    // allow static uploads
    { method: 'GET', pathRegex: /^\/uploads\// },
  ];

  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const method = (req.method || 'GET').toUpperCase();
    const path = (req.originalUrl || req.url || '') as string;

    // allow if matches public route
    if (this.publicRoutes.some(r => r.method === method && r.pathRegex.test(path))) {
      return true;
    }

    const authHeader: string | undefined = req.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }
    try {
      const payload = this.jwt.verify(token);
      req.user = { sub: payload.sub, email: payload.email, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}


