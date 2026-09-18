import { AuthEmailTranslation } from './en';

export const es: AuthEmailTranslation = {
  verifyEmail: {
    subject: 'Confirma tu dirección de correo',
    heading: 'Confirma tu dirección de correo',
    intro:
      'Introduce este código en Vocably para terminar de crear tu cuenta. Caduca en 24 horas.',
    codeLabel: 'Código de confirmación',
    footer:
      'Si no intentaste crear una cuenta de Vocably, puedes ignorar este correo.',
  },
  resetPassword: {
    subject: 'Restablece tu contraseña',
    heading: 'Restablece tu contraseña',
    intro:
      'Introduce este código en Vocably para elegir una contraseña nueva. Caduca en 1 hora.',
    codeLabel: 'Código de restablecimiento',
    footer:
      'Si no pediste restablecer tu contraseña, puedes ignorar este correo. Tu contraseña no cambiará.',
  },
  verifyAttribute: {
    subject: 'Confirma tu nueva dirección de correo',
    heading: 'Confirma tu nueva dirección de correo',
    intro:
      'Introduce este código en Vocably para empezar a usar esta dirección en tu cuenta.',
    codeLabel: 'Código de confirmación',
    footer:
      'Si no pediste cambiar tu dirección de correo, responde a este mensaje.',
  },
  invite: {
    subject: 'Tu cuenta de Vocably',
    heading: 'Tu cuenta de Vocably está lista',
    intro:
      'Inicia sesión con el nombre de usuario y la contraseña temporal de abajo.',
    usernameLabel: 'Nombre de usuario',
    passwordLabel: 'Contraseña temporal',
    outro:
      'Al iniciar sesión por primera vez podrás elegir tu propia contraseña.',
    footer: 'Si no esperabas este correo, responde y avísame.',
  },
};
