import { Route } from '@react-navigation/native';
import { GoogleLanguage, isGoogleLanguage } from '@vocably/model';
import { usePostHog } from 'posthog-react-native';
import React, { FC, useContext, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import {
  createDefaultLanguageContainerDeck,
  saveDecksToStorage,
} from '../languages/LanguagesContainer';
import { mainPadding } from '../styles';
import { AuthContext } from './AuthContainer';
import { storeLanguagePairs } from '../TranslationPreset/useLanguagePairs';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useAppTheme } from '../ThemeProvider';
import { FormText } from '../ui/FormText';

export type RouteParams = {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
};

type Props = {
  route: Route<string, any>;
};

type Source = {
  value: string;
  label: string;
  icon: string;
};

const SourceTile: FC<{
  source: Source;
  index: number;
  selected: boolean;
  loading: boolean;
  disabled: boolean;
  fullWidth: boolean;
  onPress: () => void;
}> = ({ source, index, selected, loading, disabled, fullWidth, onPress }) => {
  const theme = useAppTheme();
  const color = selected ? theme.colors.onPrimary : theme.colors.primary;

  const content = (
    <>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected
            ? 'rgba(255, 255, 255, 0.2)'
            : theme.colors.inversePrimary,
        }}
      >
        <Icon name={source.icon} size={20} color={color} />
      </View>
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          fontSize: 16,
          fontWeight: '500',
          color: selected ? theme.colors.onPrimary : theme.colors.secondary,
        }}
      >
        {source.label}
      </Text>
      {loading && <ActivityIndicator size={16} color={color} />}
    </>
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(150 + index * 60)
        .springify()
        .damping(18)}
      style={{
        flexBasis: fullWidth ? '100%' : '40%',
        flexGrow: 1,
      }}
    >
      <Pressable
        testID={`discovery-source-${source.value}`}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={source.label}
        accessibilityState={{ selected, disabled }}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.97 : 1 }],
        })}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            padding: 12,
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: selected
              ? theme.colors.primary
              : theme.colors.inversePrimary,
            backgroundColor: theme.colors.elevation.level1,
          }}
        >
          {selected && (
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryVariant]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          {content}
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const DiscoverySurveyScreen: FC<Props> = ({ route }) => {
  const { sourceLanguage, targetLanguage } = route.params as RouteParams;

  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);

  const { createAnonymousUser } = useContext(AuthContext);

  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [otherSource, setOtherSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showOther = selectedSource === 'Other';

  const sources: Source[] = [
    { value: 'Reddit', label: 'Reddit', icon: 'reddit' },
    { value: 'LinkedIn', label: 'LinkedIn', icon: 'linkedin' },
    { value: 'Google', label: 'Google', icon: 'google' },
    { value: 'AI', label: 'AI', icon: 'creation' },
    Platform.OS === 'android'
      ? {
          value: 'Play Store',
          label: t('discoverySurvey.sources.playStore'),
          icon: 'google-play',
        }
      : {
          value: 'App Store',
          label: t('discoverySurvey.sources.appStore'),
          icon: 'apple',
        },
    {
      value: 'From a friend',
      label: t('discoverySurvey.sources.fromAFriend'),
      icon: 'account-heart-outline',
    },
    {
      value: 'Other',
      label: t('discoverySurvey.sources.other'),
      icon: 'dots-horizontal',
    },
  ];

  const startUsingTheApp = async (
    source?: string,
    { skipAnalytics = false }: { skipAnalytics?: boolean } = {}
  ) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isGoogleLanguage(sourceLanguage) && isGoogleLanguage(targetLanguage))
        await storeLanguagePairs({
          [sourceLanguage]: {
            translationLanguage: targetLanguage,
            availableLanguages: [targetLanguage],
          },
        });

      await createAnonymousUser();
      await saveDecksToStorage({
        [sourceLanguage]: createDefaultLanguageContainerDeck(sourceLanguage),
      });

      if (skipAnalytics) {
        return;
      }

      posthog.capture('anonymous-registration-form-subbmitted', {
        nativeLanguage: targetLanguage,
        studyLanguage: sourceLanguage,
        mobileOS: Platform.OS,
        discovered: source ?? selectedSource,
        discoveredOther: otherSource,
      });

      posthog.capture('$set', {
        $set: {
          nativeLanguage: targetLanguage,
          studyLanguage: sourceLanguage,
          mobileOS: Platform.OS,
          discovered: source ?? selectedSource,
          discoveredOther: otherSource,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSelect = async (source: string) => {
    setSelectedSource(source);
    if (source !== 'Other') {
      await startUsingTheApp(source);
      return;
    }
  };

  const onNext = async () => {
    await startUsingTheApp();
  };

  // Hidden shortcut for testing on prod: tapping the compass icon three times
  // skips the survey without sending analytics events.
  const compassTaps = useRef({ count: 0, lastTapAt: 0 });
  const onCompassPress = async () => {
    const now = Date.now();
    const taps = compassTaps.current;
    taps.count = now - taps.lastTapAt < 1000 ? taps.count + 1 : 1;
    taps.lastTapAt = now;

    if (taps.count < 3) {
      return;
    }

    taps.count = 0;
    await startUsingTheApp(undefined, { skipAnalytics: true });
  };

  // Keeps the "Other" input and the next button visible when they appear
  // and when the keyboard shrinks the scroll view.
  const scrollToOther = () => {
    if (showOther) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'android' ? 64 : 94}
    >
      <ScrollView
        ref={scrollRef}
        style={{
          flex: 1,
        }}
        keyboardShouldPersistTaps="handled"
        onLayout={scrollToOther}
        onContentSizeChange={scrollToOther}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'stretch',
          justifyContent: 'center',
          paddingLeft: insets.left + mainPadding,
          paddingRight: insets.right + mainPadding,
          paddingBottom: insets.bottom + mainPadding,
          gap: 24,
        }}
      >
        <Animated.View
          entering={FadeIn.duration(500)}
          style={{ alignItems: 'center', gap: 12 }}
        >
          <Pressable testID="discovery-skip" onPress={onCompassPress}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryVariant]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                name="compass-outline"
                size={34}
                color={theme.colors.onPrimary}
              />
            </LinearGradient>
          </Pressable>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 22,
              fontWeight: '600',
              color: theme.colors.secondary,
            }}
          >
            {t('discoverySurvey.question')}
          </Text>
          <Text style={{ textAlign: 'center', opacity: 0.8 }}>
            {t('discoverySurvey.hint')}
          </Text>
        </Animated.View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {sources.map((source, index) => (
            <SourceTile
              key={source.value}
              source={source}
              index={index}
              selected={selectedSource === source.value}
              loading={
                isSubmitting &&
                selectedSource === source.value &&
                source.value !== 'Other'
              }
              disabled={isSubmitting}
              fullWidth={index === sources.length - 1}
              onPress={() => onSelect(source.value)}
            />
          ))}
        </View>
        {showOther && (
          <Animated.View
            entering={FadeInDown.springify().damping(18)}
            layout={LinearTransition}
            style={{
              gap: 16,
            }}
          >
            <FormText
              testID="discovery-other-input"
              label={t('discoverySurvey.whatIsIt')}
              autoFocus={true}
              value={otherSource}
              onChangeText={setOtherSource}
              onSubmitEditing={onNext}
              returnKeyType="done"
              placeholder={t('discoverySurvey.typePlaceholder')}
            />
            <Button
              testID="discovery-next"
              mode="contained"
              buttonColor={theme.colors.primaryVariant}
              icon="arrow-right"
              contentStyle={{ flexDirection: 'row-reverse', height: 52 }}
              labelStyle={{ fontSize: 17 }}
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={onNext}
            >
              {t('welcome.next')}
            </Button>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
