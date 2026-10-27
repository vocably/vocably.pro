import { useNavigation } from '@react-navigation/native';
import React, { FC, PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as RNLocalize from 'react-native-localize';
import { Button, Text } from 'react-native-paper';
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { saveSelectedLanguageToStorage } from '../languages/LanguagesContainer';
import { SourceLanguageButton } from '../SourceLanguageButton';
import { mainPadding } from '../styles';
import { TargetLanguageButton } from '../TargetLanguageButton';
import { useAppTheme } from '../ThemeProvider';
import { Preset } from '../TranslationPreset/TranslationPresetContainer';
import { storeSelectedLanguage } from '../TranslationPreset/useTranslationPresetSelectedLanguage';

type Greeting = {
  text: string;
  top: `${number}%`;
  left: `${number}%`;
  size: number;
  accent: boolean;
};

// Russian speakers who don't also use Ukrainian are greeted in Russian.
const getEastSlavicGreeting = (): string => {
  const languageCodes = RNLocalize.getLocales().map(
    (locale) => locale.languageCode
  );
  return languageCodes.includes('ru') && !languageCodes.includes('uk')
    ? 'Привет'
    : 'Привіт';
};

const greetings: Greeting[] = [
  { text: 'Hello', top: '4%', left: '6%', size: 17, accent: true },
  { text: 'Hola', top: '0%', left: '60%', size: 15, accent: false },
  { text: 'こんにちは', top: '2%', left: '29%', size: 15, accent: false },
  { text: 'Bonjour', top: '30%', left: '34%', size: 20, accent: true },
  {
    text: getEastSlavicGreeting(),
    top: '34%',
    left: '2%',
    size: 14,
    accent: false,
  },
  { text: 'Ciao', top: '22%', left: '78%', size: 14, accent: false },
  { text: '你好', top: '64%', left: '58%', size: 15, accent: true },
  { text: 'Merhaba', top: '66%', left: '12%', size: 16, accent: false },
  { text: 'Olá', top: '58%', left: '42%', size: 13, accent: false },
  { text: 'Xin chào', top: '86%', left: '30%', size: 13, accent: false },
  { text: 'Hallo', top: '84%', left: '76%', size: 14, accent: false },
];

const FloatingGreeting: FC<{ greeting: Greeting; index: number }> = ({
  greeting,
  index,
}) => {
  const theme = useAppTheme();
  const offset = useSharedValue(0);

  useEffect(() => {
    const duration = 2200 + (index % 4) * 400;
    offset.value = withDelay(
      index * 150,
      withRepeat(
        withSequence(
          withTiming(-5, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(5, { duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, [offset, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(index * 90).duration(500)}
      style={[
        {
          position: 'absolute',
          top: greeting.top,
          left: greeting.left,
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 999,
          backgroundColor: greeting.accent
            ? theme.colors.primary
            : theme.colors.inversePrimary,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontSize: greeting.size,
            fontWeight: greeting.accent ? '600' : '400',
            color: greeting.accent
              ? theme.colors.onPrimary
              : theme.colors.primary,
          }}
        >
          {greeting.text}
        </Text>
      </View>
    </Animated.View>
  );
};

const cloudHeight = 150;
const cloudMarginBottom = 16;
const contentGap = 16;

const GreetingsCloud: FC = () => (
  <Animated.View
    layout={LinearTransition}
    style={{ height: cloudHeight, marginBottom: cloudMarginBottom }}
  >
    {greetings.map((greeting, index) => (
      <FloatingGreeting key={greeting.text} greeting={greeting} index={index} />
    ))}
  </Animated.View>
);

const StepCard: FC<
  PropsWithChildren<{ step: number; done: boolean; title: string }>
> = ({ step, done, title, children }) => {
  const theme = useAppTheme();

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      layout={LinearTransition}
      style={{
        borderRadius: 20,
        padding: 20,
        gap: 12,
        backgroundColor: theme.colors.elevation.level1,
        borderWidth: 1,
        borderColor: done ? theme.colors.primary : theme.colors.inversePrimary,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryVariant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {done ? (
            <Icon name="check" size={18} color={theme.colors.onPrimary} />
          ) : (
            <Text
              allowFontScaling={false}
              style={{
                color: theme.colors.onPrimary,
                fontWeight: '700',
                fontSize: 15,
              }}
            >
              {step}
            </Text>
          )}
        </LinearGradient>
        <Text
          style={{
            flex: 1,
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.secondary,
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </Animated.View>
  );
};

type Props = {};

export const LanguageScreen: FC<Props> = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');

  const onSourceLanguageChange = async (preset: Preset) => {
    setSourceLanguage(preset.sourceLanguage);
  };
  const onTargetLanguageChange = async (preset: Preset) => {
    setTargetLanguage(preset.translationLanguage);
  };

  const savePreferencesAndProceed = async () => {
    await storeSelectedLanguage(sourceLanguage);
    await saveSelectedLanguageToStorage(sourceLanguage);

    navigation.navigate('discovery', {
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
    });
  };

  return (
    <ScrollView
      style={{
        flex: 1,
      }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
        paddingLeft: insets.left + mainPadding,
        paddingRight: insets.right + mainPadding,
        // While the first question is alone, balance the greetings cloud with
        // equal space below, so the question sits in the middle of the screen.
        paddingBottom: Math.max(
          insets.bottom + mainPadding,
          targetLanguage ? 0 : cloudHeight + cloudMarginBottom + contentGap
        ),
        gap: contentGap,
      }}
    >
      <GreetingsCloud />
      <StepCard
        step={1}
        done={!!targetLanguage}
        title={t('languageScreen.motherTongueQuestion')}
      >
        <Text>{t('languageScreen.motherTongueHint')}</Text>
        <TargetLanguageButton
          navigation={navigation}
          preset={{
            sourceLanguage: sourceLanguage,
            translationLanguage: targetLanguage,
            isReverse: false,
          }}
          onChange={onTargetLanguageChange}
          languagePairs={{}}
        />
      </StepCard>
      {targetLanguage && (
        <StepCard
          step={2}
          done={!!sourceLanguage}
          title={t('welcome.questionStudyLanguage')}
        >
          <Text>{t('welcome.multipleLanguagesHint')}</Text>
          <SourceLanguageButton
            navigation={navigation}
            existingLanguages={[]}
            preset={{
              sourceLanguage: sourceLanguage,
              translationLanguage: '',
              isReverse: false,
            }}
            onChange={onSourceLanguageChange}
            languagePairs={{}}
            emptyText={t('languageSelector.select')}
          />
        </StepCard>
      )}
      {targetLanguage && sourceLanguage && (
        <Animated.View
          entering={FadeInDown.springify().damping(18)}
          layout={LinearTransition}
          style={{ marginTop: 8 }}
        >
          <Button
            testID="language-screen-next"
            mode="contained"
            buttonColor={theme.colors.primaryVariant}
            icon="arrow-right"
            contentStyle={{ flexDirection: 'row-reverse', height: 52 }}
            labelStyle={{ fontSize: 17 }}
            onPress={savePreferencesAndProceed}
          >
            {t('welcome.next')}
          </Button>
        </Animated.View>
      )}
    </ScrollView>
  );
};
