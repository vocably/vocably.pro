import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

type CardsAnsweredToday = {
  timestamp: number;
  answers: number;
};

const defaultValue: CardsAnsweredToday = {
  timestamp: 0,
  answers: 0,
};

const getCardsAnsweredToday = async (): Promise<CardsAnsweredToday> => {
  let swipedToday: CardsAnsweredToday;

  try {
    swipedToday = JSON.parse(
      (await AsyncStorage.getItem('swipedToday')) ??
        JSON.stringify(defaultValue)
    );
  } catch (e) {
    console.error('Unable to parse swipedToday', e);
    swipedToday = defaultValue;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Math.floor(today.getTime() / 1000);

  if (swipedToday.timestamp === todayTimestamp) {
    return swipedToday;
  }

  return {
    timestamp: todayTimestamp,
    answers: 0,
  };
};

const storeCardsAnsweredToday = async (values: CardsAnsweredToday) => {
  return AsyncStorage.setItem('swipedToday', JSON.stringify(values));
};

export const useCardsAnsweredToday = (): [
  null | CardsAnsweredToday,
  () => unknown
] => {
  const [cardsAnsweredToday, setCardsAnsweredToday] =
    useState<null | CardsAnsweredToday>(null);

  useEffect(() => {
    getCardsAnsweredToday().then(setCardsAnsweredToday).catch(console.error);
  }, []);

  const increase = () => {
    setCardsAnsweredToday((oldValue) => {
      if (oldValue === null) {
        return oldValue;
      }

      const newValue = {
        ...oldValue,
        answers: oldValue.answers + 1,
      };

      storeCardsAnsweredToday(newValue).catch(console.error);

      return newValue;
    });
  };

  return [cardsAnsweredToday, increase];
};
