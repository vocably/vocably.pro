import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import { TextInput } from 'react-native';
import { IconButton } from 'react-native-paper';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { SearchInput } from './SearchInput';

jest.mock('@react-native-clipboard/clipboard', () =>
  require('@react-native-clipboard/clipboard/jest/clipboard-mock')
);
jest.mock('react-native-paper', () => ({ IconButton: 'IconButton' }));
jest.mock('./ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: { inputBg: '#fff', inputBgFocused: '#eee' },
  }),
}));

let renderer: ReactTestRenderer;

afterEach(async () => {
  await act(async () => renderer.unmount());
});

it('disables search, clear and paste alongside the text input', async () => {
  const props = {
    placeholder: '',
    onChange: jest.fn(),
    onSubmit: jest.fn(),
    pasteFromClipboard: true,
  };

  await act(async () => {
    renderer = create(<SearchInput {...props} value="word" disabled />);
  });
  expect(renderer!.root.findByType(TextInput).props.editable).toBe(false);
  expect(
    renderer!.root
      .findAllByType(IconButton)
      .map((button) => button.props.disabled)
  ).toEqual([true, true]);

  await act(async () => {
    renderer!.update(<SearchInput {...props} value="" />);
    renderer!.root.findByType(TextInput).props.onFocus();
  });
  await act(async () => {
    renderer!.update(<SearchInput {...props} value="" disabled />);
  });
  expect(
    renderer!.root.findByProps({ icon: 'content-paste' }).props.disabled
  ).toBe(true);
});

it('checks the clipboard on focus only when pasting is enabled', async () => {
  jest.mocked(Clipboard.hasString).mockClear();
  const props = {
    value: '',
    placeholder: '',
    onChange: jest.fn(),
    onSubmit: jest.fn(),
  };

  await act(async () => {
    renderer = create(<SearchInput {...props} />);
  });
  await act(async () => renderer!.root.findByType(TextInput).props.onFocus());
  expect(Clipboard.hasString).not.toHaveBeenCalled();

  await act(async () => {
    renderer!.update(<SearchInput {...props} pasteFromClipboard />);
  });
  expect(Clipboard.hasString).not.toHaveBeenCalled();
  await act(async () => renderer!.root.findByType(TextInput).props.onFocus());
  expect(Clipboard.hasString).toHaveBeenCalledTimes(1);
  expect(renderer!.root.findByProps({ icon: 'content-paste' })).toBeTruthy();

  jest.mocked(Clipboard.hasString).mockResolvedValueOnce(false);
  await act(async () => renderer!.root.findByType(TextInput).props.onFocus());
  expect(Clipboard.hasString).toHaveBeenCalledTimes(2);
  expect(renderer!.root.findAllByProps({ icon: 'content-paste' })).toHaveLength(
    0
  );
});
