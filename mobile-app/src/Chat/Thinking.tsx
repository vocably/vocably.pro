import { FC } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

type Props = {
  message?: string;
};

export const Thinking: FC<Props> = ({ message = 'Thinking...' }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: theme.colors.elevation.level5,
        borderRadius: 16,
        padding: 16,
        gap: 16,
      }}
    >
      <ActivityIndicator color={theme.colors.onSurface} />
      <Text style={{ fontSize: 16 }}>{message}</Text>
    </View>
  );
};
