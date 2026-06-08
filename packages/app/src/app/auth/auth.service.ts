import { Injectable } from '@angular/core';
import { Auth, CognitoUser } from '@aws-amplify/auth';
import { mapUserAttributes, UserData } from '@vocably/model';
import { get } from 'lodash-es';
import {
  catchError,
  from,
  map,
  of,
  ReplaySubject,
  retry,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn$ = new ReplaySubject<boolean>(1);
  currentUser$ = new ReplaySubject<CognitoUser>(1);
  userData$ = new ReplaySubject<UserData>(1);

  fetchUserData$ = this.currentUser$.pipe(
    switchMap(async (user) => {
      return {
        user,
        attributes: await Auth.userAttributes(user),
      };
    }),
    map(mapUserAttributes)
  );

  public waitForSubscriptionHook$ = this.fetchUserData$.pipe(
    tap((userData) => {
      this.userData$.next(userData);
    }),
    switchMap(() => {
      return this.refreshToken();
    }),
    take(1),
    retry({
      delay: 1000,
      count: 20,
    })
  );

  private refreshUserData$ = new Subject();

  constructor() {
    from(Auth.currentAuthenticatedUser())
      .pipe(catchError(() => of(false)))
      .subscribe((userOrFalse) => {
        this.isLoggedIn$.next(userOrFalse !== false);
        if (userOrFalse === false) {
          return;
        }

        this.currentUser$.next(userOrFalse);
      });

    const refreshUserData$ = this.fetchUserData$.pipe(
      tap((userData) => {
        this.userData$.next(userData);
      })
    );

    this.refreshUserData$.pipe(switchMap(() => refreshUserData$)).subscribe();
    refreshUserData$.subscribe();
  }

  async signIn() {
    return Auth.federatedSignIn();
  }

  async signOut() {
    localStorage.removeItem('onboardedLanguages');
    return Auth.signOut();
  }

  async refreshToken(): Promise<void> {
    const cognitoUser = await Auth.currentAuthenticatedUser();
    const currentSession = await Auth.currentSession();
    return new Promise((resolve, reject) => {
      cognitoUser.refreshSession(
        currentSession.getRefreshToken(),
        (error: any) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async isPaidGroup(): Promise<boolean> {
    const user = await Auth.currentAuthenticatedUser().catch(() => false);

    if (!user) {
      return false;
    }

    return get(
      user,
      'signInUserSession.accessToken.payload.cognito:groups',
      []
    ).includes('paid');
  }
}
