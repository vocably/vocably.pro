import { exec } from 'child_process';
import { config } from 'dotenv-flow';
import { writeFileSync } from 'fs';
import { inspect, promisify } from 'node:util';
import 'zx/globals';

config();

const execute = promisify(exec);

const key = process.argv[2];

const deckAsIs =
  (await execute(`aws s3 cp s3://vocably-prod-cards/${key} -`)).stdout || '""';

const deck = JSON.parse(deckAsIs);

const cards = deck.cards
  .sort((a, b) => b.created - a.created)
  .map((card) => ({
    ...card,
    created: new Date(card.created),
    updated: card.updated && new Date(card.updated),
  }));

writeFileSync(
  `deck.json`,
  JSON.stringify(
    {
      ...deck,
      cards,
    },
    null,
    '  '
  )
);

writeFileSync(`deck-as-is.json`, deckAsIs);

console.log('cards', inspect(cards, { depth: null }));

console.log('# of cards', cards.length);
