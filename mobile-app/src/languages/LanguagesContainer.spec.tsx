import {
  act,
  render,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native';
import { configureApi } from '@vocably/api';
import { LanguageDeck, SrsCard, TagItem } from '@vocably/model';
import { serializeDeck } from '@vocably/model-operations';
import { createSrsItem } from '@vocably/srs';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { ContextType, FC, useContext } from 'react';
import { Text, View } from 'react-native';
import * as asyncAppStorage from '../asyncAppStorage';
import { AuthStatus, saveAuthStatusToStorage } from '../auth/authStatusStorage';
import {
  createDefaultLanguageContainerDeck,
  DecksCollection,
  LanguagesContainer,
  LanguagesContext,
  saveDecksToStorage,
  saveSelectedLanguageToStorage,
} from './LanguagesContainer';

type Languages = ContextType<typeof LanguagesContext>;

// An in-process stand-in for the `/languages` endpoints of the API. It
// speaks HTTP, so the real `@vocably/api` client talks to it through `fetch`.
type Backend = {
  url: string;
  decks: Record<string, ReturnType<typeof serializeDeck>>;
  requests: string[];
  isDown: boolean;
  // Methods that fail while the rest of the API keeps working.
  failingMethods: string[];
  close: () => Promise<void>;
};

const startBackend = async (): Promise<Backend> => {
  const backend = {
    decks: {},
    requests: [],
    isDown: false,
    failingMethods: [],
  } as unknown as Backend;

  const server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk: Buffer) => (body += chunk.toString()));
    req.on('end', () => {
      const method = req.method ?? 'GET';
      const path = req.url ?? '/';
      backend.requests.push(`${method} ${path}`);

      if (backend.isDown || backend.failingMethods.includes(method)) {
        res.statusCode = 500;
        res.end('Server is down');
        return;
      }

      if (method === 'GET' && path === '/languages') {
        const contents = Object.keys(backend.decks)
          .map(
            (language) => `<Contents><Key>user-1/${language}</Key></Contents>`
          )
          .join('');
        res.setHeader('Content-Type', 'application/xml');
        res.end(`<ListBucketResult>${contents}</ListBucketResult>`);
        return;
      }

      const language = path.replace(/^\/languages\//, '');

      if (method === 'GET') {
        const deck = backend.decks[language];
        if (deck) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(deck));
          return;
        }
        res.end();
        return;
      }

      if (method === 'PUT') {
        backend.decks[language] = JSON.parse(body);
        res.end();
        return;
      }

      if (method === 'DELETE') {
        delete backend.decks[language];
        res.end();
        return;
      }

      res.statusCode = 404;
      res.end();
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  backend.url = `http://127.0.0.1:${port}`;
  backend.close = () =>
    new Promise<void>((resolve) => {
      server.closeAllConnections();
      server.close(() => resolve());
    });

  return backend;
};

const loggedIn: AuthStatus = {
  status: 'logged-in',
  sub: 'user-1',
  email: 'user@example.com',
  isPaidGroup: false,
};

const anonymous: AuthStatus = {
  status: 'anonymous-logged-in',
  id: 'anonymous-1',
};

const makeCard = (language: string, source: string): SrsCard => ({
  ...createSrsItem(),
  language,
  source,
  definition: '',
  translation: '',
  partOfSpeech: 'noun',
  tags: [],
});

const makeDeck = (
  language: string,
  sources: string[] = [],
  tags: TagItem[] = []
): LanguageDeck => ({
  language,
  tags,
  cards: sources.map((source) => ({
    id: `c-${source}`,
    created: 1,
    data: makeCard(language, source),
  })),
  settings: {},
});

const travel: TagItem = {
  id: 't-travel',
  created: 1,
  data: { title: 'travel' },
};

// Renders what the container exposes, and keeps the latest context value
// so a test can call its operations the way screens do.
const context: { current: Languages | null } = { current: null };
const languages = () => context.current!;

const Probe: FC = () => {
  const value = useContext(LanguagesContext);
  context.current = value;

  return (
    <View>
      <Text testID="languages">{value.languages.join(',')}</Text>
      <Text testID="selected-language">{value.selectedLanguage}</Text>
      {Object.entries(value.decks).map(([language, container]) => (
        <Text key={language} testID={`cards-${language}`}>
          {container.deck.cards.map((card) => card.data.source).join(',')}
        </Text>
      ))}
    </View>
  );
};

