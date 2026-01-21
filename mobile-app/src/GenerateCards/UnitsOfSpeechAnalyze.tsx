import { analyzeUnitsOfSpeech } from '@vocably/api';
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
}) => {
  const [analysisItems, setAnalysisItems] = useState<AnalysisItem[]>([]);
  const [unitsToProcess, setUnitsToProcess] = useState(unitsOfSpeech);

  useEffect(() => {
    const chunks = chunk(unitsOfSpeech, 5);

    const processChunks = async () => {
      for (let subUnitsOfSpeech of chunks) {
        const result = await analyzeUnitsOfSpeech({
          unitsOfSpeech: subUnitsOfSpeech,
          sourceLanguage,
          targetLanguage,
        });

        setUnitsToProcess((unitsToProcess) =>
          unitsToProcess.filter((u) => !subUnitsOfSpeech.includes(u))
        );

        if (result.success === false) {
          continue;
        }

        setAnalysisItems((items) => {
          return [...items, ...result.value.items];
        });
      }
    };

    processChunks();
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
      />
      {unitsToProcess.length > 0 && (
        <View style={[wrapperStyle, { gap: 16 }]}>
          <Thinking message="Generating cards..." />
          <View style={{ paddingLeft: 16, gap: 4 }}>
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
