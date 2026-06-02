import DateTimePicker from '@react-native-community/datetimepicker';
import { FC, useState } from 'react';
import { Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native-paper';
import { ListItem } from '../../ui/ListItem';

type Props = {
  time: string;
  onChange: (time: string) => void;
  disabled?: boolean;
};

export const TimePicker: FC<Props> = ({ time, onChange, disabled = false }) => {
  const [hours, minutes] = time.split(':');
  const value = new Date(2025, 2, 4, Number(hours), Number(minutes));
  const { t } = useTranslation();

  const [isAndroidVisible, setIsAndroidVisible] = useState(false);

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {Platform.OS === 'ios' && (
        <>
          <Text style={{ fontSize: 24, marginVertical: 32 }}>
            {t('notifications.receiveAt')}
          </Text>
          <DateTimePicker
            value={value}
            minuteInterval={15}
            mode={'time'}
            display={'spinner'}
            disabled={disabled}
            onChange={(_, date) => {
              if (date !== undefined) {
                onChange(
                  `${date.getHours().toString().padStart(2, '0')}:${date
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}`
                );
              }
            }}
          />
        </>
      )}
      {Platform.OS !== 'ios' && (
        <>
          <ListItem
            leftIcon="clock-time-ten-outline"
            rightIcon=""
            disabled={disabled}
            onPress={() => setIsAndroidVisible(true)}
            title={`${t('notifications.receiveAt')} ${time}`}
          />
          {isAndroidVisible && (
            <DateTimePicker
              value={value}
              minuteInterval={15}
              display={'spinner'}
              mode={'time'}
              disabled={disabled}
              onChange={(_, date) => {
                setIsAndroidVisible(false);
                if (date !== undefined) {
                  onChange(
                    `${date.getHours().toString().padStart(2, '0')}:${date
                      .getMinutes()
                      .toString()
                      .padStart(2, '0')}`
                  );
                }
              }}
            />
          )}
        </>
      )}
    </View>
  );
};
