// TTS endpoint that proxies directly to the Google Cloud Text-to-Speech
// REST API without going through a Lambda. The caller POSTs
// `{ "language": "...", "text": "..." }` (optionally `audioEncoding`) and the
// request is mapped onto the Google `text:synthesize` request body. The
// template owns the mapping from a Vocably `language` to a concrete Google
// `voice.languageCode` and `voice.name`; this map mirrors the `mapToWavenet`
// table in `packages/api/src/tts.ts` (with the `Wavenet` model and `A` voice
// suffix defaults already resolved into the voice name). Unknown languages fall
// back to `en-US-Wavenet-A`, so the caller can never select an arbitrary,
// potentially expensive voice model. The API key is taken from the
// `google_tts_api_key` variable and appended as a query string.

resource "aws_api_gateway_resource" "tts" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path_part   = "tts"
}

module "tts_cors" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.rest_api.id
  api_resource_id = aws_api_gateway_resource.tts.id
}

resource "aws_api_gateway_method" "tts" {
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.tts.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "tts_200" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.tts.resource_id
  http_method = aws_api_gateway_method.tts.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Content-Type"                = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration" "tts" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.tts.resource_id
  http_method = aws_api_gateway_method.tts.http_method

  type                    = "HTTP"
  integration_http_method = "POST"
  uri                     = "https://texttospeech.googleapis.com/v1/text:synthesize?key=${var.google_tts_api_key}"
  passthrough_behavior    = "NEVER"

  request_templates = {
    "application/json" = <<EOF
#set($voices = {
  "af": { "languageCode": "af-ZA", "name": "ar-XA-Standard-A" },
  "ar": { "languageCode": "ar-XA", "name": "ar-XA-Wavenet-A" },
  "eu": { "languageCode": "eu-ES", "name": "eu-ES-Standard-B" },
  "bn": { "languageCode": "bn-IN", "name": "bn-IN-Wavenet-A" },
  "bg": { "languageCode": "bg-BG", "name": "bg-BG-Standard-B" },
  "ca": { "languageCode": "ca-ES", "name": "ca-ES-Standard-B" },
  "cs": { "languageCode": "cs-CZ", "name": "cs-CZ-Wavenet-A" },
  "da": { "languageCode": "da-DK", "name": "da-DK-Wavenet-A" },
  "nl": { "languageCode": "nl-NL", "name": "nl-NL-Wavenet-A" },
  "no": { "languageCode": "nb-NO", "name": "nb-NO-Wavenet-F" },
  "en": { "languageCode": "en-US", "name": "en-US-Standard-H" },
  "en-GB": { "languageCode": "en-GB", "name": "en-GB-Standard-F" },
  "fi": { "languageCode": "fi-FI", "name": "fi-FI-Wavenet-A" },
  "fr": { "languageCode": "fr-FR", "name": "fr-FR-Standard-F" },
  "gl": { "languageCode": "gl-ES", "name": "gl-ES-Standard-B" },
  "de": { "languageCode": "de-DE", "name": "de-DE-Wavenet-A" },
  "el": { "languageCode": "el-GR", "name": "el-GR-Wavenet-A" },
  "gu": { "languageCode": "gu-IN", "name": "gu-IN-Wavenet-A" },
  "he": { "languageCode": "he-IL", "name": "he-IL-Wavenet-A" },
  "hi": { "languageCode": "hi-IN", "name": "hi-IN-Wavenet-A" },
  "hu": { "languageCode": "hu-HU", "name": "hu-HU-Wavenet-A" },
  "is": { "languageCode": "is-IS", "name": "is-IS-Wavenet-A" },
  "id": { "languageCode": "id-ID", "name": "id-ID-Wavenet-A" },
  "it": { "languageCode": "it-IT", "name": "it-IT-Wavenet-A" },
  "ja": { "languageCode": "ja-JP", "name": "ja-JP-Wavenet-A" },
  "kn": { "languageCode": "kn-IN", "name": "kn-IN-Wavenet-A" },
  "ko": { "languageCode": "ko-KR", "name": "ko-KR-Wavenet-A" },
  "lv": { "languageCode": "lv-LV", "name": "lv-LV-Standard-B" },
  "lt": { "languageCode": "lt-LT", "name": "lt-LT-Standard-B" },
  "ms": { "languageCode": "ms-MY", "name": "ms-MY-Wavenet-A" },
  "ml": { "languageCode": "ml-IN", "name": "ml-IN-Wavenet-A" },
  "mr": { "languageCode": "mr-IN", "name": "mr-IN-Wavenet-A" },
  "pl": { "languageCode": "pl-PL", "name": "pl-PL-Wavenet-A" },
  "pt": { "languageCode": "pt-BR", "name": "pt-BR-Wavenet-D" },
  "pt-PT": { "languageCode": "pt-PT", "name": "pt-PT-Wavenet-A" },
  "pa": { "languageCode": "pa-IN", "name": "pa-IN-Wavenet-A" },
  "ro": { "languageCode": "ro-RO", "name": "ro-RO-Wavenet-A" },
  "ru": { "languageCode": "ru-RU", "name": "ru-RU-Wavenet-A" },
  "sr": { "languageCode": "sr-RS", "name": "sr-RS-Standard-B" },
  "sk": { "languageCode": "sk-SK", "name": "sk-SK-Wavenet-A" },
  "es": { "languageCode": "es-ES", "name": "es-ES-Wavenet-C" },
  "sv": { "languageCode": "sv-SE", "name": "sv-SE-Wavenet-A" },
  "ta": { "languageCode": "ta-IN", "name": "ta-IN-Wavenet-A" },
  "te": { "languageCode": "te-IN", "name": "te-IN-Wavenet-A" },
  "th": { "languageCode": "th-TH", "name": "th-TH-Standard-A" },
  "tr": { "languageCode": "tr-TR", "name": "tr-TR-Wavenet-A" },
  "uk": { "languageCode": "uk-UA", "name": "uk-UA-Wavenet-B" },
  "vi": { "languageCode": "vi-VN", "name": "vi-VN-Wavenet-A" },
  "zh": { "languageCode": "cmn-CN", "name": "cmn-CN-Wavenet-A" },
  "zh-TW": { "languageCode": "cmn-TW", "name": "cmn-TW-Wavenet-A" }
})
#set($language = $input.path('$.language'))
#set($voice = $voices.get($language))
#if(!$voice)#set($voice = { "languageCode": "en-US", "name": "en-US-Wavenet-C" })#end
#set($audioEncoding = $input.path('$.audioEncoding'))
#if("$audioEncoding" == "")#set($audioEncoding = "MP3")#end
{
  "input": {
    "text": "$util.escapeJavaScript($input.path('$.text'))"
  },
  "voice": {
    "languageCode": "$voice.languageCode",
    "name": "$voice.name"
  },
  "audioConfig": {
    "audioEncoding": "$audioEncoding"
  }
}
EOF
  }
}

resource "aws_api_gateway_integration_response" "tts_200" {
  depends_on = [aws_api_gateway_integration.tts]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.tts.resource_id
  http_method = aws_api_gateway_method.tts.http_method
  status_code = aws_api_gateway_method_response.tts_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Content-Type"                = "integration.response.header.Content-Type"
  }
}
