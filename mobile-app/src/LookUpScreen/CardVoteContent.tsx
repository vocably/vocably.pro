import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useAppTheme } from '../ThemeProvider';

export type CardVote = 'up' | 'down';

type Props = {
  vote: CardVote | null;
  onVote: (vote: CardVote) => void;
};

const VOTE_ICON_SIZE = 32;

/**
 * The contents of the card quality drawer: invites the user to rate the card.
 * The pressed button stays highlighted, and the user can change their vote.
 */
export const CardVoteContent: FC<Props> = ({ vote, onVote }) => {
  const { t } = useTranslation();
  const theme = useAppTheme();

  const renderButton = (value: CardVote) => {
    const isSelected = vote === value;
    const icon = value === 'up' ? 'thumb-up' : 'thumb-down';

    return (
      <IconButton
        testID={`card-vote-${value}`}
        mode={isSelected ? 'contained' : 'contained-tonal'}
        icon={isSelected ? icon : `${icon}-outline`}
        size={VOTE_ICON_SIZE}
        containerColor={isSelected ? theme.colors.primary : undefined}
        iconColor={isSelected ? theme.colors.onPrimary : theme.colors.primary}
        onPress={() => onVote(value)}
        accessibilityLabel={t(
          value === 'up' ? 'cardVote.voteUp' : 'cardVote.voteDown'
        )}
        accessibilityState={{ selected: isSelected }}
      />
    );
  };

  return (
    <View>
      <Text
        variant="titleLarge"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        {t('cardVote.title')}
      </Text>
      <Text
        variant="bodyLarge"
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        {t('cardVote.description')}
      </Text>
      <View style={styles.actions}>
        {renderButton('up')}
        {renderButton('down')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: '600',
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 20,
  },
});
