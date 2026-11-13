import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Button, Text } from 'react-native-paper';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { mainPadding } from '../styles';
import { primaryShadow, useAppTheme } from '../ThemeProvider';

const BADGE_SIZE = 88;

const enter = (index: number) =>
  FadeInDown.delay(150 + index * 100)
    .springify()
    .damping(22);

type Props = {
  needsPremium: boolean;
  onTryAgain: () => void;
  onUpgrade: () => void;
  onClose: () => void;
};

export const StudyStepPreviewed: FC<Props> = ({
  needsPremium,
  onTryAgain,
  onUpgrade,
  onClose,
}) => {
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        width: '100%',
        maxWidth: 480,
        alignItems: 'center',
        paddingHorizontal: mainPadding,
      }}
    >
      <Animated.View entering={ZoomIn.springify().damping(18)}>
        <View
          style={{
            width: BADGE_SIZE + 32,
            height: BADGE_SIZE + 32,
            borderRadius: (BADGE_SIZE + 32) / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.inversePrimary,
          }}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryVariant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: BADGE_SIZE,
              height: BADGE_SIZE,
              borderRadius: BADGE_SIZE / 2,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: primaryShadow(theme),
            }}
          >
            <Icon name="check-bold" size={44} color={theme.colors.onPrimary} />
          </LinearGradient>
        </View>
      </Animated.View>

      <Animated.View entering={enter(0)}>
        <Text
          variant="headlineSmall"
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontWeight: '700',
            color: theme.colors.secondary,
          }}
        >
          {t('studyFlow.previewedTitle')}
        </Text>
      </Animated.View>

      <Animated.View entering={enter(1)}>
        <Text
          variant="bodyLarge"
          style={{ marginTop: 8, textAlign: 'center', lineHeight: 24 }}
        >
          {t('studyFlow.previewedText')}
        </Text>
      </Animated.View>

      {needsPremium && (
        <Animated.View
          entering={enter(2)}
          style={{
            alignSelf: 'stretch',
            marginTop: 24,
            padding: 16,
            borderRadius: 12,
            backgroundColor: theme.colors.inputBg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <MaterialIcon
            name="workspace-premium"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={{ flex: 1, lineHeight: 21 }}>
            {t('studyFlow.previewedPremiumText')}
          </Text>
        </Animated.View>
      )}

      <Animated.View
        entering={enter(3)}
        style={{ alignSelf: 'stretch', marginTop: 32, gap: 12 }}
      >
        {needsPremium && (
          <Button
            testID="study-step-preview-upgrade"
            mode="contained"
            icon={({ size, color }) => (
              <MaterialIcon
                name="workspace-premium"
                size={size}
                color={color}
              />
            )}
            onPress={onUpgrade}
            style={{ borderRadius: 12, boxShadow: primaryShadow(theme) }}
            contentStyle={{ height: 48 }}
            labelStyle={{ fontSize: 16 }}
          >
            {t('studyFlow.upgradeToPremium')}
          </Button>
        )}
        <Button
          testID="study-step-preview-try-again"
          mode={needsPremium ? 'outlined' : 'contained'}
          icon="replay"
          onPress={onTryAgain}
          style={{
            borderRadius: 12,
            boxShadow: needsPremium ? undefined : primaryShadow(theme),
          }}
          contentStyle={{ height: 48 }}
          labelStyle={{ fontSize: 16 }}
        >
          {t('studyFlow.previewTryAgain')}
        </Button>
      </Animated.View>

      <Animated.View
        entering={enter(4)}
        style={{ alignSelf: 'stretch', marginTop: 8 }}
      >
        <Button
          testID="study-step-preview-close"
          mode="text"
          onPress={onClose}
          style={{ borderRadius: 12 }}
          contentStyle={{ height: 48 }}
          labelStyle={{ fontSize: 16 }}
        >
          {t('studyFlow.previewClose')}
        </Button>
      </Animated.View>
    </View>
  );
};
