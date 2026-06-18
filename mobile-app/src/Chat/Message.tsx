import { FC } from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
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
    },
    list: {
      color: textColor,
      fontSize: 16,
      markerColor: textColor,
      bulletColor: textColor,
    },
    blockquote: { color: textColor, fontSize: 16 },
    strong: { color: textColor },
    em: { color: textColor },
    link: { color: textColor },
    thematicBreak: { color: theme.colors.onBackground },
  };

  return (
    <View
      style={[
        {
          alignSelf: direction === 'fromAi' ? 'flex-start' : 'flex-end',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor:
            direction === 'fromAi'
              ? theme.colors.elevation.level5
              : theme.colors.primary,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingTop: Platform.OS === 'ios' ? 8 : 10,
          paddingBottom: Platform.OS === 'ios' ? 14 : 10,
        },
        style,
      ]}
    >
      <EnrichedMarkdownText
        markdown={fixMarkdown(message.trim())}
        markdownStyle={markdownStyle}
        allowTrailingMargin={false}
        selectionMenuConfig={{
          copyAsMarkdown: false,
        }}
        contextMenuItems={[
          {
            icon: 'translate',
            text: i18n.t('common.lookUpWithVocably'),
            onPress: ({ text, selection }) => {
              // @ts-ignore
              navigation.push('LookUpModal', {
                text,
              });
            },
          },
        ]}
      />
    </View>
  );
};
