import type { ContentScriptToFrameMessage, FrameToContentScriptMessage, ContentScriptToFrameResponse } from './message-types';
import { api } from './api';

// Use browser API directly to avoid package dependency issues
declare const browser: any;
const browserEnv = typeof browser !== 'undefined' ? browser : (chrome || {});

/**
 * Manages the popup frame lifecycle and communication
 */
class IframeManager {
  private iframe: HTMLIFrameElement | null = null;
  private frameReady = false;
  private messageQueue: ContentScriptToFrameMessage[] = [];
  private clickOutsideHandler: ((e: MouseEvent) => void) | null = null;

  constructor() {
    // Listen for messages from iframe
    window.addEventListener('message', this.handleFrameMessage.bind(this));
  }

  /**
   * Create and inject iframe into page
   */
  async createFrame(): Promise<void> {
    if (this.iframe) {
      console.log('[IframeManager] Frame already exists');
      return;
    }

    console.log('[IframeManager] Creating iframe...');

    // Get extension URL for popup-frame.html
    const frameUrl = browserEnv.runtime.getURL('popup-frame.html');

    // Create iframe
    this.iframe = document.createElement('iframe');
    this.iframe.id = 'vocably-popup-frame';
    this.iframe.src = frameUrl;
    
    // Style iframe - use absolute positioning so it scrolls with page
    this.iframe.style.position = 'absolute';  // Changed from 'fixed'
    this.iframe.style.border = 'none';
    this.iframe.style.zIndex = '2147483647'; // Maximum z-index
    this.iframe.style.background = 'transparent';
    this.iframe.style.pointerEvents = 'auto';
    
    // Initially hidden and positioned off-screen
    this.iframe.style.display = 'none';
    this.iframe.style.top = '0';
    this.iframe.style.left = '0';
    this.iframe.style.width = '0';
    this.iframe.style.height = '0';

    // Append to body
    document.body.appendChild(this.iframe);

    console.log('[IframeManager] Frame created and injected');
  }

  /**
   * Send message to iframe
   */
  sendToFrame(message: ContentScriptToFrameMessage): void {
    if (!this.iframe?.contentWindow) {
      console.warn('[IframeManager] Cannot send message, iframe not ready');
      return;
    }

    if (!this.frameReady) {
      console.log('[IframeManager] Frame not ready, queueing message');
      this.messageQueue.push(message);
      return;
    }

    console.log('[IframeManager] Sending message to frame:', message.type);
    this.iframe.contentWindow.postMessage(message, '*');
  }

  /**
   * Show translation at specified position
   */
  showTranslation(params: {
    text: string;
    detectedLanguage?: string;
    context?: string;
    position: { top?: number; bottom?: number; left: number };
    isTouchscreen: boolean;
  }): void {
    if (!this.iframe) {
      console.error('[IframeManager] Cannot show translation, frame not created');
      return;
    }

    // Make iframe visible
    this.iframe.style.display = 'block';
    
    // For button display, use smaller size
    // Button is typically small (~40-50px), popup will resize when shown
    const buttonWidth = params.isTouchscreen ? 60 : 50;
    const buttonHeight = params.isTouchscreen ? 60 : 50;
    
    this.iframe.style.width = `${buttonWidth}px`;
    this.iframe.style.height = `${buttonHeight}px`;
    
    // Position directly at selection point
    // Don't adjust too much - button should be right at cursor/selection
    let left = params.position.left;
    let top: number;
    
    // Simple boundary check
    if (left + buttonWidth > window.innerWidth) {
      left = window.innerWidth - buttonWidth - 10;
    }
    left = Math.max(10, left);
    
    // Position vertically based on message
    if (params.position.top !== undefined) {
      top = params.position.top;
    } else if (params.position.bottom !== undefined) {
      top = params.position.bottom - buttonHeight;
    } else {
      top = window.scrollY + window.innerHeight / 2;
    }
    
    // Ensure top is within reasonable bounds
    top = Math.max(window.scrollY + 10, Math.min(top, window.scrollY + window.innerHeight - buttonHeight - 10));
    
    this.iframe.style.left = `${left}px`;
    this.iframe.style.top = `${top}px`;

    // Send message to frame
    this.sendToFrame({
      type: 'SHOW_TRANSLATION',
      ...params,
    });

    // Setup click outside handler to close when clicking on page
    this.setupClickOutsideHandler();

    console.log('[IframeManager] Translation shown at', { left, top }, 'size:', { buttonWidth, buttonHeight });
  }

  /**
   * Setup handler to detect clicks outside iframe and hide it
   */
  private setupClickOutsideHandler(): void {
    // Remove existing handler if any
    this.removeClickOutsideHandler();
    
    this.clickOutsideHandler = (e: MouseEvent) => {
      // If click is on the iframe itself, ignore
      if (e.target === this.iframe) {
        return;
      }
      
      // Hide the frame when clicking outside
      console.log('[IframeManager] Click outside detected, hiding frame');
      this.hide();
      this.removeClickOutsideHandler();
    };
    
    // Use mousedown for faster response, with capture to get it before other handlers
    // Add with a small delay to avoid catching the selection click
    setTimeout(() => {
      if (this.clickOutsideHandler) {
        document.addEventListener('mousedown', this.clickOutsideHandler, true);
      }
    }, 100);
  }

