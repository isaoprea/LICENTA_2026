import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException 
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // 1. Extrage cererea HTTP
    const request = context.switchToHttp().getRequest();
    
    // 2. Extrage utilizatorul (acesta este populat automat de JwtAuthGuard în request.user)
    const user = request.user;

    // 3. Verifică dacă utilizatorul există și dacă are rolul de ADMIN
    if (user && user.role === 'ADMIN') {
      return true; // Acces permis
    }

    // 4. Dacă nu este admin, aruncă o eroare de acces interzis
    throw new ForbiddenException('Acces refuzat: Această zonă este rezervată administratorilor.');
  }
}