import React, { FC, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader } from '../loaders/Loader';
import { AuthContext } from './AuthContainer';
import { AuthNavigation } from './AuthNavigation';
import { LoggedOutForm } from './LoggedOutForm';

export const AuthFlow: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  const { t } = useTranslation();
  const authStatus = useContext(AuthContext);

  if (authStatus.status === 'undefined') {
    return <Loader>{t('auth.authenticating')}</Loader>;
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