  /**
   * Remove click outside handler
   */
  private removeClickOutsideHandler(): void {
    if (this.clickOutsideHandler) {
      document.removeEventListener('mousedown', this.clickOutsideHandler, true);
      this.clickOutsideHandler = null;
    }
  }

  /**
   * Hide frame
   */
  hide(): void {
    if (this.iframe) {
      this.iframe.style.display = 'none';
      this.sendToFrame({ type: 'HIDE' });
      console.log('[IframeManager] Frame hidden');
    }
  }

  /**
   * Destroy frame completely
   */
  destroy(): void {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
      this.frameReady = false;
      this.messageQueue = [];
      console.log('[IframeManager] Frame destroyed');
    }
  }

  /**
   * Handle messages from iframe
   */
  private handleFrameMessage(event: MessageEvent): void {
    // Security: verify message is from our iframe
    if (!this.iframe || event.source !== this.iframe.contentWindow) {
      return;
    }

    const message = event.data as FrameToContentScriptMessage;
    console.log('[IframeManager] Received message from frame:', message.type);

    switch (message.type) {
      case 'FRAME_READY':
        this.frameReady = true;
        console.log('[IframeManager] Frame is ready');
        
        // Send queued messages
        while (this.messageQueue.length > 0) {
          const queuedMessage = this.messageQueue.shift();
          if (queuedMessage) {
            this.sendToFrame(queuedMessage);
          }
        }
        break;

      case 'CLOSE_FRAME':
        // Hide the entire iframe when user closes popup
        this.hide();
        console.log('[IframeManager] Frame closed by user action');
        break;

      case 'RESIZE_FRAME':
        // Resize iframe for popup display
        if (this.iframe) {
          this.iframe.style.width = `${message.width}px`;
          this.iframe.style.height = `${message.height}px`;
          console.log('[IframeManager] Frame resized to:', message.width, 'x', message.height);
        }
        break;

      case 'SAVE_CARD':
        // TODO: Handle save card
        console.log('[IframeManager] Save card:', message.card);
        break;

      case 'TRANSLATE':
        // Handle translation request from iframe
        this.handleTranslateRequest(message);
        break;

      case 'CHANGE_LANGUAGE':
        // Handle language change request from iframe
        this.handleLanguageChange(message);
        break;

      case 'ADD_CARD':
        // Handle add card request from iframe
        this.handleAddCard(message.payload);
        break;

      case 'REMOVE_CARD':
        // Handle remove card request from iframe
        this.handleRemoveCard(message.payload);
        break;

      case 'ATTACH_TAG':
        this.handleTagOperation('attachTag', message.payload, message.requestId);
        break;

      case 'DETACH_TAG':
        this.handleTagOperation('detachTag', message.payload, message.requestId);
        break;

      case 'DELETE_TAG':
        this.handleTagOperation('deleteTag', message.payload, message.requestId);
        break;

      case 'UPDATE_TAG':
        this.handleTagOperation('updateTag', message.payload, message.requestId);
        break;

      case 'UPDATE_CARD':
        this.handleTagOperation('updateCard', message.payload, message.requestId);
        break;
    }
  }

  /**
   * Handle generic tag/card operation that returns a Result<TranslationCards>
   */
  private async handleTagOperation(
    operation: 'attachTag' | 'detachTag' | 'deleteTag' | 'updateTag' | 'updateCard', 
    payload: any, 
    requestId: string
  ): Promise<void> {
    console.log(`[IframeManager] ${operation} requested:`, payload);
    
    try {
      // Call the corresponding API method
      // @ts-ignore - Dynamic access to api methods
      const result = await api[operation](payload);
      console.log(`[IframeManager] ${operation} success, result:`, result);
      
      // Send updated result back to iframe with requestId
      this.sendResponseToFrame({
        type: 'CARD_RESULT',
        result,
        requestId,
      });
    } catch (error) {
      console.error(`[IframeManager] ${operation} error:`, error);
      this.sendResponseToFrame({
        type: 'TRANSLATION_ERROR',
        error: error instanceof Error ? error.message : `${operation} failed`,
        requestId,
      });
    }
  }

  /**
   * Handle add card request from iframe
   */
  private async handleAddCard(payload: any): Promise<void> {
    console.log('[IframeManager] Add card requested:', payload);
    
    try {
      const result = await api.addCard(payload);
      console.log('[IframeManager] Card added, result:', result);
      
      // Send updated result back to iframe
      this.sendResponseToFrame({
        type: 'CARD_RESULT',
        result,
      });
      
      // Also mark user knows how to add
      await api.setUserKnowsHowToAdd(true);
    } catch (error) {
      console.error('[IframeManager] Add card error:', error);
      this.sendResponseToFrame({
        type: 'TRANSLATION_ERROR',
        error: error instanceof Error ? error.message : 'Add card failed',
      });
    }
  }

  /**
   * Handle remove card request from iframe
   */
  private async handleRemoveCard(payload: any): Promise<void> {
    console.log('[IframeManager] Remove card requested:', payload);
    
    try {
      const result = await api.removeCard(payload);
      console.log('[IframeManager] Card removed, result:', result);
      
      // Send updated result back to iframe
      this.sendResponseToFrame({
        type: 'CARD_RESULT',
        result,
      });
      
      await api.setUserKnowsHowToAdd(true);
    } catch (error) {
      console.error('[IframeManager] Remove card error:', error);
      this.sendResponseToFrame({
        type: 'TRANSLATION_ERROR',
        error: error instanceof Error ? error.message : 'Remove card failed',
      });
    }
  }

  /**
   * Handle language change request from iframe
   */
  private async handleLanguageChange(message: { text: string; sourceLanguage?: string; targetLanguage?: string }): Promise<void> {
    console.log('[IframeManager] Language change requested:', message);
    
    try {
      // Save the language settings
      if (message.sourceLanguage) {
        await api.setInternalSourceLanguage(message.sourceLanguage as any);
        console.log('[IframeManager] Source language saved:', message.sourceLanguage);
      }
      if (message.targetLanguage) {
        await api.setInternalProxyLanguage(message.targetLanguage as any);
        console.log('[IframeManager] Target language saved:', message.targetLanguage);
      }
      
      // Re-translate with new language settings
      await this.handleTranslateRequest({
        text: message.text,
        detectedLanguage: message.sourceLanguage,
      });
    } catch (error) {
      console.error('[IframeManager] Language change error:', error);
      this.sendResponseToFrame({
        type: 'TRANSLATION_ERROR',
        error: error instanceof Error ? error.message : 'Language change failed',
      });
    }
  }

  /**
   * Handle translation request from iframe
   */
  private async handleTranslateRequest(message: { text: string; detectedLanguage?: string; context?: string }): Promise<void> {
    console.log('[IframeManager] Translation requested for:', message.text);
    
    try {
      // Get user's language settings
      const targetLanguage = await api.getInternalProxyLanguage();
      const sourceLanguage = message.detectedLanguage || await api.getInternalSourceLanguage();
      
      // Call the analyze API
      const result = await api.analyze({
        source: message.text,
        sourceLanguage: (sourceLanguage || undefined) as any,
        targetLanguage: (targetLanguage || undefined) as any,
        initiator: 'firefox-popup',
      });
      
      console.log('[IframeManager] Translation result:', result);
      
      // Send result back to iframe
      this.sendResponseToFrame({
        type: 'TRANSLATION_RESULT',
        result,
      });
      
      // If translation succeeded, fetch AI explanation
      if (result.success === true && result.value) {
        // Send loading state first
        this.sendResponseToFrame({
          type: 'EXPLANATION_RESULT',
          explanation: { state: 'loading' },
        });
        
        // Determine source for explanation
        const explainSource = result.value.cards.length === 1
          ? result.value.cards[0].data.source
          : result.value.source;
        
        // Fetch explanation
        api.explain({
          sourceLanguage: result.value.sourceLanguage,
          targetLanguage: result.value.targetLanguage,
          source: explainSource,
        }).then((explainResult) => {
          if (explainResult.success === true && explainResult.value.explanation) {
            this.sendResponseToFrame({
              type: 'EXPLANATION_RESULT',
              explanation: { 
                state: 'loaded', 
                value: explainResult.value.explanation 
              },
            });
          } else if (explainResult.success === true && !explainResult.value.explanation) {
            this.sendResponseToFrame({
              type: 'EXPLANATION_RESULT',
              explanation: { state: 'none' },
            });
          } else {
            this.sendResponseToFrame({
              type: 'EXPLANATION_RESULT',
              explanation: { 
                state: 'error', 
                error: 'Unable to load AI explanation.' 
              },
            });
          }
        }).catch((err) => {
          console.error('[IframeManager] Explain error:', err);
          this.sendResponseToFrame({
            type: 'EXPLANATION_RESULT',
            explanation: { state: 'error', error: 'Failed to load explanation' },
          });
        });
      }
    } catch (error) {
      console.error('[IframeManager] Translation error:', error);
      
      // Send error back to iframe
      this.sendResponseToFrame({
        type: 'TRANSLATION_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Send response message to iframe
   */
  private sendResponseToFrame(message: ContentScriptToFrameResponse): void {
    if (!this.iframe?.contentWindow) {
      console.warn('[IframeManager] Cannot send response, iframe not ready');
      return;
    }
    console.log('[IframeManager] Sending response to frame:', message.type);
    this.iframe.contentWindow.postMessage(message, '*');
  }
}

// Export singleton instance
export const iframeManager = new IframeManager();
