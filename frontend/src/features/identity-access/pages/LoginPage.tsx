import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLogin } from '../queries/auth';
import { safeReturnPath } from '../model/auth-state';
import { isApiProblem } from '../../../lib/api/request';
import { DemoScenarioPanel } from '../components/DemoScenarioPanel';

type Fields = { login: string; password: string };
export function LoginPage() {
  const login = useLogin();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form] = Form.useForm<Fields>();
  async function submit(values: Fields) {
    try {
      const result = await login.mutateAsync(values);
      form.setFieldValue('password', '');
      navigate(
        result.account.must_change_password
          ? '/change-password'
          : safeReturnPath(params.get('returnTo')),
        { replace: true },
      );
    } catch {
      form.setFieldValue('password', '');
    }
  }
  return (
    <main className="auth-page">
      <DemoScenarioPanel />
      <Card className="auth-card">
        <Typography.Title level={1}>Đăng nhập</Typography.Title>
        <Typography.Paragraph>
          Drone RL Training Platform — quản lý danh tính và truy cập
        </Typography.Paragraph>
        {login.isError && (
          <Alert
            role="alert"
            showIcon
            type="error"
            message={
              isApiProblem(login.error) && login.error.status === 429
                ? 'Quá nhiều lần thử. Vui lòng thử lại sau.'
                : 'Không thể đăng nhập. Kiểm tra thông tin và thử lại.'
            }
          />
        )}
        <Form form={form} layout="vertical" onFinish={submit} autoComplete="on">
          <Form.Item
            label="Tên đăng nhập hoặc email"
            name="login"
            rules={[
              { required: true, message: 'Nhập tên đăng nhập hoặc email' },
              { min: 3, max: 254 },
            ]}
          >
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Nhập mật khẩu' }]}
          >
            <Input.Password autoComplete="current-password" maxLength={1024} />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={login.isPending}
            disabled={login.isPending}
          >
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </main>
  );
}
