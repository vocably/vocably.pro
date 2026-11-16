import { act, render, screen, userEvent } from '@testing-library/react-native';
import { createRef } from 'react';
import { ChatTextInput, ChatTextInputRef } from './ChatTextInput';

const renderInput = async (
  props: Partial<React.ComponentProps<typeof ChatTextInput>> = {}
) => {
  const submitted: string[] = [];
  const changes: string[] = [];
  const ref = createRef<ChatTextInputRef>();

  await render(
    <ChatTextInput
      ref={ref}
      placeholder="Ask anything"
      onSubmit={(value) => submitted.push(value)}
      onChange={(value) => changes.push(value)}
      {...props}
    />
  );

  return { submitted, changes, ref };
};

const setupUser = () =>
  userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

describe('ChatTextInput', () => {
  // The focus border is animated with JS timers. Fake timers let every
  // animation finish inside act() instead of leaking past the test.
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
  });

  it('keeps the send button disabled until something is typed', async () => {
    const user = setupUser();
    await renderInput();

    expect(screen.getByTestId('chat-send')).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Ask anything'), 'hi');

    expect(screen.getByTestId('chat-send')).toBeEnabled();
  });

  it('sends what the user typed', async () => {
    const user = setupUser();
    const { submitted, changes } = await renderInput();

    await user.type(screen.getByTestId('chat-input'), 'Why "de"?');
    await user.press(screen.getByTestId('chat-send'));

    expect(changes[changes.length - 1]).toBe('Why "de"?');
    expect(submitted).toEqual(['Why "de"?']);
  });

  it('sends from the keyboard return key', async () => {
    const user = setupUser();
    const { submitted } = await renderInput();

    await user.type(screen.getByTestId('chat-input'), 'fiets', {
      submitEditing: true,
    });

    expect(submitted).toEqual(['fiets']);
  });

  it('starts with the initial value ready to be sent', async () => {
    const user = setupUser();
    const { submitted, ref } = await renderInput({ initialValue: 'gezellig' });

    expect(screen.getByTestId('chat-input')).toHaveDisplayValue('gezellig');
    expect(ref.current?.getValue()).toBe('gezellig');

    await user.press(screen.getByTestId('chat-send'));

    expect(submitted).toEqual(['gezellig']);
  });

  it('lets the parent replace the text through the ref', async () => {
    const user = setupUser();
    const { submitted, ref } = await renderInput();

    await act(() => ref.current?.setValue('Explain "uitwaaien"'));

    expect(screen.getByTestId('chat-input')).toHaveDisplayValue(
      'Explain "uitwaaien"'
    );
    expect(screen.getByTestId('chat-send')).toBeEnabled();

    await user.press(screen.getByTestId('chat-send'));
    expect(submitted).toEqual(['Explain "uitwaaien"']);
  });

  it('lets the parent clear the text after sending', async () => {
    const user = setupUser();
    const { ref } = await renderInput();

    await user.type(screen.getByTestId('chat-input'), 'hallo');
    await act(() => ref.current?.setValue(''));

    expect(ref.current?.getValue()).toBe('');
    expect(screen.getByTestId('chat-send')).toBeDisabled();
  });

  it('ignores typing while disabled', async () => {
    const user = setupUser();
    const { changes, submitted } = await renderInput({ disabled: true });

    await user.type(screen.getByTestId('chat-input'), 'hallo', {
      submitEditing: true,
    });

    expect(changes).toEqual([]);
    expect(submitted).toEqual([]);
    expect(screen.getByTestId('chat-send')).toBeDisabled();
  });
});
