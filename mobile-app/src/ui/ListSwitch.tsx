import { FC } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Switch, Text, useTheme } from 'react-native-paper';

type Props = {
  style?: StyleProp<ViewStyle>;
  title: string;
  value: boolean;
  onChange: (value: boolean) => Promise<void>;
  disabled?: boolean;
};

export const ListSwitch: FC<Props> = ({
  style,
  value,
  onChange,
  title,
  disabled = false,
}) => {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 12,
          gap: 12,
        },
        style,
      ]}
    >
      <View style={{ flexGrow: 1, flexShrink: 1, paddingRight: 12 }}>
        <Text
          style={{
            fontSize: 16,
          }}
        >
          {title}
        </Text>
      </View>

      <View style={{ width: 48 }}>
        <Switch value={value} onValueChange={onChange} />
      </View>
    </View>
  );
};
