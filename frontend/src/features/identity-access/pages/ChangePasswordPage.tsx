import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useChangePassword, useCurrentIdentity } from '../queries/auth';
import { isApiProblem } from '../../../lib/api/request';
type Fields = { current_password: string; new_password: string; confirm_password: string };
export function ChangePasswordPage() {
  const change = useChangePassword();
  const identity = useCurrentIdentity();
  const navigate = useNavigate();
  const [form] = Form.useForm<Fields>();
  async function submit(values: Fields) {
    try {
      await change.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      form.resetFields();
      navigate('/iam/accounts', { replace: true });
    } catch {
      form.resetFields(['current_password', 'new_password', 'confirm_password']);
    }
  }
  return (
    <section className="auth-page" aria-label="Đổi mật khẩu">
      <Card className="auth-card">
        <Typography.Title level={1}>Đổi mật khẩu</Typography.Title>
        {identity.data?.must_change_password && (
          <Alert showIcon type="warning" message="Bạn phải đổi mật khẩu trước khi tiếp tục." />
        )}
        {change.isError && (
          <Alert
            role="alert"
            showIcon
            type="error"
            message={
              isApiProblem(change.error) && change.error.category === 'validation'
                ? 'Mật khẩu chưa đáp ứng yêu cầu.'
                : 'Không thể đổi mật khẩu. Vui lòng thử lại.'
            }
          />
        )}
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item
            label="Mật khẩu hiện tại"
            name="current_password"
            rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}
          >
            <Input.Password autoComplete="current-password" maxLength={1024} />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="new_password"
            rules={[
              { required: true, message: 'Nhập mật khẩu mới' },
              { min: 12, max: 128, message: 'Mật khẩu phải từ 12 đến 128 ký tự' },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirm_password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, v) {
                  return !v || v === getFieldValue('new_password')
                    ? Promise.resolve()
                    : Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={change.isPending}
            disabled={change.isPending}
          >
            Lưu mật khẩu
          </Button>
        </Form>
      </Card>
    </section>
  );
}
