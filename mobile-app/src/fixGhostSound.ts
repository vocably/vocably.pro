import { AppState } from 'react-native';
import Sound from 'react-native-sound';

export const fixGhostSound = () => {
  Sound.setCategory('Playback', true);

  AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      Sound.setCategory('Playback', true);
    }
  });
};
