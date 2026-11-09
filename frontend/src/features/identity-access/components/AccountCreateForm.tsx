import { Alert, Button, Form, Input } from 'antd';
import { isApiProblem } from '../../../lib/api/request';
import type { AccountCreate } from '../queries/accounts';

export function AccountCreateForm({
  onSubmit,
  pending = false,
  error,
}: {
  onSubmit: (value: AccountCreate) => void | Promise<void>;
  pending?: boolean;
  error?: unknown;
}) {
  const [form] = Form.useForm<AccountCreate>();
  const fieldErrors =
    isApiProblem(error) && 'errors' in error && Array.isArray(error.errors) ? error.errors : [];
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={async (value) => {
        await onSubmit(value);
        form.resetFields(['initial_password']);
      }}
      aria-label="Tạo account"
    >
      {Boolean(error) && (
        <Alert
          type="error"
          showIcon
          title="Không thể tạo account"
          description={
            fieldErrors.length ? (
              <ul>
                {fieldErrors.map((item, index) => (
                  <li key={`${String(item.field)}-${String(item.code)}-${index}`}>
                    {String(item.message)}
                  </li>
                ))}
              </ul>
            ) : isApiProblem(error) ? (
              String(error.title ?? 'Vui lòng thử lại.')
            ) : (
              'Vui lòng thử lại.'
            )
          }
        />
      )}
      <Form.Item
        name="username"
        label="Tên đăng nhập"
        rules={[
          { required: true, message: 'Nhập tên đăng nhập' },
          {
            pattern: /^[a-z0-9][a-z0-9._-]{2,63}$/,
            message: 'Dùng 3–64 ký tự thường, số, dấu chấm, gạch dưới hoặc gạch ngang',
          },
        ]}
      >
        <Input autoComplete="username" maxLength={64} />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Nhập email' },
          { type: 'email', message: 'Email không hợp lệ' },
          { max: 254, message: 'Email tối đa 254 ký tự' },
        ]}
      >
        <Input type="email" autoComplete="email" maxLength={254} />
      </Form.Item>
      <Form.Item
        name="display_name"
        label="Tên hiển thị"
        rules={[
          { required: true, whitespace: true, message: 'Nhập tên hiển thị' },
          { min: 1, max: 120, message: 'Tên hiển thị tối đa 120 ký tự' },
        ]}
      >
        <Input maxLength={120} />
      </Form.Item>
      <Form.Item
        name="initial_password"
        label="Mật khẩu ban đầu"
        rules={[
          { required: true, message: 'Nhập mật khẩu ban đầu' },
          { min: 12, max: 128, message: 'Mật khẩu phải từ 12 đến 128 ký tự' },
        ]}
      >
        <Input.Password autoComplete="new-password" maxLength={128} />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={pending} disabled={pending}>
        Tạo account
      </Button>
    </Form>
  );
}
