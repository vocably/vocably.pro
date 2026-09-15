/**
 * The email screens live in two stacks: the logged-out AuthNavigation, where
 * the entry point is `login`, and RootModalStack, where an anonymous user
 * reaches them from `LoginModal`.
 *
 * After a sign-in, returning to LoginModal matters: it is the screen that
 * migrates the anonymous user's decks and then calls `onLogin`.
 */
const loginRouteNames = ['login', 'LoginModal'];

export const popToLoginScreen = (navigation: any) => {
  const routes: { name: string }[] = navigation.getState()?.routes ?? [];
  const loginRoute = routes.find((route) =>
    loginRouteNames.includes(route.name)
  );

  if (loginRoute) {
    // Without `merge`, popTo replaces the route's params with the ones passed
    // here, which would drop LoginModal's `onLogin`.
    navigation.popTo(loginRoute.name, undefined, { merge: true });
    return;
  }

  if (navigation.canGoBack()) {
    navigation.goBack();
  }
};
