import { NavigationProp } from '@react-navigation/native';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, useWindowDimensions, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LanguagesContext } from '../languages/LanguagesContainer';
import { SourceLanguageButton } from '../SourceLanguageButton';
import { TargetLanguageButton } from '../TargetLanguageButton';
import { Preset } from '../TranslationPreset/TranslationPresetContainer';
import { LanguagePairs } from '../TranslationPreset/useLanguagePairs';

type Props = {
  navigation: NavigationProp<any>;
  preset: Preset;
  onChange: (preset: Preset) => void;
  languagePairs: LanguagePairs;
};

const reverseButtonWidth = 65;

export const TranslationPresetForm: FC<Props> = ({
  navigation,
  preset,
  onChange,
  languagePairs,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { languages: existingDeckLanguages } = useContext(LanguagesContext);

  const clickReverse = useCallback(() => {
    onChange({
      ...preset,
      isReverse: !preset.isReverse,
    });
  }, [preset]);

  const { width: windowWidth } = useWindowDimensions();
  const [presetContainerWidth, setPresetContainerWidth] = useState(
    windowWidth - 16 * 2
  );
  const buttonContainerWidth =
    presetContainerWidth / 2 - reverseButtonWidth / 2;

  const displacement = presetContainerWidth - buttonContainerWidth;

  const sourceLanguageTranslateX = useRef(new Animated.Value(0)).current;
  const translationLanguageTranslateX = useRef(new Animated.Value(0)).current;
  const reverseButtonRotate = useRef(new Animated.Value(1)).current;
  const rotateInterpolate = reverseButtonRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    // @ts-ignore
    const sourceLanguageOffset = sourceLanguageTranslateX.__getValue();
    if (!preset.isReverse && sourceLanguageOffset === 0) {
      return;
    }

    reverseButtonRotate.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(reverseButtonRotate, {
          toValue: preset.isReverse ? 0.5 : -0.5,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(sourceLanguageTranslateX, {
        toValue: preset.isReverse ? displacement : 0,
        duration: 150,
        useNativeDriver: true,
      }),

      Animated.timing(translationLanguageTranslateX, {
        toValue: preset.isReverse ? -displacement : 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [preset.isReverse, displacement]);

  useEffect(() => {
    if (preset.isReverse) {
      sourceLanguageTranslateX.setValue(displacement);
      translationLanguageTranslateX.setValue(-displacement);
    }
  }, [displacement]);

  return (
    <View>
      <View
        onLayout={(event) =>
          setPresetContainerWidth(event.nativeEvent.layout.width)
        }
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          position: 'relative',
        }}
      >
        <Animated.View
          style={{
            alignItems: 'center',
            width: reverseButtonWidth,
            transform: [
              {
                rotateZ: rotateInterpolate,
              },
            ],
          }}
        >
          <IconButton
            icon={'swap-horizontal'}
            onPress={clickReverse}
            mode="contained"
            style={{ backgroundColor: 'transparent' }}
          ></IconButton>
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            width: buttonContainerWidth,
            left: 0,
            transform: [
              {
                translateX: sourceLanguageTranslateX,
              },
            ],
          }}
        >
          <SourceLanguageButton
            existingLanguages={existingDeckLanguages}
            navigation={navigation}
            preset={preset}
            onChange={onChange}
            languagePairs={languagePairs}
          />
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            width: buttonContainerWidth,
            right: 0,
            transform: [
              {
                translateX: translationLanguageTranslateX,
              },
            ],
          }}
        >
          <TargetLanguageButton
            navigation={navigation}
            preset={preset}
            onChange={onChange}
            languagePairs={languagePairs}
          />
        </Animated.View>
      </View>
      {!preset.sourceLanguage && (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Icon name="arrow-up-thin" size={48} color={theme.colors.secondary} />
          <Text style={{ color: theme.colors.secondary }}>
            {t('lookUp.selectLanguageLearning')}
          </Text>
        </View>
      )}
      {preset.sourceLanguage && !preset.translationLanguage && (
        <View
          style={{
            width: '50%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            transform: [{ translateX: windowWidth / 3 }],
          }}
        >
          <Text style={{ color: theme.colors.secondary }}>
            {t('lookUp.selectMotherTongue')}
          </Text>
          <Icon name="arrow-up-thin" size={48} color={theme.colors.secondary} />
        </View>
      )}
    </View>
  );
};
