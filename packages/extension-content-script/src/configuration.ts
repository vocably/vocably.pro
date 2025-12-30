export type ContentScriptConfiguration = {
  askForRatingEnabled: boolean;
  displayMobileLookupButton: boolean;
  allowFirstTranslationCongratulation: boolean;
  webPaymentLink: string;
};

export let contentScriptConfiguration: ContentScriptConfiguration = {
  askForRatingEnabled: false,
  displayMobileLookupButton: false,
  allowFirstTranslationCongratulation: false,
  webPaymentLink: 'https://app.vocably.pro/subscribe',
};

export const configureContentScript = (
  configuration: Partial<ContentScriptConfiguration>
) => {
  contentScriptConfiguration = {
    ...contentScriptConfiguration,
    ...configuration,
  };
};
