import { GoogleLanguage, languageList } from '@vocably/model';
import { usePostHog } from 'posthog-react-native';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguageDeck } from '../languageDeck/useLanguageDeck';
import { AnalyzeResultItem } from '../LookUpScreen/AnalyzeResultItem';
import { associateCards } from '../LookUpScreen/associateCards';
import { getOnboardingData } from '../Onboarding/getOnboardingData';
import { useAnalyzeOperations } from '../useAnalyzeOperations';
import { WelcomeScrollView } from './WelcomeScrollView';

type Props = {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
};

export const SlideCard: FC<Props> = ({ sourceLanguage, targetLanguage }) => {
  const { t } = useTranslation();
  const onboardingData = getOnboardingData(sourceLanguage, targetLanguage);
  const posthog = usePostHog();
  const theme = useTheme();
  const deck = useLanguageDeck({
    language: sourceLanguage,
    autoReload: true,
  });

  const welcomeScreenAssociatedCards = associateCards(
    [onboardingData.welcomeScreenCard],
    deck.deck.cards
  );

  const { onAdd, onRemove, onTagsChange } = useAnalyzeOperations({
    deck,
  });

  return (
    <WelcomeScrollView style={{ gap: 16 }}>
      <Text style={{ fontSize: 22, textAlign: 'center' }}>
        {sourceLanguage === targetLanguage
          ? t('welcome.slideCard.looksUpWords')
          : t('welcome.slideCard.translatesWords')}
      </Text>

      {onboardingData.isFallback && (
        <View>
          <Text style={{ fontWeight: 'bold' }}>
            {t('welcome.slideCard.fallbackNote')}
          </Text>
          <Text>
            {t('welcome.slideCard.fallbackBody', {
              sourceLang: languageList[sourceLanguage],
              targetLang: languageList[targetLanguage],
            })}
          </Text>
        </View>
      )}

      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: theme.colors.secondary,
          borderWidth: 1,
          borderRadius: 16,
        }}
      >
        <AnalyzeResultItem
          style={{ width: '100%' }}
          hideOperations={!!onboardingData.isFallback}
          onAdd={(card) => {
            posthog.capture('onboardingCardAdded', {
              sourceLanguage,
              targetLanguage,
              cardSource: welcomeScreenAssociatedCards[0].card.source,
            });
            return onAdd(card);
          }}
          onRemove={(card) => {
            posthog.capture('onboardingCardRemoved', {
              sourceLanguage,
              targetLanguage,
              cardSource: welcomeScreenAssociatedCards[0].card.source,
            });

            return onRemove(card);
          }}
          onTagsChange={(id, tags) => {
            posthog.capture('onboardingCardTagsChange', {
              sourceLanguage,
              targetLanguage,
              cardSource: welcomeScreenAssociatedCards[0].card.source,
              tags: tags.map((tag) => tag.data.title),
            });

            return onTagsChange(id, tags);
          }}
          item={welcomeScreenAssociatedCards[0]}
          deck={deck}
        />
      </View>
      <Text style={{ fontSize: 22, textAlign: 'center' }}>
        {t('welcome.slideCard.saveFlashcardsBefore')}{' '}
        <Icon name="plus-circle-outline" size={18} />{' '}
        {t('welcome.slideCard.saveFlashcardsAfter')}
      </Text>
    </WelcomeScrollView>
  );
};
