import { useNavigation } from '@react-navigation/native';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';
import { Icon, Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { fixMarkdown } from '../fixMarkdown';
import { mmkvStorage } from '../mmkvStorage';
import { useAppTheme } from '../ThemeProvider';
import { Collapsible } from '../ui/Collapsible';
import { CustomSurface } from '../ui/CustomSurface';

const STORAGE_KEY = 'lookUpExplanationCollapsed';
const ANIMATION_DURATION = 250;

type Props = {
  explanation: string;
  style?: StyleProp<ViewStyle>;
};

export const SentenceExplanation: FC<Props> = ({ explanation, style }) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const navigation = useNavigation();
  const [isExpanded, setIsExpanded] = useState(
    () => mmkvStorage.getBoolean(STORAGE_KEY) !== true
  );

  const chevronRotation = useSharedValue(isExpanded ? 180 : 0);

  useEffect(() => {
    chevronRotation.value = withTiming(isExpanded ? 180 : 0, {
      duration: ANIMATION_DURATION,
    });
  }, [isExpanded]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const toggle = () => {
    const nextIsExpanded = !isExpanded;
    setIsExpanded(nextIsExpanded);
    mmkvStorage.set(STORAGE_KEY, !nextIsExpanded);
  };

  const textColor = theme.colors.onSurface;
  const lineHeight = Platform.OS === 'ios' ? 22 : 24;
  const markdownStyle = {
    paragraph: { color: textColor, fontSize: 16, lineHeight },
    list: {
      color: textColor,
      fontSize: 16,
      markerColor: theme.colors.primary,
      bulletColor: theme.colors.primary,
      bulletSize: 4,
      lineHeight,
      gapWidth: 8,
    },
    blockquote: { color: textColor, fontSize: 16 },
    strong: { color: textColor },
    em: { color: textColor },
    link: { color: theme.colors.primary },
    thematicBreak: { color: theme.colors.outlineVariant },
  };

  return (
    <CustomSurface style={[{ padding: 0, overflow: 'hidden' }, style]}>
      <Pressable
        testID="lookup-explanation-toggle"
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={toggle}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 10,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text
          variant="labelLarge"
          style={{ flex: 1, color: theme.colors.onSurfaceVariant }}
        >
          {t('lookUp.explanationTitle')}
        </Text>
        <Animated.View style={chevronStyle}>
          <Icon
            source="chevron-down"
            size={22}
            color={theme.colors.onSurfaceVariant}
          />
        </Animated.View>
      </Pressable>
      <Collapsible visible={isExpanded} duration={ANIMATION_DURATION}>
        <View
          testID="lookup-explanation-content"
          style={{ paddingHorizontal: 16, paddingBottom: 14 }}
        >
          <EnrichedMarkdownText
            markdown={fixMarkdown(explanation.trim())}
            markdownStyle={markdownStyle}
            allowTrailingMargin={false}
            selectionMenuConfig={{
              copyAsMarkdown: false,
            }}
            contextMenuItems={[
              {
                icon: 'translate',
                text: t('common.lookUpWithVocably'),
                onPress: ({ text }) => {
                  // @ts-ignore
                  navigation.push('LookUpModal', {
                    text,
                  });
                },
              },
            ]}
          />
        </View>
      </Collapsible>
    </CustomSurface>
  );
};
