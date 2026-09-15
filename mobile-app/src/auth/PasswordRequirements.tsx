import { checkPassword, PasswordCheck } from '@vocably/sulna';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const rules: (keyof PasswordCheck)[] = [
  'minLength',
  'lowercase',
  'uppercase',
  'digit',
  'symbol',
];

type Props = {
  password: string;
};

export const PasswordRequirements: FC<Props> = ({ password }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const check = checkPassword(password);

  return (
    <View style={{ gap: 4, paddingHorizontal: 16 }}>
      {rules.map((rule) => {
        const color = check[rule]
          ? theme.colors.primary
          : theme.colors.onSurfaceVariant;

        return (
          <View
            key={rule}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Icon
              name={check[rule] ? 'check-circle' : 'circle-outline'}
              size={16}
              color={color}
            />
            <Text style={{ color }}>{t(`passwordRules.${rule}`)}</Text>
          </View>
        );
      })}
    </View>
  );
};
