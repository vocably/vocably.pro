/**
 * Message types for communication between content script and popup frame
 */

// Messages from Content Script → iframe
export interface ShowTranslationMessage {
  type: 'SHOW_TRANSLATION';
  text: string;
  detectedLanguage?: string;
  context?: string;
  position: {
    top?: number;
    bottom?: number;
    left: number;
  };
  isTouchscreen: boolean;
}

export interface HideMessage {
  type: 'HIDE';
}

export type ContentScriptToFrameMessage = ShowTranslationMessage | HideMessage;

// Messages from iframe → Content Script
export interface FrameReadyMessage {
  type: 'FRAME_READY';
}

export interface SaveCardMessage {
  type: 'SAVE_CARD';
  card: any; // TODO: Define proper card type
}

export interface CloseFrameMessage {
  type: 'CLOSE_FRAME';
}

export interface ResizeFrameMessage {
  type: 'RESIZE_FRAME';
  width: number;
  height: number;
}

export interface TranslateRequestMessage {
  type: 'TRANSLATE';
  text: string;
  detectedLanguage?: string;
  context?: string;
}

export interface ChangeLanguageMessage {
  type: 'CHANGE_LANGUAGE';
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

export interface AddCardMessage {
  type: 'ADD_CARD';
  payload: any; // AddCardPayload from @vocably/model
}

export interface RemoveCardMessage {
  type: 'REMOVE_CARD';
  payload: any; // RemoveCardPayload from @vocably/model
}

export interface AttachTagMessage {
  type: 'ATTACH_TAG';
  payload: any;
  requestId: string;
}

export interface DetachTagMessage {
  type: 'DETACH_TAG';
  payload: any;
  requestId: string;
}

export interface DeleteTagMessage {
  type: 'DELETE_TAG';
  payload: any;
  requestId: string;
}

export interface UpdateTagMessage {
  type: 'UPDATE_TAG';
  payload: any;
  requestId: string;
}

export interface UpdateCardMessage {
  type: 'UPDATE_CARD';
  payload: any;
  requestId: string;
}

export type FrameToContentScriptMessage = 
  | FrameReadyMessage 
  | SaveCardMessage 
  | CloseFrameMessage
  | ResizeFrameMessage
  | TranslateRequestMessage
  | ChangeLanguageMessage
  | AddCardMessage
  | RemoveCardMessage
  | AttachTagMessage
  | DetachTagMessage
  | DeleteTagMessage
  | UpdateTagMessage
  | UpdateCardMessage;

// Messages from Content Script → iframe (responses)
export interface TranslationResultMessage {
  type: 'TRANSLATION_RESULT';
  result: any; // Translation result from API
}

export interface TranslationErrorMessage {
  type: 'TRANSLATION_ERROR';
  error: string;
  requestId?: string;
}

export interface CardResultMessage {
  type: 'CARD_RESULT';
  result: any; // Updated TranslationCards result
  requestId?: string;
}

export interface ExplanationResultMessage {
  type: 'EXPLANATION_RESULT';
  explanation: {
    state: 'loading' | 'loaded' | 'error' | 'none';
    value?: string;
    error?: string;
  };
}

export type ContentScriptToFrameResponse = 
  | TranslationResultMessage 
  | TranslationErrorMessage
  | CardResultMessage
  | ExplanationResultMessage;
