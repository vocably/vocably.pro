import { useNavigation } from '@react-navigation/native';
import { GoogleLanguage, languageList } from '@vocably/model';
import { trimLanguage } from '@vocably/sulna';
import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Divider, Text, useTheme } from 'react-native-paper';
import { CardListItem } from '../CardListItem';
import { TranslationPresetForm } from '../LookUpScreen/TranslationPresetForm';
import { getOnboardingData } from '../Onboarding/getOnboardingData';
import { SearchInput } from '../SearchInput';
import { Telephone } from '../Telephone';
import { useColorScheme } from '../useColorScheme';
import { WelcomeScrollView } from './WelcomeScrollView';

type Props = {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
};

export const SlideReverseTranslate: FC<Props> = ({
  sourceLanguage,
  targetLanguage,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const onboardingData = getOnboardingData(sourceLanguage, targetLanguage);
  const theme = useTheme();

  return (
    <WelcomeScrollView style={{ gap: 16 }}>
      <Text style={{ fontSize: 22, textAlign: 'center' }}>
        <Trans
          i18nKey="welcome.slideReverseTranslate.intro"
          values={{
            sourceLanguage: t(`language.in_${sourceLanguage}`),
            targetLanguage: t(`language.in_${targetLanguage}`),
          }}
          components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }}
        ></Trans>
      </Text>

      <View style={{ width: '100%', alignItems: 'center' }}>
        <Telephone
          colorScheme={colorScheme}
          style={{
            height: 350,
            maxWidth: 310,
          }}
        >
          <View pointerEvents="none">
            <View style={{ marginBottom: 16, marginTop: 44 }}>
              <TranslationPresetForm
                navigation={navigation}
                preset={{
                  sourceLanguage:
                    onboardingData.reverseTranslationExample.sourceLanguage,
                  translationLanguage:
                    onboardingData.reverseTranslationExample.targetLanguage,
                  isReverse: false,
                }}
                onChange={() => {}}
                languagePairs={{}}
              />
            </View>
            <View style={{ marginBottom: 8 }}>
              <SearchInput
                value={onboardingData.reverseTranslationExample.text}
                placeholder={''}
                onChange={() => {}}
                onSubmit={() => {}}
              />
            </View>
            {onboardingData.reverseTranslationExample.results.map(
              (card, index) => (
                <View key={index}>
                  {index > 0 && <Divider bold={true} />}
                  <CardListItem style={{ paddingVertical: 16 }} card={card} />
                </View>
              )
            )}
          </View>
        </Telephone>
        <LinearGradient
          locations={[0.1, 0.4]}
          // @ts-ignore
          colors={[theme.colors.transparentSurface, theme.colors.surface]}
          style={{
            position: 'absolute',
            display: 'flex',
            bottom: 0,
            width: '100%',
            alignItems: 'stretch',
            justifyContent: 'center',
            height: 50,
          }}
        ></LinearGradient>
      </View>
    </WelcomeScrollView>
  );
};
