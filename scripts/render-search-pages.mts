#!/usr/bin/env -S npx vite-node

import { TranslationCards } from '@vocably/model';
import { readFileSync } from 'fs';
import { renderToString } from '@vocably/extension-content-ui/hydrate';
import { writeFileSync } from 'node:fs';

const wordResults: Record<string, TranslationCards> = {
  exercise: {
    source: 'exercise',
    sourceLanguage: 'de',
    targetLanguage: 'en',
    isDirect: false,
    deck: { cards: [], tags: [], language: 'de' },
    items: [
      {
        source: 'die Übung',
        translation: 'exercise, practice, drill',
        definitions: [
          'Wiederholtes Ausführen einer Tätigkeit zur Erlangung von Fertigkeit',
          'Eine Aufgabe oder Lerneinheit zum Trainieren',
          'Praktische Anwendung von theoretischem Wissen',
        ],
        examples: [
          'Die tägliche Übung macht den Meister.',
          'Wir machen eine Übung zur Grammatik.',
          'Die militärische Übung dauerte drei Tage.',
        ],
        partOfSpeech: 'noun',
        ipa: 'ˈyːbʊŋ',
        g: 'feminine',
        number: 'singular',
        pluralForm: 'die Übungen',
      },
      {
        source: 'üben',
        translation: 'practice, exercise, train',
        definitions: [
          'Eine Tätigkeit wiederholt ausführen, um Fertigkeiten zu erwerben oder zu verbessern.',
          'Etwas trainieren oder praktizieren.',
          'Eine Wirkung oder einen Einfluss ausüben.',
        ],
        examples: [
          'Ich muss noch viel üben.',
          'Sie übt Klavier.',
          'Er übt seinen Beruf aus.',
          'Das übt einen großen Reiz auf mich aus.',
        ],
        partOfSpeech: 'verb',
        ipa: 'ˈyːbən',
        number: 'singular',
        pastTenses: 'übte, hat geübt',
        presentTenses: 'ich übe, du übst, er/sie/es übt',
        tense: 'present',
      },
      {
        source: 'sport treiben',
        translation: 'do sports, exercise',
        definitions: [
          'Regelmäßig körperliche Aktivitäten ausüben',
          'Sich sportlich betätigen',
          'An Sportarten teilnehmen',
        ],
        examples: [
          'Ich treibe gerne Sport.',
          'Sie treibt jeden Tag Sport.',
          'Wir haben gestern Sport getrieben.',
        ],
        partOfSpeech: 'verb',
        ipa: 'ˈʃpɔʁt ˈtraɪ̯bn̩',
        number: 'singular',
        pastTenses: 'hat Sport getrieben, trieb Sport',
        presentTenses:
          'ich treibe Sport, du treibst Sport, er/sie/es treibt Sport',
        tense: 'present',
      },
      {
        source: 'die Operation',
        translation: 'operation, surgery, procedure, exercise',
        definitions: [
          'Medizinischer Eingriff am Körper',
          'Militärischer Einsatz',
          'Mathematische Verknüpfung von Zahlen oder Objekten',
          'Vorgang oder Tätigkeit zur Erreichung eines Ziels',
        ],
        examples: [
          'Die Operation verlief erfolgreich.',
          'Die militärische Operation begann im Morgengrauen.',
          'Addition ist eine mathematische Operation.',
          'Die Operation des Motors ist komplex.',
        ],
        partOfSpeech: 'noun',
        ipa: 'diː opəʁaˈt͡sjoːn',
        g: 'feminine',
        number: 'singular',
        pluralForm: 'die Operationen',
      },
      {
        source: 'die Bewegung',
        translation: 'movement, motion, exercise, campaign',
        definitions: [
          'Veränderung der Lage oder Stellung eines Körpers',
          'Eine organisierte Gruppe von Menschen mit gemeinsamen Zielen',
          'Innere Ergriffenheit oder Rührung',
        ],
        examples: [
          'Die Bewegung der Planeten.',
          'Eine politische Bewegung.',
          'Sie sprach mit großer Bewegung.',
        ],
        partOfSpeech: 'noun',
        ipa: 'beˈveːɡʊŋ',
        g: 'feminine',
        number: 'singular',
        pluralForm: 'die Bewegungen',
      },
    ],
    detectedInputType: 'word',
    extraItems: [],
    explanation: '',
  },
};

const searchPage = readFileSync('../packages/www/dist/search.html', 'utf-8');

for (const [word, translationCards] of Object.entries(wordResults)) {
  const searchValues = {
    text: word,
    sourceLanguage: 'de',
    targetLanguage: 'en',
    isReversed: false,
  };
  const rendered = await renderToString(
    searchPage.replace(
      '<div id="search"></div>',
      `<div id="search"><vocably-search-form values='${JSON.stringify(searchValues)}'></vocably-search-form><div class="results-container"><vocably-translation  result='${JSON.stringify(
        {
          success: true,
          value: translationCards,
        }
      )}' isLightweight="true" showLanguages="false"></vocably-translation></div></div>`
    ),
    {
      title: `${word} in German | Vocably`,
    }
  );
  writeFileSync('../packages/www/src/static/de.html', rendered.html);
  break;
}

process.exit(0);
