import { FC, useState } from 'react';
import { View } from 'react-native';

type Props = {
  content: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

export const ScreenLayout: FC<Props> = ({ header, content, footer }) => {
  const [headerHeight, setHeaderHeight] = useState(header ? 64 : 0);
  const [footerHeight, setFooterHeight] = useState(0);

  return (
    <View
      style={{
        flex: 1,
        position: 'relative',
      }}
    >
      <View
        style={{
          marginTop: headerHeight,
          marginBottom: footerHeight,
          flex: 1,
        }}
      >
        {content}
      </View>
      {header && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
          }}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            if (height) {
              setHeaderHeight(height);
            }
          }}
        >
          {header}
        </View>
      )}
      {footer && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
          }}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            if (height) {
              setFooterHeight(height);
            }
          }}
        >
          {footer}
        </View>
      )}
    </View>
  );
};
