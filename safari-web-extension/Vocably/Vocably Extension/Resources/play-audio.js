/*!
 * Hello to whoever is reading this! I think you are cool 🤜🤛
 *
 * I did not obfuscate the code to help you better understand it.
 * However, I don't know how to disable minification of web components (StencilJS).
 * Sorry, I didn't look too hard!
 * The code of the entire project is available at:
 * https://github.com/vocably/language-learning-tool
 *
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ../../node_modules/@vocably/hermes/dist/esm/index.js
let browserEnv;
if (typeof chrome !== 'undefined') {
    browserEnv = chrome;
    // @ts-ignore
}
else if (typeof browser !== 'undefined') {
    // @ts-ignore
    browserEnv = browser;
}
const makeSend = (identifier) => (data, extensionId) => {
    return new Promise((resolve, reject) => {
        if (!browserEnv) {
            reject('browserEnv environment is not defined');
            return;
        }
        if (!browserEnv.runtime) {
            reject('browserEnv.runtime is not defined defined');
            return;
        }
        const sendParams = [
            { identifier, data },
            (response) => {
                if (browserEnv.runtime.lastError) {
                    return reject(browserEnv.runtime.lastError);
                }
                resolve(response);
            },
        ];
        if (extensionId) {
            sendParams.unshift(extensionId);
        }
        browserEnv.runtime.sendMessage(...sendParams);
    });
};
const makeListener = (identifier, callback) => (request, sender, nativeSendResponse) => {
    if (typeof request !== 'object' ||
        request === null ||
        request.identifier !== identifier) {
        return;
    }
    const data = request.data;
    const sendResponse = (r) => {
        nativeSendResponse(r);
        return r;
    };
    callback(sendResponse, data);
    return true;
};
const createMessage = (identifier) => {
    const subscribe = (callback) => {
        browserEnv.runtime.onMessage.addListener(makeListener(identifier, callback));
    };
    return [makeSend(identifier), subscribe];
};
const createExternalMessage = (identifier) => {
    const send = makeSend(identifier);
    const subscribe = (callback) => {
        browserEnv.runtime.onMessageExternal.addListener(makeListener(identifier, callback));
    };
    return [
        (extensionId, data) => send(data, extensionId),
        subscribe,
    ];
};

;// ../extension-messages/dist/esm/index.js

const createScope = (scope) => (identifier) => createMessage(`${scope}.${identifier}`);
const createScopedMessage = createScope('vocably');
const [isLoggedIn, onIsLoggedInRequest] = createScopedMessage('isLoggedIn');
const [getSettings, onGetSettingsRequest] = createScopedMessage('getSettings');
const [setSettings, onSetSettingsRequest] = createScopedMessage('setSettings');
const [isActive, onIsActiveRequest] = createScopedMessage('isActive');
const [isEligibleForTrial, onIsEligibleForTrialRequest] = createScopedMessage('isEligibleForTrial');
const [getCardsLimit, onGetCardsLimitRequest] = createScopedMessage('getCardsLimit');
const [getUserEmail, onGetUserEmail] = createScopedMessage('getUserEmail');
const [analyze, onAnalyzeRequest] = createScopedMessage('analyze');
const [explain, onExplainRequest] = createScopedMessage('explain');
const [removeCard, onRemoveCardRequest] = createScopedMessage('removeCard');
const [addCard, onAddCardRequest] = createScopedMessage('addCard');
const [listLanguages, onListLanguagesRequest] = createScopedMessage('listLanguages');
const [listTargetLanguages, onListTargetLanguagesRequest] = createScopedMessage('listTargetLanguages');
const [getLocationLanguage, onGetLocationLanguageRequest] = createScopedMessage('getLocationLanguage');
const [saveLocationLanguage, onSaveLocationLanguageRequest] = createScopedMessage('saveLocationLanguage');
const [getLanguagePairs, onGetLanguagePairs] = createScopedMessage('getLanguagePairs');
const [ping, onPing] = createScopedMessage('ping');
const [getInternalProxyLanguage, onGetInternalProxyLanuage] = createScopedMessage('getInternalProxyLanguage');
const [setInternalProxyLanguage, onSetInternalProxyLanguage] = createScopedMessage('setInternalProxyLanguage');
const [getInternalSourceLanguage, onGetInternalSourceLanguage] = createScopedMessage('getInternalSourceLanguage');
const [setInternalSourceLanguage, onSetInternalSourceLanguage] = createScopedMessage('setInternalSourceLanguage');
const [isUserKnowsHowToAdd, onIsUserKnowsHowToAdd] = createScopedMessage('isUserKnowsHowToAdd');
const [setUserKnowsHowToAdd, onSetUserKnowsHowToAdd] = createScopedMessage('setUserKnowsHowToAdd');
const [pingExternal, onPingExternal] = createExternalMessage('vocably.ping-external');
const [setProxyLanguage, onSetProxyLanguage] = createExternalMessage('vocably.setProxyLanguage');
const [getProxyLanguage, onGetProxyLanguage] = createExternalMessage('vocably.getProxyLanguage');
const [setSourceLanguage, onSetSourceLanguage] = createExternalMessage('vocably.setSourceLanguage');
const [getSourceLanguage, onGetSourceLanguage] = createExternalMessage('vocably.getSourceLanguage');
const [getAudioPronunciation, onGetAudioPronunciation] = createScopedMessage('getAudioPronunciation');
const [askForRating, onAskForRating] = createScopedMessage('askForRating');
const [saveAskForRatingResponse, onSaveAskForRatingResponse] = createScopedMessage('askForRatingResponse');
const [playAudioPronunciation, onPlayAudioPronunciation] = createScopedMessage('playAudioPronunciation');
const [playAudioPronunciationOffscreen, onPlayAudioPronunciationOffscreen,] = createScopedMessage('playAudioPronunciationOffscreen');
const [canPlayOffScreen, onCanPlayOffScreen] = createScopedMessage('canPlayOffScreen');
const [updateCard, onUpdateCard] = createScopedMessage('updateCard');
const [attachTag, onAttachTag] = createScopedMessage('attachTag');
const [detachTag, onDetachTag] = createScopedMessage('detachTag');
const [updateTag, onUpdateTag] = createScopedMessage('updateTag');
const [deleteTag, onDeleteTag] = createScopedMessage('deleteTag');
const [analyzeUnitsOfSpeech, onAnalyzeUnitsOfSpeech] = createScopedMessage('analyzeUnitsOfSpeech');

;// ./src/play-audio.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const playDataUrl = (dataUrl) => __awaiter(void 0, void 0, void 0, function* () {
    return yield new Promise((resolve) => {
        try {
            const audio = new Audio(dataUrl);
            audio.addEventListener('ended', () => {
                resolve({
                    success: true,
                    value: true,
                });
            });
            audio.play().catch((e) => {
                resolve({
                    success: false,
                    errorCode: 'UNABLE_TO_PLAY_AUDIO_DATA_URL',
                    reason: 'An error occurred while playing the offscreen audio',
                    extra: e,
                });
            });
        }
        catch (e) {
            resolve({
                success: false,
                errorCode: 'UNABLE_TO_PLAY_AUDIO_DATA_URL',
                reason: 'An error occurred while playing the offscreen audio',
                extra: e,
            });
        }
    });
});
onPlayAudioPronunciationOffscreen((sendResponse, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield getAudioPronunciation(payload);
    if (result.success === false) {
        return sendResponse(result);
    }
    return sendResponse(yield playDataUrl(result.value.url));
}));

/******/ })()
;
//# sourceMappingURL=play-audio.js.map