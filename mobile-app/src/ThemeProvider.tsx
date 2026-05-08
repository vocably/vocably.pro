import { FC, PropsWithChildren } from 'react';
import {
  MD3DarkTheme,
  MD3LightTheme,
  MD3Theme,
  Provider,
  useTheme,
} from 'react-native-paper';
import { useColorScheme } from './useColorScheme';

type ThemeProvider = FC<PropsWithChildren<{}>>;

export type AppTheme = MD3Theme & {
  colors: MD3Theme['colors'] & {
    backgroundRgb: string;
    inputBg: string;
    inputBgFocused: string;
    inputIconColor: string;
    transparentSurface: string;
    primaryVariant: string;
    aboveElevation: string;
  };
};

export const lightTheme: AppTheme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    background: 'rgb(255, 255, 255)',
    backgroundRgb: '255, 255, 255',
    onBackground: 'rgb(106, 106, 106)',
    surface: 'rgb(255, 255, 255)',
    transparentSurface: 'rgba(255, 255, 255, 0)',
    onSurface: 'rgb(106, 106, 106)',
    inputBg: 'rgba(106, 106, 106, 0.05)',
    inputBgFocused: 'rgba(106, 106, 106, 0.14)',
    inputIconColor: 'rgba(106, 106, 106, 0.6)',
    primary: 'rgb(0, 80, 255)',
    primaryVariant: 'rgb(66, 24, 178)',
    onPrimary: 'rgb(255, 255, 255)',
    error: 'rgb(221, 34, 34)',
    onError: 'rgb(255, 255, 255)',
    secondary: 'rgb(0, 0, 0)',
    onSecondary: 'rgb(255, 255, 255)',
    tertiary: 'rgb(199, 199, 199)',
    onTertiary: 'rgb(106, 106, 106)',
    outline: 'rgb(0, 80, 255)',
    outlineVariant: 'rgb(107, 106, 106)',
    secondaryContainer: 'rgb(0, 80, 255)',
    onSecondaryContainer: 'rgb(255, 255, 255)',
    surfaceVariant: 'rgb(251, 251, 251)',
    inversePrimary: 'rgba(0, 80, 255, 0.1)',
    aboveElevation: 'rgb(255, 255, 255)',
    elevation: {
      level0: 'rgb(255, 255, 255)',
      level1: 'rgb(252, 252, 252)',
      level2: 'rgb(250, 250, 250)',
      level3: 'rgb(247, 247, 247)',
      level4: 'rgb(245, 245, 245)',
      level5: 'rgb(243, 243, 243)',
    },
  },
};

const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  roundness: 3,
  colors: {
    ...MD3DarkTheme.colors,
    background: 'rgb(37, 37, 37)',
    backgroundRgb: '37, 37, 37',
    surface: 'rgb(37, 37, 37)',
    transparentSurface: 'rgba(37, 37, 37, 0)',
    onSurface: 'rgb(186, 186, 186)',
    inputBg: 'rgba(186, 186, 186, 0.1)',
    inputBgFocused: 'rgba(186, 186, 186, 0.2)',
    inputIconColor: 'rgba(255, 255, 255, 0.5)',
    primary: 'rgb(40, 165, 255)',
    primaryVariant: 'rgb(1,95,165)',
    onPrimary: 'rgb(255, 255, 255)',
    error: 'rgb(255, 94, 94)',
    onError: 'rgb(255, 255, 255)',
    secondary: 'rgb(255, 255, 255)',
    onSecondary: 'rgb(37, 37, 37)',
    tertiary: 'rgb(111, 108, 108)',
    onTertiary: 'rgb(255, 255, 255)',
    outline: 'rgb(40, 165, 255)',
    outlineVariant: 'rgb(107, 106, 106)',
    secondaryContainer: 'rgb(40, 165, 255)',
    onSecondaryContainer: 'rgb(255, 255, 255)',
    surfaceVariant: 'rgb(59, 59, 59)',
    inversePrimary: 'rgba(40, 165, 255, 0.1)',
    aboveElevation: 'rgb(75, 75, 75)',
    elevation: {
      level0: 'rgb(37, 37, 37)',
      level1: 'rgb(50, 50, 50)',
      level2: 'rgb(62, 62, 62)',
      level3: 'rgb(75, 75, 75)',
      level4: 'rgb(88, 88, 88)',
      level5: 'rgb(101, 101, 101)',
    },
  },
};

export const ThemeProvider: ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  return (
    <Provider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
      {children}
    </Provider>
  );
};

export const useAppTheme = () => useTheme() as AppTheme;
