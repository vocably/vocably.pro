import { AuthEmailTranslation } from './en';

export const vi: AuthEmailTranslation = {
  verifyEmail: {
    subject: 'Xác nhận địa chỉ email của bạn',
    heading: 'Xác nhận địa chỉ email của bạn',
    intro:
      'Nhập mã này vào Vocably để hoàn tất việc tạo tài khoản. Mã có hiệu lực trong 24 giờ.',
    codeLabel: 'Mã xác nhận',
    footer: 'Nếu bạn không tạo tài khoản Vocably, bạn có thể bỏ qua email này.',
  },
  resetPassword: {
    subject: 'Đặt lại mật khẩu của bạn',
    heading: 'Đặt lại mật khẩu của bạn',
    intro:
      'Nhập mã này vào Vocably để chọn mật khẩu mới. Mã có hiệu lực trong 1 giờ.',
    codeLabel: 'Mã đặt lại',
    footer:
      'Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này. Mật khẩu của bạn vẫn giữ nguyên.',
  },
  verifyAttribute: {
    subject: 'Xác nhận địa chỉ email mới của bạn',
    heading: 'Xác nhận địa chỉ email mới của bạn',
    intro:
      'Nhập mã này vào Vocably để bắt đầu dùng địa chỉ này cho tài khoản của bạn.',
    codeLabel: 'Mã xác nhận',
    footer:
      'Nếu bạn không yêu cầu đổi địa chỉ email, vui lòng trả lời email này.',
  },
  invite: {
    subject: 'Tài khoản Vocably của bạn',
    heading: 'Tài khoản Vocably của bạn đã sẵn sàng',
    intro: 'Đăng nhập bằng tên đăng nhập và mật khẩu tạm thời bên dưới.',
    usernameLabel: 'Tên đăng nhập',
    passwordLabel: 'Mật khẩu tạm thời',
    outro: 'Khi đăng nhập lần đầu, bạn sẽ được yêu cầu chọn mật khẩu riêng.',
    footer:
      'Nếu bạn không mong đợi email này, vui lòng trả lời và cho tôi biết.',
  },
};
