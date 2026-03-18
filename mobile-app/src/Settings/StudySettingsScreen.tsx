import { Slider } from '@miblanchard/react-native-slider';
import { FC } from 'react';
import { Linking, PixelRatio, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getItem, setItem } from '../asyncAppStorage';
import { mainPadding } from '../styles';
import { CustomSurface } from '../ui/CustomSurface';
import { ListSwitch } from '../ui/ListSwitch';
import { useAsync } from '../useAsync';
import { StudySteps } from './StudySteps';

const RANDOMIZER_ENABLED_KEY = 'isRandomizerEnabled';
const MAXIMUM_CARDS_PER_SESSION_KEY = 'maximumCardsPerSession';
const PLAY_RANDOM_EXAMPLE_KEY = 'playRandomExample';

export const getRandomizerEnabled = () =>
  getItem(RANDOMIZER_ENABLED_KEY).then((res) => res === 'true');

const setRandomizerEnabled = (isEnabled: boolean) =>
  setItem(RANDOMIZER_ENABLED_KEY, isEnabled ? 'true' : 'false');

export const getMaximumCardsPerSession = () =>
  getItem(MAXIMUM_CARDS_PER_SESSION_KEY).then((res) => Number(res ?? 10));

export const setMaximumCardsPerSession = (cardsPerSession: number) =>
  setItem(MAXIMUM_CARDS_PER_SESSION_KEY, cardsPerSession.toString());

export const getPlayRandomExample = () =>
  getItem(PLAY_RANDOM_EXAMPLE_KEY).then((res) => res !== 'false');

const setPlayRandomExample = (isEnabled: boolean) =>
  setItem(PLAY_RANDOM_EXAMPLE_KEY, isEnabled ? 'true' : 'false');

type Props = {};

export const StudySettingsScreen: FC<Props> = () => {
  const theme = useTheme();
  const scrollableRef = useAnimatedRef<Animated.ScrollView>();

  const [isRandomizerEnabled, mutateIsRandomizerEnabled] = useAsync(
    getRandomizerEnabled,
    setRandomizerEnabled
  );

  const [maximumCardsPerSession, mutateMaximumCardsPerSession] = useAsync(
    getMaximumCardsPerSession,
    setMaximumCardsPerSession
  );

  const [playRandomExample, mutatePlayRandomExample] = useAsync(
    getPlayRandomExample,
    setPlayRandomExample
  );

  const onRandomizerEnabledChange = async () => {
    if (isRandomizerEnabled.status !== 'loaded') {
      return;
    }

    await mutateIsRandomizerEnabled(!isRandomizerEnabled.value);
  };

  const onPlayRandomExampleChange = async () => {
    if (playRandomExample.status !== 'loaded') {
      return;
    }

    await mutatePlayRandomExample(!playRandomExample.value);
  };

  const insets = useSafeAreaInsets();

  const fontScale = Math.max(1, PixelRatio.getFontScale());
  return (
    <Animated.ScrollView
      ref={scrollableRef}
      contentContainerStyle={{
        paddingTop: mainPadding,
        paddingBottom: insets.bottom + mainPadding,
        paddingLeft: insets.left + mainPadding,
        paddingRight: insets.right + mainPadding,
      }}
    >
      <StudySteps style={{ marginBottom: 32 }} scrollableRef={scrollableRef} />

      <CustomSurface
        style={{
          marginBottom: 32,
          gap: 16,
          padding: 16,
          paddingHorizontal: 32,
        }}
      >
        <View>
          <Text style={{ fontSize: 16 }}>Maximum cards per study session</Text>
        </View>
        {maximumCardsPerSession.status === 'loaded' && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 16, width: 24 * fontScale }}>
              {maximumCardsPerSession.value}
            </Text>
            <View style={{ flex: 1 }}>
              <Slider
                minimumValue={5}
                maximumValue={40}
                step={1}
                minimumTrackTintColor={theme.colors.primary}
                thumbTintColor={theme.colors.primary}
                value={maximumCardsPerSession.value}
                onValueChange={(value) => {
                  mutateMaximumCardsPerSession(value[0]);
                }}
              ></Slider>
            </View>
          </View>
        )}
      </CustomSurface>

      {playRandomExample.status === 'loaded' && (
        <>
          <CustomSurface style={{ marginBottom: 8 }}>
            <ListSwitch
              title="Pronounce an example sentence"
              value={playRandomExample.value}
              onChange={onPlayRandomExampleChange}
            />
          </CustomSurface>
          <View
            style={{
              paddingHorizontal: 8,
              marginBottom: 32,
            }}
          >
            <Text>
              This option makes the app play a random example sentence when
              appropriate during the study session. The{' '}
              <Icon name="volume-high" size={16} /> option should be turned on —
              this option is in the top-right corner of the Study screen.
            </Text>
          </View>
        </>
      )}

      {isRandomizerEnabled.status === 'loaded' && (
        <CustomSurface style={{ marginBottom: 8 }}>
          <ListSwitch
            title="Randomly select cards to study"
            value={isRandomizerEnabled.value}
            onChange={onRandomizerEnabledChange}
          />
        </CustomSurface>
      )}
      <View
        style={{
          paddingHorizontal: 8,
        }}
      >
        <Text>
          <Icon name="alert-outline" size={16} /> Enabling this option is
          generally a <Text style={{ fontWeight: 'bold' }}>bad idea</Text>. This
          option disables the smart study algorithm. People who disable the
          smart study algorithm eventually get frustrated with their study
          progress.{' '}
          <Text onPress={() => Linking.openURL('https://vocably.pro/srs.html')}>
            <Text
              style={{
                textDecorationLine: 'underline',
                color: theme.colors.primary,
              }}
            >
              Read how Vocably uses the smart study algorithm to help you learn
              more words in a shorter time.
            </Text>
            {''}
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 16,
              }}
            >
              {' '}
              <Icon name="open-in-new" />
            </Text>
          </Text>
        </Text>
      </View>
    </Animated.ScrollView>
  );
};
