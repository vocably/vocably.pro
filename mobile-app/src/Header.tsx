import { StackHeaderProps } from '@react-navigation/stack';
import React, { FC } from 'react';
import { Appbar } from 'react-native-paper';
import { Platform } from 'react-native';

type Header = FC<StackHeaderProps>;

export const Header: Header = ({ options, back, navigation, route }) => {
  return (
    <Appbar.Header
      elevated={false}
      mode="small"
      style={{
        backgroundColor: 'transparent',
        paddingLeft: !back ? 24 : 0,
      }}
    >
      {back && (
        <Appbar.BackAction
          onPress={navigation.goBack}
          style={{ backgroundColor: 'transparent' }}
        />
      )}

      <Appbar.Content
        style={{ alignItems: 'flex-start' }}
        title={options.title}
      />
    </Appbar.Header>
  );
};
