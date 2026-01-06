import { defineCustomElements } from '@vocably/extension-content-ui/loader';
import { GoogleLanguage } from '@vocably/model';

console.log('[Vocably Frame] Initializing popup frame...');

// Initialize Stencil.js custom elements in extension page context
// This works because we're in extension page context, not content script context
(async () => {
  try {
    await defineCustomElements();
    console.log('[Vocably Frame] Custom elements defined successfully');
  } catch (err) {
    console.error('[Vocably Frame] Failed to define custom elements:', err);
  }
})();

// Message types for communication with content script
interface ShowTranslationMessage {
  type: 'SHOW_TRANSLATION';
  text: string;
  detectedLanguage?: GoogleLanguage;
  context?: string;
  position: {
    top?: number;
    bottom?: number;
    left: number;
  };
  isTouchscreen: boolean;
}

interface HideMessage {
  type: 'HIDE';
}

type ContentScriptMessage = ShowTranslationMessage | HideMessage;

// Get root element
const root = document.getElementById('root');
if (!root) {
  throw new Error('[Vocably Frame] Root element not found');
}

// Current button and popup elements
let currentButton: HTMLElement | null = null;
let currentOverlay: HTMLElement | null = null;
let currentTranslation: HTMLElement | null = null;

// Import API helper (will be available from content-ui)
const getApiBase = () => {
  // Use browser extension message passing to get API
  return {
    async getSettings() {
      return { autoPlay: false }; // TODO: Get real settings
    }
  };
};

// Request ID generator
const generateId = () => Math.random().toString(36).substring(2, 15);

// Pending requests map
const pendingRequests = new Map<string, { resolve: (value: any) => void, reject: (reason: any) => void }>();

/**
 * Send request to content script and wait for response
 */
function sendRequest(type: string, payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestId = generateId();
    pendingRequests.set(requestId, { resolve, reject });
    
    notifyContentScript({
      type,
      payload,
      requestId,
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        reject(new Error('Request timed out'));
      }
    }, 30000);
  });
}

/**
 * Create and show popup with translation
 */
async function showPopup(params: {
  text: string;
  detectedLanguage?: GoogleLanguage;
  context?: string;
}) {
  console.log('[Vocably Frame] Creating popup for:', params.text);
  
  // Create translation element - this is the actual content
  const translation = document.createElement('vocably-translation') as any;
  translation.phrase = params.text;
  if (params.detectedLanguage) {
    translation.sourceLanguage = params.detectedLanguage;
  }
  
  // Implement proxy methods for tag operations
  translation.attachTag = (data: any) => sendRequest('ATTACH_TAG', data);
  translation.detachTag = (data: any) => sendRequest('DETACH_TAG', data);
  translation.deleteTag = (data: any) => sendRequest('DELETE_TAG', data);
  translation.updateTag = (data: any) => sendRequest('UPDATE_TAG', data);
  translation.updateCard = (data: any) => sendRequest('UPDATE_CARD', data);
  
  // Add language change event listeners
  translation.addEventListener('changeSourceLanguage', (event: CustomEvent) => {
    console.log('[Vocably Frame] Source language changed to:', event.detail);
    notifyContentScript({
      type: 'CHANGE_LANGUAGE',
      text: params.text,
      sourceLanguage: event.detail,
    });
  });
  
  translation.addEventListener('changeTargetLanguage', (event: CustomEvent) => {
    console.log('[Vocably Frame] Target language changed to:', event.detail);
    notifyContentScript({
      type: 'CHANGE_LANGUAGE',
      text: params.text,
      targetLanguage: event.detail,
    });
  });
  
  // Add card event listeners
  translation.addEventListener('addCard', (event: CustomEvent) => {
    console.log('[Vocably Frame] Add card:', event.detail);
    translation.isUpdating = event.detail.card;
    notifyContentScript({
      type: 'ADD_CARD',
      payload: event.detail,
    });
  });
  
  translation.addEventListener('removeCard', (event: CustomEvent) => {
    console.log('[Vocably Frame] Remove card:', event.detail);
    translation.isUpdating = event.detail.card;
    notifyContentScript({
      type: 'REMOVE_CARD',
      payload: event.detail,
    });
  });
  
  // Store reference for later update
  currentTranslation = translation;
  
  // Create popup container with proper size constraints
  const popup = document.createElement('vocably-popup');
  // Override default max-height (48vh) which is too small inside iframe
  popup.style.setProperty('--max-height', '480px');
  popup.style.setProperty('--max-width', '380px');
  popup.appendChild(translation);
  
  // Create overlay
  const overlay = document.createElement('vocably-overlay');
  overlay.style.setProperty('--backdropOpacity', '0');
  (overlay as any).closeKeyCode = ['Escape', 'Space'];
  overlay.appendChild(popup);
  
  // Listen for close event
  overlay.addEventListener('close', () => {
    console.log('[Vocably Frame] Popup closed');
    destroyPopup();
    notifyContentScript({ type: 'CLOSE_FRAME' });
  });
  
  // Add blur/clickOutside handler for auto-close
  overlay.addEventListener('click', (e) => {
    // Close if clicking on overlay background (not the popup itself)
    if (e.target === overlay) {
      console.log('[Vocably Frame] Clicked outside, closing popup');
      destroyPopup();
      notifyContentScript({ type: 'CLOSE_FRAME' });
    }
  });
  
  // Add to DOM
  root.appendChild(overlay);
  currentOverlay = overlay;
  
  // Request translation from content script
  console.log('[Vocably Frame] Requesting translation...');
  notifyContentScript({
    type: 'TRANSLATE',
    text: params.text,
    detectedLanguage: params.detectedLanguage,
    context: params.context,
  });
  
  console.log('[Vocably Frame] Popup created and shown, awaiting translation...');
}

