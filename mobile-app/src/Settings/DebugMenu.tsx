import { FC, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';
import { clearAll } from '../asyncAppStorage';
import { loadTransformationsFromStorage } from '../languages/useLanguageTransformations';
import { CustomSurface } from '../ui/CustomSurface';
import { loadStudyStreakFromStorage } from '../UserMetadataContainer';

type Props = {};

export const DebugMenu: FC<Props> = () => {
  const [transformations, setTransformations] = useState<any>(false);
  const [studyStreak, setStudyStreak] = useState<any>(false);

  const refresh = () => {
    loadTransformationsFromStorage().then(setTransformations);
    loadStudyStreakFromStorage().then(setStudyStreak);
  };

  useEffect(() => {
    refresh();
  }, []);

  const theme = useTheme();

  return (
    <CustomSurface
      style={{
        justifyContent: 'center',
        gap: 12,
        width: '100%',
        padding: 24,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 24 }}>Debug Menu</Text>
        <IconButton size={24} icon={'reload'} onPress={() => refresh()} />
      </View>
      {transformations && (
        <>
          <Text style={{ fontSize: 18 }}>Language Transformations</Text>

          <Text selectable={true}>
            {JSON.stringify(transformations, null, 4)}
          </Text>
        </>
      )}
      {studyStreak && (
        <>
          <Text style={{ fontSize: 18 }}>Study Streak</Text>

          <Text selectable={true}>{JSON.stringify(studyStreak, null, 4)}</Text>
        </>
      )}
      <Button
        mode="outlined"
        textColor={theme.colors.error}
        style={{ borderColor: theme.colors.error }}
        onPress={() => clearAll()}
      >
        Clear storage data
      </Button>
    </CustomSurface>
  );
};