const renderContainer = () =>
  render(
    <LanguagesContainer>
      <Probe />
    </LanguagesContainer>
  );

const textOf = (testID: string) => {
  const children = screen.getByTestId(testID).props.children;
  return Array.isArray(children) ? children.join('') : String(children ?? '');
};

const serverSources = (backend: Backend, language: string) =>
  (backend.decks[language]?.cards ?? []).map((card) => card.data.source);

let backend: Backend;

beforeEach(async () => {
  backend = await startBackend();
  configureApi({
    publicBaseUrl: backend.url,
    baseUrl: backend.url,
    region: 'test',
    cardsBucket: 'test',
    getJwtToken: async () => 'token',
  });

  context.current = null;
  await asyncAppStorage.clearAll();
  await saveAuthStatusToStorage(loggedIn);
});

afterEach(async () => {
  await backend.close();
});

describe('LanguagesContainer', () => {
  it('shows a loader, then the languages from the server with the first one selected', async () => {
    backend.decks.en = serializeDeck(makeDeck('en', ['hello']));
    backend.decks.fr = serializeDeck(makeDeck('fr', ['bonjour']));

    await renderContainer();

    expect(screen.getByText('Loading languages...')).toBeTruthy();

    await waitFor(() => expect(textOf('languages')).toBe('en,fr'));
    await waitFor(() => expect(textOf('selected-language')).toBe('en'));
    expect(textOf('cards-en')).toBe('hello');
    expect(textOf('cards-fr')).toBe('bonjour');

    const stored = JSON.parse(
      (await asyncAppStorage.getItem('user-1.languageDecks'))!
    );
    expect(Object.keys(stored)).toEqual(['en', 'fr']);
  });

  it('keeps the language that was selected before', async () => {
    backend.decks.en = serializeDeck(makeDeck('en'));
    backend.decks.fr = serializeDeck(makeDeck('fr'));
    await saveSelectedLanguageToStorage('fr');

    await renderContainer();

    await waitFor(() => expect(textOf('languages')).toBe('en,fr'));
    expect(textOf('selected-language')).toBe('fr');
  });

  it('shows the cached decks while the server is down', async () => {
    backend.isDown = true;
    await saveDecksToStorage({
      en: {
        ...createDefaultLanguageContainerDeck('en'),
        status: 'loaded',
        deck: makeDeck('en', ['cached']),
      },
    });

    await renderContainer();

    expect(await screen.findByTestId('cards-en')).toBeTruthy();
    expect(textOf('cards-en')).toBe('cached');
    await waitFor(() => expect(textOf('selected-language')).toBe('en'));
    await waitFor(() => expect(backend.requests).toContain('GET /languages'));
  });

  it('shows an error when nothing is cached and the server is down, and recovers on retry', async () => {
    backend.isDown = true;
    backend.decks.en = serializeDeck(makeDeck('en', ['hello']));

    await renderContainer();

    expect(await screen.findByTestId('error-retry')).toBeTruthy();
    expect(screen.queryByTestId('languages')).toBeNull();

    backend.isDown = false;
    const user = userEvent.setup();
    await user.press(screen.getByTestId('error-retry'));

    await waitFor(() => expect(textOf('cards-en')).toBe('hello'));
  });

  it('adds a card locally right away and syncs it to the server', async () => {
    backend.decks.en = serializeDeck(makeDeck('en', ['hello']));
    await renderContainer();
    await waitFor(() => expect(textOf('cards-en')).toBe('hello'));

    let result: Awaited<ReturnType<Languages['addCard']>> | undefined;
    await act(async () => {
      result = await languages().addCard('en', makeCard('en', 'goodbye'));
    });

    expect(result?.success).toBe(true);
    expect(textOf('cards-en')).toBe('hello,goodbye');
    await waitFor(() =>
      expect(serverSources(backend, 'en')).toEqual(['hello', 'goodbye'])
    );
    expect(backend.requests).toContain('PUT /languages/en');

    // Every transformation was synced, so none is left in the queue.
    await waitFor(async () =>
      expect(
        JSON.parse(
          (await asyncAppStorage.getItem('user-1.languageTransformations'))!
        )
      ).toEqual({ en: [] })
    );
  });

  it('keeps changes made while the server is down and pushes them once it is back', async () => {
    backend.decks.en = serializeDeck(makeDeck('en', ['hello']));
    await renderContainer();
    await waitFor(() => expect(textOf('cards-en')).toBe('hello'));

    backend.isDown = true;
    await act(async () => {
      await languages().addCard('en', makeCard('en', 'offline'));
    });
    expect(textOf('cards-en')).toBe('hello,offline');

    await waitFor(async () =>
      expect(
        JSON.parse(
          (await asyncAppStorage.getItem('user-1.languageTransformations'))!
        ).en
      ).toHaveLength(1)
    );

    // A refresh that fails must not lose the local change.
    await act(async () => {
      await languages().refreshLanguages();
    });
    expect(textOf('cards-en')).toBe('hello,offline');
    expect(serverSources(backend, 'en')).toEqual(['hello']);

    // The server lists and loads decks again but still can't save them: the
    // server copy of the deck is behind, so the local one has to win.
    backend.isDown = false;
    backend.failingMethods = ['PUT'];
    await act(async () => {
      await languages().refreshLanguages();
    });
    expect(textOf('cards-en')).toBe('hello,offline');
    expect(serverSources(backend, 'en')).toEqual(['hello']);

    backend.failingMethods = [];
    await act(async () => {
      await languages().refreshLanguages();
    });

    expect(serverSources(backend, 'en')).toEqual(['hello', 'offline']);
    expect(textOf('cards-en')).toBe('hello,offline');
  });

  it('updates and removes cards on the server', async () => {
    backend.decks.en = serializeDeck(makeDeck('en', ['hello', 'bye']));
    await renderContainer();
    await waitFor(() => expect(textOf('cards-en')).toBe('hello,bye'));

    let updateResult: Awaited<ReturnType<Languages['updateCard']>> | undefined;
    await act(async () => {
      updateResult = await languages().updateCard('en', 'c-hello', {
        translation: 'hallo',
      });
    });
    expect(updateResult).toMatchObject({
      success: true,
      value: { id: 'c-hello' },
    });
    expect(
      languages().decks.en.deck.cards.find((card) => card.id === 'c-hello')
        ?.data.translation
    ).toBe('hallo');
    await waitFor(() =>
      expect(
        backend.decks.en.cards.find((card) => card.id === 'c-hello')?.data
          .translation
      ).toBe('hallo')
    );

    await act(async () => {
      await languages().removeCard('en', 'c-bye');
    });
    expect(textOf('cards-en')).toBe('hello');
    await waitFor(() =>
      expect(serverSources(backend, 'en')).toEqual(['hello'])
    );
  });

  it('fails to update a card that does not exist', async () => {
    backend.decks.en = serializeDeck(makeDeck('en', ['hello']));
    await renderContainer();
    await waitFor(() => expect(textOf('cards-en')).toBe('hello'));

    let result: Awaited<ReturnType<Languages['updateCard']>> | undefined;
    await act(async () => {
      result = await languages().updateCard('en', 'c-missing', {
        translation: 'nothing',
      });
    });

    expect(result).toEqual({
      success: false,
      reason: 'Unable to find card with id c-missing',
    });
  });

  it('adds, renames and removes tags and saves deck settings on the server', async () => {
    backend.decks.en = serializeDeck(makeDeck('en', ['hello']));
    await renderContainer();
    await waitFor(() => expect(textOf('cards-en')).toBe('hello'));

    let addResult: Awaited<ReturnType<Languages['addTag']>> | undefined;
    await act(async () => {
      addResult = await languages().addTag('en', { title: 'travel' });
    });
    expect(addResult?.success).toBe(true);
    const tagId = addResult?.success ? addResult.value.id : '';
    await waitFor(() =>
      expect(
        (backend.decks.en.tags ?? []).map((tag) => tag.data.title)
      ).toEqual(['travel'])
    );

    await act(async () => {
      await languages().updateTag('en', tagId, { title: 'trips' });
    });
    expect(languages().decks.en.deck.tags[0].data.title).toBe('trips');
    await waitFor(() =>
      expect(
        (backend.decks.en.tags ?? []).map((tag) => tag.data.title)
      ).toEqual(['trips'])
    );

    await act(async () => {
      await languages().removeTag('en', tagId);
    });
    expect(languages().decks.en.deck.tags).toEqual([]);
    await waitFor(() => expect(backend.decks.en.tags).toEqual([]));

    await act(async () => {
      await languages().updateSettings('en', { hideDefinitions: true });
    });
    expect(languages().decks.en.deck.settings).toEqual({
      hideDefinitions: true,
    });
    await waitFor(() =>
      expect(backend.decks.en.settings).toEqual({ hideDefinitions: true })
    );
  });

  it('keeps the selected tags of a deck when the decks are refreshed', async () => {
    backend.decks.en = serializeDeck(makeDeck('en', ['hello'], [travel]));
    await renderContainer();
    await waitFor(() => expect(textOf('cards-en')).toBe('hello'));

    await act(async () => {
      await languages().storeDeck({
        ...languages().decks.en,
        selectedTags: [travel],
      });
    });

    await act(async () => {
      await languages().refreshLanguages();
    });

    expect(languages().decks.en.selectedTags).toEqual([travel]);
  });

  it('adds a new language on the server and selects it', async () => {
    backend.decks.en = serializeDeck(makeDeck('en'));
    await renderContainer();
    await waitFor(() => expect(textOf('selected-language')).toBe('en'));

    let result: Awaited<ReturnType<Languages['addNewLanguage']>> | undefined;
    await act(async () => {
      result = await languages().addNewLanguage('de');
    });

    expect(result?.success).toBe(true);
    expect(textOf('languages')).toBe('en,de');
    expect(textOf('selected-language')).toBe('de');
    expect(backend.requests).toContain('PUT /languages/de');
    expect(Object.keys(backend.decks)).toEqual(['en', 'de']);
  });

  it('does not add a language twice, but selects it', async () => {
    backend.decks.en = serializeDeck(makeDeck('en'));
    backend.decks.fr = serializeDeck(makeDeck('fr'));
    await renderContainer();
    await waitFor(() => expect(textOf('selected-language')).toBe('en'));

    let result: Awaited<ReturnType<Languages['addNewLanguage']>> | undefined;
    await act(async () => {
      result = await languages().addNewLanguage('fr');
    });

    expect(result?.success).toBe(false);
    expect(textOf('languages')).toBe('en,fr');
    expect(textOf('selected-language')).toBe('fr');
    expect(backend.requests).not.toContain('PUT /languages/fr');
  });

  it('deletes a language on the server and selects the remaining one', async () => {
    backend.decks.en = serializeDeck(makeDeck('en', ['hello']));
    backend.decks.fr = serializeDeck(makeDeck('fr', ['bonjour']));
    await renderContainer();
    await waitFor(() => expect(textOf('selected-language')).toBe('en'));

    await act(async () => {
      await languages().deleteLanguage('en');
    });

    expect(backend.requests).toContain('DELETE /languages/en');
    expect(Object.keys(backend.decks)).toEqual(['fr']);
    expect(textOf('languages')).toBe('fr');
    await waitFor(() => expect(textOf('selected-language')).toBe('fr'));
  });

  it('keeps the language when the server refuses to delete it', async () => {
    backend.decks.en = serializeDeck(makeDeck('en', ['hello']));
    await renderContainer();
    await waitFor(() => expect(textOf('selected-language')).toBe('en'));

    backend.isDown = true;
    let result: Awaited<ReturnType<Languages['deleteLanguage']>> | undefined;
    await act(async () => {
      result = await languages().deleteLanguage('en');
    });

    expect(result?.success).toBe(false);
    expect(textOf('languages')).toBe('en');
    expect(textOf('cards-en')).toBe('hello');
  });

  it('keeps everything on the device for anonymous users', async () => {
    await saveAuthStatusToStorage(anonymous);
    const cached: DecksCollection = {
      en: {
        ...createDefaultLanguageContainerDeck('en'),
        status: 'loaded',
        deck: makeDeck('en', ['hello']),
      },
    };
    await saveDecksToStorage(cached);

    await renderContainer();
    await waitFor(() => expect(textOf('selected-language')).toBe('en'));

    await act(async () => {
      await languages().addNewLanguage('de');
    });
    expect(textOf('languages')).toBe('en,de');
    expect(textOf('selected-language')).toBe('de');

    await act(async () => {
      await languages().addCard('de', makeCard('de', 'hallo'));
    });
    expect(textOf('cards-de')).toBe('hallo');

    await act(async () => {
      await languages().deleteLanguage('en');
    });
    expect(textOf('languages')).toBe('de');

    const stored = JSON.parse(
      (await asyncAppStorage.getItem('anonymous.languageDecks'))!
    );
    expect(Object.keys(stored)).toEqual(['de']);
    expect(backend.requests).toEqual([]);
  });
});
