import { useNavigation } from '@react-navigation/native';
import { RateInteractionPayload } from '@vocably/model';
import React, { FC } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Text, useTheme } from 'react-native-paper';
import { mobileStoreName } from '../mobilePlatform';

export type Props = {
  style?: StyleProp<ViewStyle>;
  onAction?: (choice: RateInteractionPayload) => void;
};

export const RequestFeedbackForm: FC<Props> = ({
  style,
  onAction = () => {},
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  return (
    <View
      style={[
        {
          flex: 0,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        },
        style,
      ]}
    >
      <Divider style={{ width: '100%' }} />
      <View>
        <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
          {t('requestFeedback.question', { storeName: mobileStoreName })}
        </Text>
      </View>
      <View style={{ alignSelf: 'stretch' }}>
        <Button mode={'outlined'} onPress={() => onAction('review')}>
          {t('requestFeedback.rateButton', { storeName: mobileStoreName })}
        </Button>
      </View>
      <View style={{ alignSelf: 'stretch' }}>
        <Button mode={'text'} onPress={() => onAction('later')}>
          {t('requestFeedback.later')}
        </Button>
      </View>
      <View>
        <Text style={{ textAlign: 'center' }}>
          {t('requestFeedback.feedbackBefore')}{' '}
          <Text
            style={{ color: theme.colors.primary }}
            onPress={() => navigation.navigate('Feedback')}
          >
            {t('requestFeedback.feedbackLink')}
          </Text>
          {t('requestFeedback.feedbackAfter')}
        </Text>
      </View>
      <View>
        <Button
          mode="text"
          textColor={theme.colors.onSurface}
          onPress={() => onAction('never')}
        >
          {t('requestFeedback.neverAgain')}
        </Button>
      </View>
    </View>
  );
};
