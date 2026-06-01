import { FC } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Divider } from 'react-native-paper';
import { i18n } from '../i18n';
import { setAppLocaleOverride } from '../i18n/storage';
import { SUPPORTED_LOCALES, SupportedLocale } from '../i18n/supportedLocales';
import { CustomScrollView } from '../ui/CustomScrollView';
import { CustomSurface } from '../ui/CustomSurface';
import { ListItem } from '../ui/ListItem';

export const AppLanguageScreen: FC = () => {
  const { i18n: i18nFromHook } = useTranslation();
  const current = i18nFromHook.language;

  const onPick = async (code: SupportedLocale) => {
    if (code === current) {
      return;
    }
    await setAppLocaleOverride(code);
    await i18n.changeLanguage(code);
  };

  return (
    <CustomScrollView>
      <CustomSurface>
        {SUPPORTED_LOCALES.map((locale, idx) => {
          const order =
            SUPPORTED_LOCALES.length === 1
              ? 'single'
              : idx === 0
                ? 'first'
                : idx === SUPPORTED_LOCALES.length - 1
                  ? 'last'
                  : 'middle';
          return (
            <View key={locale.code}>
              <ListItem
                order={order}
                leftIcon="translate"
                title={locale.label}
                rightIcon={locale.code === current ? 'check' : ''}
                onPress={() => onPick(locale.code)}
              />
              {idx < SUPPORTED_LOCALES.length - 1 && <Divider />}
            </View>
          );
        })}
      </CustomSurface>
    </CustomScrollView>
  );
};
