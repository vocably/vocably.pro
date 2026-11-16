import { act, render, screen, userEvent } from '@testing-library/react-native';
import { Result, TagItem } from '@vocably/model';
import { PostHog, PostHogProvider } from 'posthog-react-native';
import { FC, useState } from 'react';
import { Button, PaperProvider } from 'react-native-paper';
import { Tag, TagsMenu } from './TagMenu';

// A real client that never sends anything, the same way the app runs
// with ANALYTICS_DISABLED.
const postHog = new PostHog('phc_test', {
  disabled: true,
  persistence: 'memory',
});

const travel: TagItem = {
  id: 't-travel',
  created: 2,
  data: { title: 'travel' },
};
const food: TagItem = { id: 't-food', created: 1, data: { title: 'food' } };

type HarnessProps = {
  initialTags?: TagItem[];
  initialValue?: TagItem[];
  isAllowedToAdd?: boolean;
  triggerChangeOnSelect?: boolean;
  onChange: (tags: Tag[]) => void;
};

// Keeps the deck tags in state, so removing or renaming a tag
// re-renders the menu the way the deck container does in the app.
const Harness: FC<HarnessProps> = ({
  initialTags = [travel, food],
  initialValue = [],
  onChange,
  ...props
}) => {
  const [tags, setTags] = useState(initialTags);
  const [value] = useState(initialValue);

  const removeTag = async (id: string): Promise<Result<unknown>> => {
    setTags((current) => current.filter((tag) => tag.id !== id));
    return { success: true, value: null };
  };

  const updateTag = async (
    id: string,
    data: Partial<Tag['data']>
  ): Promise<Result<TagItem>> => {
    const tag = tags.find((t) => t.id === id)!;
    const updated = { ...tag, data: { ...tag.data, ...data } };
    setTags((current) => current.map((t) => (t.id === id ? updated : t)));
    return { success: true, value: updated };
  };

  return (
    <PaperProvider>
      <PostHogProvider client={postHog} autocapture={false}>
        <TagsMenu
          value={value}
          existingTags={tags}
          removeTag={removeTag}
          updateTag={updateTag}
          onChange={async (tags) => onChange(tags)}
          renderAnchor={({ openMenu, disabled }) => (
            <Button testID="open-tags" onPress={openMenu} disabled={disabled}>
              Tags
            </Button>
          )}
          {...props}
        />
      </PostHogProvider>
    </PaperProvider>
  );
};

const titles = (tags: Tag[]) => tags.map((tag) => tag.data.title);

const setup = async (props: Omit<HarnessProps, 'onChange'> = {}) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const changes: Tag[][] = [];

  await render(<Harness {...props} onChange={(tags) => changes.push(tags)} />);
  await user.press(screen.getByTestId('open-tags'));

  // Tapping outside dismisses the menu. The backdrop sits next to a view
  // marked accessibilityViewIsModal, so it is hidden from accessibility.
  const closeMenu = () =>
    user.press(
      screen.getByLabelText('Close menu', { includeHiddenElements: true })
    );

  return { user, changes, closeMenu };
};

describe('TagsMenu', () => {
  // Paper animates the menu and the dialog with JS timers.
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
  });

  it('reports the selection once the menu is closed', async () => {
    const { user, changes, closeMenu } = await setup({
      initialValue: [food],
    });

    await user.press(screen.getByTestId('tag-menu-item-travel'));
    await user.press(screen.getByTestId('tag-menu-item-food'));

    expect(changes).toEqual([]);

    await closeMenu();

    expect(changes.map(titles)).toEqual([['travel']]);
  });

  it('reports every selection right away in filter mode', async () => {
    const { user, changes } = await setup({
      isAllowedToAdd: false,
      triggerChangeOnSelect: true,
    });

    expect(screen.queryByTestId('tag-menu-add-new')).toBeNull();

    await user.press(screen.getByTestId('tag-menu-item-food'));
    await user.press(screen.getByTestId('tag-menu-item-travel'));
    await user.press(screen.getByTestId('tag-menu-item-food'));

    expect(changes.map(titles)).toEqual([
      ['food'],
      ['food', 'travel'],
      ['travel'],
    ]);
  });

  it('creates a new tag, selects it and hands it over without an id', async () => {
    const { user, changes, closeMenu } = await setup();

    await user.press(screen.getByTestId('tag-menu-add-new'));
    await user.type(screen.getByTestId('tag-form-input'), '  verbs  ');
    await user.press(screen.getByTestId('tag-form-save'));

    expect(screen.getByTestId('tag-menu-item-verbs')).toBeOnTheScreen();

    await closeMenu();

    expect(changes).toEqual([[{ data: { title: 'verbs' } }]]);
  });

  it('does not let a blank tag be saved', async () => {
    const { user } = await setup();

    await user.press(screen.getByTestId('tag-menu-add-new'));
    await user.type(screen.getByTestId('tag-form-input'), '   ');

    expect(screen.getByTestId('tag-form-save')).toBeDisabled();
  });

  it('keeps a renamed tag selected under its new title', async () => {
    const { user, changes, closeMenu } = await setup({
      initialValue: [travel],
    });

    await user.press(screen.getByTestId('tag-menu-edit-travel'));
    await user.clear(screen.getByTestId('tag-form-input'));
    await user.type(screen.getByTestId('tag-form-input'), 'trips');
    await user.press(screen.getByTestId('tag-form-save'));

    expect(screen.getByTestId('tag-menu-item-trips')).toBeOnTheScreen();
    expect(screen.queryByTestId('tag-menu-item-travel')).toBeNull();

    await closeMenu();

    expect(changes.map(titles)).toEqual([['trips']]);
  });

  it('drops a deleted tag from the deck and from the selection', async () => {
    const { user, changes, closeMenu } = await setup({
      initialValue: [travel, food],
    });

    await user.press(screen.getByTestId('tag-menu-delete-travel'));

    expect(screen.queryByTestId('tag-menu-item-travel')).toBeNull();

    await closeMenu();

    expect(changes.map(titles)).toEqual([['food']]);
  });
});
