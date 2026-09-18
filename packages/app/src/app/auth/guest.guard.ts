import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Keeps signed-in users away from the sign-up, verification and password
 * reset screens.
 */
export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);

  return inject(AuthService).isLoggedIn$.pipe(
    take(1),
    map((isLoggedIn) => (isLoggedIn ? router.createUrlTree(['/']) : true))
  );
};
