import React, { FC } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Divider, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { mainPadding } from '../styles';
import { LoginForm } from './LoginForm';

type Props = {};

export const LoginModal: FC<Props> = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const listColor = theme.colors.onBackground;
  const textStyle = {
    fontSize: 18,
    color: listColor,
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingLeft: insets.left + mainPadding,
        paddingRight: insets.right + mainPadding,
      }}
    >
      <View style={{ width: '90%', gap: 8, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name="cloud-outline" size={24} color={listColor} />
          <Text style={textStyle}>Synchronize across devices</Text>
        </View>
        <Divider />
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name="puzzle-outline" size={24} color={listColor} />
          <Text style={textStyle}>Use browser extensions</Text>
        </View>
        <Divider />
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name="file-delimited-outline" size={24} color={listColor} />
          <Text style={textStyle}>Import and export CSV data</Text>
        </View>
      </View>
      <LoginForm />
    </ScrollView>
  );
};
