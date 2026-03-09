import { ExtensionSettings } from '@vocably/extension-messages';
import { browserEnv } from './browserEnv';
import { detectLocale } from '@vocably/browser-i18n';

const defaultSettings: ExtensionSettings = {
  showOnDoubleClick: false,
  autoPlay: false,
  hideSelectionButton: false,
  autodetectLanguage: false,
  showOnHotKey: false,
  locale: detectLocale(),
};

export const getSettings = async (): Promise<ExtensionSettings> => {
  const { settings } = await browserEnv.storage.sync.get(['settings']);
  return settings ?? defaultSettings;
};

export const setSettings = async (
  partialSettings: Partial<ExtensionSettings>
): Promise<ExtensionSettings> => {
  const settings = {
    ...(await getSettings()),
    ...partialSettings,
  };

  await browserEnv.storage.sync.set({
    settings: settings,
  });

  return settings;
};
