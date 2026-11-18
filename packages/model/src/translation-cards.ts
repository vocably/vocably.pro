import { AnalysisItem, DetectedInputType } from './analysis';
import { GoogleLanguage } from './language';
import { Card, CardItem, LanguageDeck, TagItem } from './language-deck';

export type DetachedCard = Omit<
  CardItem['data'],
  'eFactor' | 'dueDate' | 'repetition' | 'interval'
>;
export type DetachedCardItem = {
  data: DetachedCard;
};

export type TranslationCard = CardItem | DetachedCardItem;

export type TranslationCards = {
  source: string;
  // Set for a reverse analysis: the text the user looked up in the target
  // language.
  target?: string;
  explanation: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  isDirect?: boolean;
  detectedInputType?: DetectedInputType;
  aiThinksItIs?: string;
  deck: LanguageDeck;
  items: AnalysisItem[];
  extraItems?: AnalysisItem[];
};

export type RemoveCardPayload = {
  translationCards: TranslationCards;
  card: CardItem;
};

export type AddCardPayload = {
  translationCards: TranslationCards;
  card: DetachedCardItem;
};

export type QualityVote = 'up' | 'down';

/**
 * The user's opinion on the quality of a card, along with what the card was
 * created from.
 */
export type QualityVotePayload = {
  // null when the user takes their vote back.
  vote: QualityVote | null;
  // Set when the user changes their mind.
  previousVote: QualityVote | null;
  card: DetachedCard;
  cards: DetachedCard[];
  query: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  direction: 'direct' | 'reverse';
};

export type TagCandidate = TagItem | Pick<TagItem, 'data'>;

export type UpdateCardPayload = {
  translationCards: TranslationCards;
  card: TranslationCard;
  data: Partial<Card>;
};

export type AttachTagPayload = {
  translationCards: TranslationCards;
  cardId: string;
  tag: TagCandidate;
};

export type DetachTagPayload = {
  translationCards: TranslationCards;
  cardId: string;
  tag: TagItem;
};

export type UpdateTagPayload = {
  translationCards: TranslationCards;
  tag: TagItem;
};

export type DeleteTagPayload = {
  translationCards: TranslationCards;
  tag: TagItem;
};

export const isCardItem = (
  item: CardItem | DetachedCardItem
): item is CardItem => {
  return (item as CardItem).id !== undefined;
};

export const isDetachedCardItem = (
  item: CardItem | DetachedCardItem
): item is DetachedCardItem => {
  return (item as CardItem).id === undefined;
};
