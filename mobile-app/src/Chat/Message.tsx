import { FC, useState } from 'react';
import { Platform, StyleProp, View, ViewStyle, Text } from 'react-native';
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';
import { useTheme } from 'react-native-paper';
import { fixMarkdown } from '../fixMarkdown';
import { i18n } from '../i18n';
import { useNavigation } from '@react-navigation/native';

type Props = {
  message: string;
  direction: 'fromAi' | 'toAi';
  error?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Message: FC<Props> = ({
  message,
  direction,
  error = false,
  style,
}) => {
  const [width, setWidth] = useState(0);
  const theme = useTheme();
  const navigation = useNavigation();
  const textColor = error
    ? theme.colors.error
    : direction === 'fromAi'
      ? theme.colors.onBackground
      : theme.colors.onPrimary;
  const markdownStyle = {
    paragraph: {
      color: textColor,
      fontSize: 16,
      lineHeight: Platform.OS === 'ios' ? 20 : 22,
    },
    list: {
      color: textColor,
      fontSize: 16,
      markerColor: textColor,
      bulletColor: textColor,
      bulletSize: 4,
      lineHeight: Platform.OS === 'ios' ? 20 : 22,
      gapWidth: 8,
    },
    blockquote: { color: textColor, fontSize: 16 },
    strong: { color: textColor },
    em: { color: textColor },
    link: { color: textColor },
    thematicBreak: { color: theme.colors.onBackground },
  };

  const markdownMessage = fixMarkdown(message.trim());

  return (
    <View style={{ position: 'relative' }}>
      {/**
        We need the Text element below to calculate the container size because
        Anrdoid has proplems with rendering markdown in non-fixed-size container.
      */}
      <Text
        style={{
          position: 'absolute',
          fontSize: 16,
          pointerEvents: 'none',
          opacity: 0,
        }}
        onLayout={(e) => {
          setWidth(e.nativeEvent.layout.width);
        }}
      >
        {markdownMessage}
      </Text>
      {width > 0 && (
        <View
          style={[
            {
              position: 'relative',
              alignSelf: direction === 'fromAi' ? 'flex-start' : 'flex-end',
              width: width + 32.5,
              maxWidth: '100%',
              alignItems: 'stretch',
              justifyContent: 'center',
              backgroundColor:
                direction === 'fromAi'
                  ? theme.colors.elevation.level5
                  : theme.colors.primary,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingTop: Platform.OS === 'ios' ? 10 : 10,
              paddingBottom: Platform.OS === 'ios' ? 12 : 10,
            },
            style,
          ]}
        >
          <EnrichedMarkdownText
            markdown={markdownMessage}
            markdownStyle={markdownStyle}
            allowTrailingMargin={false}
            selectionMenuConfig={{
              copyAsMarkdown: false,
            }}
            contextMenuItems={[
              {
                icon: 'translate',
                text: i18n.t('common.lookUpWithVocably'),
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
      )}
    </View>
  );
};
