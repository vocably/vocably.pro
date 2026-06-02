import { FC, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  style?: StyleProp<ViewStyle>;
  leftIcon?: string;
  title: string;
  rightIcon?: string;
  color?: string;
  onPress: () => void;
  disabled?: boolean;
  order?: 'single' | 'first' | 'last' | 'middle';
};

const BORDER_RADIUS = 12;
const LEFT_ICON_WIDTH = 56;
const RIGHT_ICON_WIDTH = 48;

export const ListItem: FC<Props> = ({
  style,
  leftIcon,
  rightIcon = 'menu-right',
  color,
  onPress,
  title,
  disabled = false,
  order = 'single',
}) => {
  const theme = useTheme();
  const [itemWidth, setItemWidth] = useState(0);

  return (
    <TouchableRipple
      disabled={disabled}
      borderless={true}
      style={[
        {
          width: '100%',
          borderTopLeftRadius:
            order === 'single' || order === 'first' ? BORDER_RADIUS : 0,
          borderTopRightRadius:
            order === 'single' || order === 'first' ? BORDER_RADIUS : 0,
          borderBottomRightRadius:
            order === 'single' || order === 'last' ? BORDER_RADIUS : 0,
          borderBottomLeftRadius:
            order === 'single' || order === 'last' ? BORDER_RADIUS : 0,
          paddingVertical: 16,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
      onPress={onPress}
    >
      <View
        onLayout={(event) => {
          setItemWidth(event.nativeEvent.layout.width);
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {leftIcon && (
          <View
            style={{
              width: LEFT_ICON_WIDTH,
            }}
          >
            <Icon
              name={leftIcon}
              size={24}
              color={color ?? theme.colors.onBackground}
              style={{ marginLeft: 16 }}
            />
          </View>
        )}
        <View
          style={{
            width:
              itemWidth -
              (leftIcon ? LEFT_ICON_WIDTH : 32) -
              (rightIcon ? RIGHT_ICON_WIDTH : 0),
            paddingRight: 16,
          }}
        >
          <Text
            style={{
              color: color ?? theme.colors.onBackground,
              fontSize: 16,
            }}
          >
            {title}
          </Text>
        </View>
        {rightIcon && (
          <View
            style={{
              width: RIGHT_ICON_WIDTH,
              alignItems: 'flex-end',
              paddingRight: 8,
            }}
          >
            <Icon
              name={rightIcon}
              size={24}
              color={color ?? theme.colors.onBackground}
            />
          </View>
        )}
      </View>
    </TouchableRipple>
  );
};
