export const environmentLocal = {
  chromeExtensionId: 'mbpgmaflnlocikfiffhkjehhmnapkjgp',
  safariExtensionId: 'pro.vocably.Vocably.Extension (789D8NRAM6)',
  iosSafariExtensionId: 'pro.vocably.app.Vocably-for-Safari (789D8NRAM6)',
  sentryEnvironment: 'dev',
  wwwBaseUrl: 'https://dev.env.vocably.pro',
  revenueCatWeblink: 'https://pay.rev.cat/sandbox/nhscxmehgplykyuc/',
  paddleClientSideToken: 'test_36e6911acf8912e58cde7765548',
  paddleMonthlyPriceId: 'pri_01jyzzammkt25f6mmf8tjsxr9p',
  paddleYearlyPriceId: 'pri_01jz0ps01b1kcz9brm2877cbhg',
  paddleLifetimePriceId: 'pri_01jz0pve2gry96kxkrk4n237qa',
  auth: {
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_Tpn3gUQYg',
    userPoolWebClientId: '4j2gqrq3ne32jqee4ddu15p1g4',
    oauth: {
      domain: 'auth.dev.env.vocably.pro',
      scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
      responseType: 'code',
      options: {
        AdvancedSecurityDataCollectionFlag: true,
      },
    },
  },
  api: {
    publicBaseUrl: 'https://public-api.dev.env.vocably.pro',
    baseUrl: 'https://api.dev.env.vocably.pro',
    region: 'eu-central-1',
    cardsBucket: 'vocably-dev-cards',
  },
};
