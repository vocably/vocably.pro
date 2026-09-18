import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { setIntendedDestination } from './intendedDestination';

@Injectable({
  providedIn: 'root',
})
export class CognitoAuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    public router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const redirectTo: string =
      next.data['unauthenticatedRedirect'] ?? 'sign-in';

    return this.auth.isLoggedIn$.pipe(
      tap(async (loggedIn) => {
        if (!loggedIn) {
          setIntendedDestination(location.href);
          await this.router.navigate([redirectTo], { replaceUrl: true });
        }
      })
    );
  }
}
