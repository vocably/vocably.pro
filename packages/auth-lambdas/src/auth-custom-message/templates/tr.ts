import { AuthEmailTranslation } from './en';

export const tr: AuthEmailTranslation = {
  verifyEmail: {
    subject: 'E-posta adresinizi doğrulayın',
    heading: 'E-posta adresinizi doğrulayın',
    intro:
      'Hesabınızı oluşturmayı tamamlamak için bu kodu Vocably’ye girin. Kodun geçerlilik süresi 24 saattir.',
    codeLabel: 'Doğrulama kodu',
    footer:
      'Vocably hesabı oluşturmaya çalışmadıysanız bu e-postayı yok sayabilirsiniz.',
  },
  resetPassword: {
    subject: 'Şifrenizi sıfırlayın',
    heading: 'Şifrenizi sıfırlayın',
    intro:
      'Yeni bir şifre belirlemek için bu kodu Vocably’ye girin. Kodun geçerlilik süresi 1 saattir.',
    codeLabel: 'Sıfırlama kodu',
    footer:
      'Şifre sıfırlama talebinde bulunmadıysanız bu e-postayı yok sayabilirsiniz. Şifreniz aynı kalır.',
  },
  verifyAttribute: {
    subject: 'Yeni e-posta adresinizi doğrulayın',
    heading: 'Yeni e-posta adresinizi doğrulayın',
    intro:
      'Bu adresi hesabınızda kullanmaya başlamak için bu kodu Vocably’ye girin.',
    codeLabel: 'Doğrulama kodu',
    footer:
      'E-posta adresinizi değiştirme talebinde bulunmadıysanız lütfen bu e-postayı yanıtlayın.',
  },
  invite: {
    subject: 'Vocably hesabınız',
    heading: 'Vocably hesabınız hazır',
    intro: 'Aşağıdaki kullanıcı adı ve geçici şifre ile oturum açın.',
    usernameLabel: 'Kullanıcı adı',
    passwordLabel: 'Geçici şifre',
    outro: 'İlk oturum açışınızda kendi şifrenizi belirlemeniz istenecek.',
    footer:
      'Bu e-postayı beklemiyorduysanız lütfen yanıtlayın ve bana bildirin.',
  },
};
