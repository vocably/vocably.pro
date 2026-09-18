import { AuthEmailTranslation } from './en';

export const pt: AuthEmailTranslation = {
  verifyEmail: {
    subject: 'Confirme seu endereço de e-mail',
    heading: 'Confirme seu endereço de e-mail',
    intro:
      'Digite este código no Vocably para terminar de criar sua conta. Ele expira em 24 horas.',
    codeLabel: 'Código de confirmação',
    footer:
      'Se você não tentou criar uma conta no Vocably, pode ignorar este e-mail.',
  },
  resetPassword: {
    subject: 'Redefina sua senha',
    heading: 'Redefina sua senha',
    intro:
      'Digite este código no Vocably para escolher uma nova senha. Ele expira em 1 hora.',
    codeLabel: 'Código de redefinição',
    footer:
      'Se você não pediu para redefinir sua senha, pode ignorar este e-mail. Sua senha continua a mesma.',
  },
  verifyAttribute: {
    subject: 'Confirme seu novo endereço de e-mail',
    heading: 'Confirme seu novo endereço de e-mail',
    intro:
      'Digite este código no Vocably para começar a usar este endereço na sua conta.',
    codeLabel: 'Código de confirmação',
    footer:
      'Se você não pediu para mudar seu endereço de e-mail, responda a esta mensagem.',
  },
  invite: {
    subject: 'Sua conta no Vocably',
    heading: 'Sua conta no Vocably está pronta',
    intro: 'Entre com o nome de usuário e a senha temporária abaixo.',
    usernameLabel: 'Nome de usuário',
    passwordLabel: 'Senha temporária',
    outro: 'No primeiro acesso você poderá escolher sua própria senha.',
    footer: 'Se você não esperava este e-mail, responda e me avise.',
  },
};
