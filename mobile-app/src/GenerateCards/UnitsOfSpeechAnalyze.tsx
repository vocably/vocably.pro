import {
  AnalysisItem,
  CardItem,
  GoogleLanguage,
  Result,
  TagItem,
  UnitOfSpeech,
} from '@vocably/model';
import { chunk } from 'lodash-es';
import React, { FC, useEffect, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { analyzeUnitsOfSpeech } from '../api';
import { Thinking } from '../Chat/Thinking';
import { Deck } from '../languageDeck/useLanguageDeck';
import { AnalyzeResult } from '../LookUpScreen/AnalyzeResult';
import { AssociatedCard } from '../LookUpScreen/associateCards';

type Props = {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  unitsOfSpeech: UnitOfSpeech[];
  wrapperStyle?: StyleProp<ViewStyle>;
  cards: CardItem[];
  onAdd: (card: AssociatedCard) => Promise<Result<CardItem>>;
  onRemove: (card: AssociatedCard) => Promise<Result<unknown>>;
  onTagsChange: (id: string, tags: TagItem[]) => Promise<Result<unknown>>;
  deck: Deck;
  abortController?: AbortController;
  alwaysShowSeparator?: boolean;
  leftInset?: number;
  rightInset?: number;
};

const UnitsOfSpeechAnalyze: FC<Props> = ({
  unitsOfSpeech,
  wrapperStyle = {},
  sourceLanguage,
  targetLanguage,
  cards,
  onAdd,
  onRemove,
  onTagsChange,
  deck,
  abortController,
  alwaysShowSeparator,
  leftInset,
  rightInset,
}) => {
  const [analysisItems, setAnalysisItems] = useState<AnalysisItem[]>([]);
  const [unitsToProcess, setUnitsToProcess] = useState(unitsOfSpeech);

  useEffect(() => {
    const processUnitsOfSpeech = async (
      unitsOfSpeech: UnitOfSpeech[]
    ): Promise<boolean> => {
      const result = await analyzeUnitsOfSpeech(
        {
          unitsOfSpeech: unitsOfSpeech,
          sourceLanguage,
          targetLanguage,
        },
        abortController
      );

      if (result.success === false) {
        return false;
      }

      setUnitsToProcess((unitsToProcess) =>
        unitsToProcess.filter((u) => !unitsToProcess.includes(u))
      );

      setAnalysisItems((items) => {
        return [...items, ...result.value.items];
      });

      return true;
    };

    const processChunks = async (chunks: Array<UnitOfSpeech[]>) => {
      for (let unitsOfSpeech of chunks) {
        const success = await processUnitsOfSpeech(unitsOfSpeech);
        if (success) {
          continue;
        }

        // Attempting to recover from the unsuccessful generation
        const smallerChunks = chunk(unitsOfSpeech, 3);
        for (let smallChunk of smallerChunks) {
          await processUnitsOfSpeech(smallChunk);
          setUnitsToProcess((unitsToProcess) =>
            unitsToProcess.filter((u) => !smallChunk.includes(u))
          );
        }
      }
    };

    const chunks = chunk(unitsOfSpeech, 5);

    processChunks(chunks);
  }, []);

  return (
    <>
      <AnalyzeResult
        cards={cards}
        onAdd={onAdd}
        onRemove={onRemove}
        onTagsChange={onTagsChange}
        isSharedLookup={false}
        deck={deck}
        analysis={{
          sourceLanguage,
          targetLanguage,
          // @ts-ignore
          items: analysisItems,
        }}
        alwaysShowSeparator={alwaysShowSeparator}
        leftInset={leftInset}
        rightInset={rightInset}
      />
      {unitsToProcess.length > 0 && (
        <View style={[wrapperStyle, { gap: 16 }]}>
          <Thinking message="Generating cards..." />
          <View style={{ paddingLeft: 16, gap: 4 }}>
            <Text>The following cards will be generated:</Text>
            {unitsToProcess.map((unitOfSpeech) => (
              <Text key={unitOfSpeech.headword + unitOfSpeech.partOfSpeech}>
                - {unitOfSpeech.headword}
              </Text>
            ))}
          </View>
        </View>
      )}
    </>
  );
};
export default UnitsOfSpeechAnalyze;
