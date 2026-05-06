import { FC } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

type Props = {
  message?: string;
  style?: StyleProp<ViewStyle>;
};

export const Thinking: FC<Props> = ({ message = 'Thinking...', style }) => {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          backgroundColor: theme.colors.elevation.level5,
          borderRadius: 16,
          padding: 16,
          gap: 16,
        },
        style,
      ]}
    >
      <ActivityIndicator color={theme.colors.onBackground} />
      <Text style={{ fontSize: 16, color: theme.colors.onBackground }}>
        {message}
      </Text>
    </View>
  );
};
