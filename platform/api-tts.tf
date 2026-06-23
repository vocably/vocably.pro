// TTS endpoint that proxies directly to the Google Cloud Text-to-Speech
// REST API without going through a Lambda. The caller POSTs `{ "text": "..." }`
// (optionally `languageCode`, `voiceSuffix`, `audioEncoding`) and the request is
// mapped onto the Google `text:synthesize` request body. The voice name is
// always built as `$languageCode-Wavenet-$voiceSuffix` (default suffix `A`) so
// the caller can never select an arbitrary, potentially expensive voice model.
// The API key is taken
// from the `google_tts_api_key` variable and appended as a query string.

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
#set($languageCode = $input.path('$.languageCode'))
#if("$languageCode" == "")#set($languageCode = "en-US")#end
#set($voiceSuffix = $input.path('$.voiceSuffix'))
#if("$voiceSuffix" == "")#set($voiceSuffix = "A")#end
#set($audioEncoding = $input.path('$.audioEncoding'))
#if("$audioEncoding" == "")#set($audioEncoding = "MP3")#end
{
  "input": {
    "text": "$util.escapeJavaScript($input.path('$.text'))"
  },
  "voice": {
    "languageCode": "$languageCode",
    "name": "$${languageCode}-Wavenet-$${voiceSuffix}"
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
