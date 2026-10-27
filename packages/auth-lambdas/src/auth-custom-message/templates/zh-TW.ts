import { AuthEmailTranslation } from './en';

export const zhTW: AuthEmailTranslation = {
  verifyEmail: {
    subject: '確認你的電子郵件地址',
    heading: '確認你的電子郵件地址',
    intro:
      '請在 Vocably 中輸入此驗證碼以完成帳號建立。驗證碼將在 24 小時後失效。',
    codeLabel: '驗證碼',
    footer: '如果你沒有嘗試建立 Vocably 帳號，可以放心忽略這封電子郵件。',
  },
  resetPassword: {
    subject: '重設你的密碼',
    heading: '重設你的密碼',
    intro: '請在 Vocably 中輸入此驗證碼以設定新密碼。驗證碼將在 1 小時後失效。',
    codeLabel: '重設驗證碼',
    footer:
      '如果你沒有要求重設密碼，可以放心忽略這封電子郵件，你的密碼將維持不變。',
  },
  verifyAttribute: {
    subject: '確認你的新電子郵件地址',
    heading: '確認你的新電子郵件地址',
    intro: '請在 Vocably 中輸入此驗證碼，即可開始在你的帳號中使用這個地址。',
    codeLabel: '驗證碼',
    footer: '如果你沒有要求變更電子郵件地址，請回覆這封電子郵件。',
  },
  invite: {
    subject: '你的 Vocably 帳號',
    heading: '你的 Vocably 帳號已準備就緒',
    intro: '請使用下方的使用者名稱和臨時密碼登入。',
    usernameLabel: '使用者名稱',
    passwordLabel: '臨時密碼',
    outro: '首次登入時，系統會要求你設定自己的密碼。',
    footer: '如果你沒有預期收到這封電子郵件，請回覆讓我知道。',
  },
};
