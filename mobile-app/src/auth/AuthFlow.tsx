import React, { FC, ReactNode, useContext } from 'react';
import { Loader } from '../loaders/Loader';
import { AuthContext } from './AuthContainer';
import { AuthNavigation } from './AuthNavigation';
import { LoggedOutForm } from './LoggedOutForm';

export const AuthFlow: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  const authStatus = useContext(AuthContext);

  if (authStatus.status === 'undefined') {
    return <Loader>Authenticating...</Loader>;
  }

  if (
    authStatus.status === 'logged-in' ||
    authStatus.status === 'anonymous-logged-in'
  ) {
    return <>{children}</>;
  }

  if (authStatus.login.reason === 'logged-out') {
    return <LoggedOutForm />;
  }

  return <AuthNavigation />;
};
