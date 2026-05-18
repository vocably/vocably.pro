import React, { FC, ReactNode, useContext } from 'react';
import { Loader } from '../loaders/Loader';
import { AuthContext } from './AuthContainer';
import { AuthNavigation } from './AuthNavigation';
import { LoggedOutForm } from './LoggedOutForm';
import { Sentry } from '../BetterSentry';

export const AuthFlow: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  const authStatus = useContext(AuthContext);

  if (authStatus.status === 'undefined') {
    Sentry.captureException(
      new Error(
        'The auth status is undefined, which should not happen. Weird...'
      )
    );
    return <Loader>Authenticating...</Loader>;
  }

  if (
    authStatus.status === 'logged-in' ||
    authStatus.status === 'anonymous-logged-in'
  ) {
    return <>{children}</>;
  }

  if (authStatus.login.reason === 'logged-out') {
    return <LoggedOutForm onSignOut={() => authStatus.reset()} />;
  }

  return <AuthNavigation />;
};