/**
 * Destroy current popup
 */
function destroyPopup() {
  if (currentOverlay) {
    currentOverlay.remove();
    currentOverlay = null;
  }
  currentTranslation = null;
}

/**
 * Send message to content script
 */
function notifyContentScript(message: any) {
  window.parent.postMessage(message, '*');
}

/**
 * Handle button click - show popup
 */
function handleButtonClick(params: {
  text: string;
  detectedLanguage?: GoogleLanguage;
  context?: string;
}) {
  console.log('[Vocably Frame] Button clicked');
  
  // Hide button
  if (currentButton) {
    currentButton.remove();
    currentButton = null;
  }
  
  // Request iframe resize before showing popup
  // Use fixed dimensions - window.innerWidth/Height returns iframe's own size, not parent's
  const popupWidth = 400;
  const popupHeight = 500;
  notifyContentScript({ 
    type: 'RESIZE_FRAME', 
    width: popupWidth, 
    height: popupHeight 
  });
  console.log('[Vocably Frame] Requested iframe resize to:', popupWidth, 'x', popupHeight);
  
  // Show popup
  showPopup(params);
}

// Listen for messages from content script
window.addEventListener('message', async (event: MessageEvent) => {
  // Security: only accept messages from our extension
  const message = event.data;
  
  console.log('[Vocably Frame] Received message:', message.type);
  
  if (message.type === 'SHOW_TRANSLATION') {
    // Store message data for button click
    const messageData = {
      text: message.text,
      detectedLanguage: message.detectedLanguage,
      context: message.context,
    };
    
    // Create button element
    const buttonTag = message.isTouchscreen ? 'vocably-mobile-button' : 'vocably-button';
    currentButton = document.createElement(buttonTag);
    
    // Add click handler
    currentButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleButtonClick(messageData);
    });
    
    // Clear previous content
    root.innerHTML = '';
    root.appendChild(currentButton);
    
    console.log('[Vocably Frame] Button created:', buttonTag);
    
  } else if (message.type === 'HIDE') {
    // Hide/remove button and popup
    if (currentButton) {
      currentButton.remove();
      currentButton = null;
    }
    destroyPopup();
    root.innerHTML = '';
    console.log('[Vocably Frame] Frame hidden');
    
  } else if (message.type === 'TRANSLATION_RESULT') {
    // Received translation result from content script
    console.log('[Vocably Frame] Translation result received:', message.result);
    
    // Update the translation element with the result
    if (currentTranslation) {
      (currentTranslation as any).result = message.result;
      
      // Set source and target language from result
      if (message.result.success && message.result.value) {
        (currentTranslation as any).sourceLanguage = message.result.value.sourceLanguage;
        (currentTranslation as any).targetLanguage = message.result.value.targetLanguage;
      }
      
      console.log('[Vocably Frame] Translation element updated with result');
    } else {
      console.warn('[Vocably Frame] Translation element not found');
    }
    
  } else if (message.type === 'TRANSLATION_ERROR') {
    // Received translation error from content script
    console.error('[Vocably Frame] Translation error:', message.error);
    
    // Check if this is a response to a pending request
    if (message.requestId && pendingRequests.has(message.requestId)) {
      const { reject } = pendingRequests.get(message.requestId)!;
      pendingRequests.delete(message.requestId);
      reject(new Error(message.error));
      return;
    }
    
    // Update the translation element with error
    if (currentTranslation) {
      (currentTranslation as any).result = { 
        success: false, 
        errorCode: 'TRANSLATION_ERROR',
        reason: message.error 
      };
      (currentTranslation as any).isUpdating = null;
      console.log('[Vocably Frame] Translation element updated with error');
    }
    
  } else if (message.type === 'CARD_RESULT') {
    // Received card operation result from content script
    console.log('[Vocably Frame] Card result received:', message.result);
    
    // Check if this is a response to a pending request
    if (message.requestId && pendingRequests.has(message.requestId)) {
      const { resolve } = pendingRequests.get(message.requestId)!;
      pendingRequests.delete(message.requestId);
      resolve(message.result);
      return;
    }
    
    // Update the translation element with the new result
    if (currentTranslation) {
      (currentTranslation as any).result = message.result;
      (currentTranslation as any).isUpdating = null;
      console.log('[Vocably Frame] Translation element updated with card result');
    }
    
  } else if (message.type === 'EXPLANATION_RESULT') {
    // Received AI explanation from content script
    console.log('[Vocably Frame] Explanation received:', message.explanation.state);
    
    if (currentTranslation) {
      (currentTranslation as any).explanation = message.explanation;
      console.log('[Vocably Frame] Translation updated with explanation');
    }
  }
});

// Notify content script that frame is ready
window.parent.postMessage({
  type: 'FRAME_READY'
}, '*');

console.log('[Vocably Frame] Ready and listening for messages');

