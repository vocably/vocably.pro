import { FC } from 'react';
import { NavigationProp, Route } from '@react-navigation/native';
import { LookUpScreen } from './LookUpScreen';

export type LookUpModalRouteParams = {
  text: string;
};

type Props = {
  route: Route<string, any>;
  navigation: NavigationProp<any>;
};

export const LookUpModal: FC<Props> = ({ route, navigation }) => {
  const { text } = route.params as LookUpModalRouteParams;
  return (
    <LookUpScreen
      navigation={navigation}
      initialText={text}
      isModal={true}
    ></LookUpScreen>
  );
};
