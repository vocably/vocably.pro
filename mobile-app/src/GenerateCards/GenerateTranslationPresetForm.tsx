import { NavigationProp } from '@react-navigation/native';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, useWindowDimensions, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

export const GenerateTranslationPresetForm: FC<Props> = ({
  navigation,
  preset,
  onChange,
  languagePairs,
}) => {
  const theme = useTheme();

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
  }, [preset.isReverse]);

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
          justifyContent: 'flex-end',
          flexDirection: 'row',
          gap: 4,
        }}
      >
        <SourceLanguageButton
          navigation={navigation}
          preset={preset}
          onChange={onChange}
          languagePairs={languagePairs}
          compact={true}
        />
        <Icon name="menu-right" size={16} />
        <TargetLanguageButton
          navigation={navigation}
          preset={preset}
          onChange={onChange}
          languagePairs={languagePairs}
          compact={true}
        />
      </View>
    </View>
  );
};
