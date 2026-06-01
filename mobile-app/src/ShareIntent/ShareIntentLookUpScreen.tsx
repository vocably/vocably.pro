import { NavigationProp } from '@react-navigation/native';
import { FC } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Loader } from '../loaders/Loader';
import { LookUpScreen } from '../LookUpScreen';
import { useSharedText } from './useSharedText';

export const ShareIntentLookUpScreen: FC<{
  navigation: NavigationProp<any>;
}> = ({ navigation }) => {
  const { t } = useTranslation();
  const sharedText = useSharedText();

  if (sharedText.status === 'undefined') {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Loader>{t('shareIntent.receivingText')}</Loader>
      </View>
    );
  }

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <LookUpScreen
        navigation={navigation}
        initialText={sharedText.text}
        isSharedLookUp={true}
      />
    </View>
  );
};
