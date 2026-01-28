import React, { FC, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Divider, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mainPadding } from '../styles';

type Props = {};

const radioOptions = [
  { label: 'Friend', value: 'friend' },
  { label: 'Google', value: 'google' },
  { label: 'AI', value: 'ai' },
  { label: 'Other', value: 'other' },
];

export const SurveyScreen: FC<Props> = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [radioValue, setRadioValue] = useState('');

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: insets.left + mainPadding,
        paddingRight: insets.right + mainPadding,
      }}
    >
      <View style={{ gap: 16, width: '100%' }}>
        <Text style={{ fontSize: 24 }}>How did you hear about Vocably?</Text>
        <View style={{ width: '100%', gap: 8 }}>
          {radioOptions.map((option) => (
            <Button
              key={option.value}
              mode={radioValue === option.value ? 'contained' : 'outlined'}
              onPress={() => setRadioValue(option.value)}
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: theme.colors.primary,
              }}
            >
              {option.label}
            </Button>
          ))}
        </View>
        {radioValue && (
          <Animated.View
            entering={FadeInDown}
            style={{ paddingTop: 24, gap: 32, width: '100%' }}
          >
            <Divider style={{ width: '100%' }} />
            <Button mode="elevated" elevation={2} onPress={() => {}}>
              Next
            </Button>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
};
