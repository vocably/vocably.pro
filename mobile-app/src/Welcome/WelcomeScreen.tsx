import { NavigationProp } from '@react-navigation/native';
import { postOnboardingAction } from '@vocably/api';
import { GoogleLanguage } from '@vocably/model';
import { usePostHog } from 'posthog-react-native';
import { FC, useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import { facility } from '../facility';
import { mainPadding } from '../styles';
import { ScreenLayout } from '../ui/ScreenLayout';
import { UserMetadataContext } from '../UserMetadataContainer';
import { SlideCard } from './SlideCard';
import { SlideDesktopBrowser } from './SlideDesktopBrowser';
import { SlideLookUp } from './SlideLookUp';
import { SlideReverseTranslate } from './SlideReverseTranslate';
import { SlideSelectToTranslate } from './SlideSelectToTranslate';
import { useWelcomeTranslationPreset } from './useWelcomeTranslationPreset';
import { WelcomeForm } from './WelcomeForm';
import { WelcomePaginator } from './WelcomePaginator';

type Props = {
  navigation: NavigationProp<any>;
};

export const WelcomeScreen: FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const swiperRef = useRef<Swiper>(null);
  const posthog = usePostHog();
  const translationPresetState = useWelcomeTranslationPreset();
  const [swiperIndex, setSwiperIndex] = useState(0);
  const [onboardingActionTargetLanguage, setOnboardingActionTargetLanguage] =
    useState('');
  const { updateUserMetadata } = useContext(UserMetadataContext);

  if (translationPresetState.status === 'unknown') {
    return <></>;
  }

  const isSet =
    translationPresetState.preset.sourceLanguage &&
    translationPresetState.preset.translationLanguage;

  // @ts-ignore
  const totalSlides = swiperRef.current ? swiperRef.current.state.total : 0;

  const onSwipe = async (index: number) => {
    if (
      index === 1 &&
      translationPresetState.preset.translationLanguage !==
        onboardingActionTargetLanguage
    ) {
      setOnboardingActionTargetLanguage(
        translationPresetState.preset.translationLanguage
      );

      await updateUserMetadata({
        defaultTranslationLanguage:
          translationPresetState.preset.translationLanguage,
      });

      await postOnboardingAction({
        name: 'facilityOnboarded',
        payload: {
          facility,
          targetLanguage: translationPresetState.preset.translationLanguage,
        },
      });

      posthog.capture('welcome_submitted', {
        studyLanguage: translationPresetState.preset.sourceLanguage,
        nativeLanguage: translationPresetState.preset.translationLanguage,
      });
      posthog.capture('$set', {
        $set: {
          studyLanguage: translationPresetState.preset.sourceLanguage,
          nativeLanguage: translationPresetState.preset.translationLanguage,
          mobileOS: Platform.OS,
        },
      });
    }

    setSwiperIndex(index);
    posthog.capture('onboardingSwiped', {
      index,
    });
  };

  return (
    <ScreenLayout
      header={
        <Surface
          elevation={1}
          style={{
            paddingTop: insets.top + 16,
            paddingLeft: insets.left + mainPadding,
            paddingRight: insets.right + mainPadding,
            paddingBottom: 16,
            flexDirection: 'row',
          }}
        >
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <Button
              style={{
                opacity: swiperIndex > 0 ? 1 : 0,
                pointerEvents: swiperIndex > 0 ? 'auto' : 'none',
              }}
              onPress={() =>
                swiperRef.current && swiperRef.current.scrollBy(-1)
              }
            >
              {t('welcome.previous')}
            </Button>
          </View>

          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isSet && swiperIndex > 0 && (
              <WelcomePaginator
                slideIndex={swiperIndex}
                totalSlides={totalSlides}
              />
            )}
            {(!isSet || swiperIndex === 0) && (
              <Text style={{ fontWeight: 'bold' }}>{t('welcome.setup')}</Text>
            )}
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Button
              style={{
                opacity: isSet && swiperIndex > 0 ? 1 : 0,
                pointerEvents: isSet ? 'auto' : 'none',
              }}
              onPress={() => {
                posthog.capture('onboardingSkipped');
                navigation.goBack();
              }}
            >
              {t('welcome.skip')}
            </Button>
          </View>
        </Surface>
      }
      content={
        <View
          style={{
            flex: 1,
            position: 'relative',
          }}
        >
          <Swiper
            loop={false}
            showsPagination={false}
            ref={swiperRef}
            onIndexChanged={onSwipe}
          >
            <WelcomeForm></WelcomeForm>
            {isSet && (
              <SlideCard
                sourceLanguage={
                  translationPresetState.preset.sourceLanguage as GoogleLanguage
                }
                targetLanguage={
                  translationPresetState.preset
                    .translationLanguage as GoogleLanguage
                }
              />
            )}
            {isSet && (
              <SlideLookUp
                sourceLanguage={
                  translationPresetState.preset.sourceLanguage as GoogleLanguage
                }
                targetLanguage={
                  translationPresetState.preset
                    .translationLanguage as GoogleLanguage
                }
              />
            )}
            {isSet &&
              translationPresetState.preset.sourceLanguage !==
                translationPresetState.preset.translationLanguage && (
                <SlideReverseTranslate
                  sourceLanguage={
                    translationPresetState.preset
                      .sourceLanguage as GoogleLanguage
                  }
                  targetLanguage={
                    translationPresetState.preset
                      .translationLanguage as GoogleLanguage
                  }
                />
              )}
            {isSet && (
              <SlideSelectToTranslate
                sourceLanguage={
                  translationPresetState.preset.sourceLanguage as GoogleLanguage
                }
                targetLanguage={
                  translationPresetState.preset
                    .translationLanguage as GoogleLanguage
                }
              />
            )}
            {isSet && (
              <SlideDesktopBrowser
                sourceLanguage={
                  translationPresetState.preset.sourceLanguage as GoogleLanguage
                }
                targetLanguage={
                  translationPresetState.preset
                    .translationLanguage as GoogleLanguage
                }
              />
            )}
          </Swiper>
        </View>
      }
      footer={
        <>
          {isSet && (
            <Surface
              elevation={1}
              // @ts-ignore
              colors={[theme.colors.transparentSurface, theme.colors.surface]}
              style={{
                display: 'flex',
                bottom: 0,
                width: '100%',
                alignItems: 'stretch',
                justifyContent: 'center',
                paddingLeft: insets.left + mainPadding,
                paddingRight: insets.right + mainPadding,
                paddingBottom: insets.bottom + mainPadding,
                paddingTop: mainPadding,
              }}
            >
              {(totalSlides === 1 || swiperIndex < totalSlides - 1) && (
                <Button
                  mode="elevated"
                  elevation={3}
                  // @ts-ignore
                  buttonColor={theme.colors.aboveElevation}
                  onPress={() => {
                    swiperRef.current && swiperRef.current.scrollBy(1);
                  }}
                >
                  {t('welcome.next')}
                </Button>
              )}
              {totalSlides !== 1 && swiperIndex === totalSlides - 1 && (
                <Button
                  mode="elevated"
                  elevation={2}
                  buttonColor={theme.colors.primary}
                  textColor={theme.colors.onPrimary}
                  onPress={() => {
                    posthog.capture('onboardingDoneClicked');
                    navigation.goBack();
                  }}
                >
                  {t('welcome.goToApp')}
                </Button>
              )}
            </Surface>
          )}
        </>
      }
    ></ScreenLayout>
  );
};
