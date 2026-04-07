import { readFileSync, writeFileSync } from 'fs';

const deck = JSON.parse(readFileSync('deck-as-is.json', 'utf8'));

for (let card of deck.cards) {
  if (card.data.partOfSpeech !== 'verb') {
    continue;
  }

  const unitOfSpeech = JSON.parse(
    readFileSync(
      `../../vocably-languages/de/units-of-speech/${card.data.source}/verb.json`
    )
  );

  card.data.presentTenses = unitOfSpeech.presentTenses;
}

writeFileSync('deck-as-is.json', JSON.stringify(deck));
writeFileSync('deck.json', JSON.stringify(deck, null, 2));
