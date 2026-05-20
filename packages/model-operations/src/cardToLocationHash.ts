import { Card } from '@vocably/model';
import { toLocationHash } from '@vocably/sulna';

export const cardToLocationHash = (
  card: Pick<Card, 'source' | 'partOfSpeech'>
): string => {
  return '#' + toLocationHash(`${card.source}-${card.partOfSpeech}`);
};
