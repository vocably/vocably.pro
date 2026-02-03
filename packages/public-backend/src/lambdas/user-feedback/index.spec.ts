import { inspect } from '@vocably/node-sulna';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { userFeedback } from './index';

// @ts-ignore
let mockEvent: APIGatewayProxyEvent = {
  // @ts-ignore
  requestContext: {
    authorizer: {
      claims: {
        'cognito:username': 'test-user',
      },
    },
  },
};

process.env.FEEDBACK_NOTIFICATION_PREFIX = '[TEST] ';

describe('integration check for userFeedback lambda', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('execute translate lambda', async () => {
    mockEvent.body = JSON.stringify({
      feedback: `multi
line
feedback`,
    });
    const result = await userFeedback(mockEvent);
    console.log(inspect({ result }));
    expect(result.statusCode).toEqual(200);
  });
});
