import { parseJson } from '@vocably/api';
import { nodeFetchS3File } from '@vocably/lambda-shared';
import { Result } from '@vocably/model';
import { get } from 'lodash-es';
import { getEmailBySub } from '../../utils/getEmailBySub';

/**
 * Sandbox events are only applied to users listed in
 * s3://STATIC_USER_FILES_BUCKET/allowed-sandbox-emails.json.
 */
export const checkSandboxSub = async (sub: string): Promise<Result<true>> => {
  const emailResult = await getEmailBySub(sub);

  if (emailResult.success === false) {
    return {
      success: false,
      reason: `Unable to get email for sub "${sub}".`,
    };
  }

  const allowedSandboxEmailsResult = await nodeFetchS3File(
    process.env.STATIC_USER_FILES_BUCKET,
    'allowed-sandbox-emails.json'
  );
  if (allowedSandboxEmailsResult.success === false) {
    return {
      success: false,
      reason: 'Unable to download allowed-sandbox-emails.json',
    };
  }

  const parseResult = parseJson(allowedSandboxEmailsResult.value);

  if (parseResult.success === false) {
    return {
      success: false,
      reason: 'Unable to parse allowed-sandbox-emails.json',
    };
  }

  if (
    !get(parseResult.value, 'allowedEmails', []).includes(emailResult.value)
  ) {
    return {
      success: false,
      reason: `Unable to perform the operation for not allowed user ${emailResult.value}. The user should be mentioned in s3://${process.env.STATIC_USER_FILES_BUCKET}/allowed-sandbox-emails.json.`,
    };
  }

  return { success: true, value: true };
};
