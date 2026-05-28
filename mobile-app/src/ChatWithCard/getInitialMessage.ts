import { ChatCard } from '@vocably/model';
import { i18n } from '../i18n';

export const getInitialMessage = (card: ChatCard): string => {
  return card.partOfSpeech
    ? i18n.t('chat.initialMessageWithPartOfSpeech', {
        partOfSpeech: card.partOfSpeech,
        source: card.source,
      })
    : i18n.t('chat.initialMessage', { source: card.source });
};
