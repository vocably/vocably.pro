import { AuthEmailTranslation } from './en';

export const zh: AuthEmailTranslation = {
  verifyEmail: {
    subject: '验证你的电子邮件地址',
    heading: '验证你的电子邮件地址',
    intro:
      '请在 Vocably 中输入此验证码以完成账号注册。验证码将在 24 小时后失效。',
    codeLabel: '验证码',
    footer: '如果你没有尝试注册 Vocably 账号，可以放心忽略这封邮件。',
  },
  resetPassword: {
    subject: '重置你的密码',
    heading: '重置你的密码',
    intro: '请在 Vocably 中输入此验证码以设置新密码。验证码将在 1 小时后失效。',
    codeLabel: '重置验证码',
    footer: '如果你没有申请重置密码，可以放心忽略这封邮件，你的密码不会改变。',
  },
  verifyAttribute: {
    subject: '验证你的新电子邮件地址',
    heading: '验证你的新电子邮件地址',
    intro: '请在 Vocably 中输入此验证码，即可开始在你的账号中使用这个地址。',
    codeLabel: '验证码',
    footer: '如果你没有申请更改电子邮件地址，请回复这封邮件。',
  },
  invite: {
    subject: '你的 Vocably 账号',
    heading: '你的 Vocably 账号已准备就绪',
    intro: '请使用下方的用户名和临时密码登录。',
    usernameLabel: '用户名',
    passwordLabel: '临时密码',
    outro: '首次登录时，系统会要求你设置自己的密码。',
    footer: '如果你没有预料到会收到这封邮件，请回复告诉我。',
  },
};
