import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import { AudioPronunciationResponse, Result } from '@vocably/model';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lastValueFrom, mergeMap, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { sanitizeAudioPronunciationPayload } from '@vocably/lambda-shared';
import { languageToGoogleTranslateLanguage } from '@vocably/model-operations';
import { buildErrorResponse } from '../../utils/buildErrorResponse';
import { buildResponse } from '../../utils/buildResponse';
import { extractPayload } from './extractPayload';
import ISynthesizeSpeechRequest = google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;
import AudioEncoding = google.cloud.texttospeech.v1.AudioEncoding;
import SsmlVoiceGender = google.cloud.texttospeech.v1.SsmlVoiceGender;

const client = new TextToSpeechClient();

export const playSound = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> =>
  lastValueFrom(
    of(event).pipe(
      map(extractPayload),
      map(sanitizeAudioPronunciationPayload),
      mergeMap(async (payload): Promise<Result<Buffer>> => {
        const request: ISynthesizeSpeechRequest = {
          input: { text: payload.text },
          voice: {
            languageCode: languageToGoogleTranslateLanguage(payload.language),
            ssmlGender: SsmlVoiceGender.FEMALE,
          },
          audioConfig: { audioEncoding: AudioEncoding.MP3 },
        };
        const [response] = await client.synthesizeSpeech(request);

        if (!response.audioContent) {
          return {
            success: false,
            errorCode: 'GOOGLE_TEXT_TO_SPEECH_ERROR',
            reason:
              'No audio content found in response from Google Text to Speech API.',
          };
        }

        return { success: true, value: response.audioContent as Buffer };
      }),
      map((result) => {
        if (result.success === true) {
          const responseBody: AudioPronunciationResponse = {
            url: 'data:audio/mpeg;base64,' + result.value.toString('base64'),
          };
          return buildResponse({
            body: JSON.stringify(responseBody),
          });
        }

        throw result;
      }),
      catchError(buildErrorResponse)
    )
  );

exports.playSound = playSound;
