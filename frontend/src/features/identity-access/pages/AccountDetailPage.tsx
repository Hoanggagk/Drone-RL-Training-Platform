import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  Select,
  Skeleton,
  Space,
  Typography,
  message,
} from 'antd';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isApiProblem } from '../../../lib/api/request';
import { AccountActions } from '../components/AccountActions';
import { useAccount, useUpdateAccount, type AccountPatch } from '../queries/accounts';

export function AccountDetailPage() {
  const { accountId } = useParams();
  const detail = useAccount(accountId);
  const update = useUpdateAccount(accountId ?? '');
  const [form] = Form.useForm<AccountPatch>();
  useEffect(() => {
    if (detail.data)
      form.setFieldsValue({
        display_name: detail.data.account.display_name,
        status: detail.data.account.status,
      });
  }, [detail.data, form]);
  if (detail.isLoading) return <Skeleton active />;
  if (detail.isError)
    return (
      <Alert
        type="error"
        message="Không tải được account"
        description={
          isApiProblem(detail.error) ? `${detail.error.title} (${detail.error.status})` : undefined
        }
        action={<Button onClick={() => detail.refetch()}>Thử lại</Button>}
      />
    );
  if (!detail.data) return null;
  const { account, etag } = detail.data;
  return (
    <section aria-labelledby="account-title">
      <Link to="/iam/accounts">← Danh sách account</Link>
      <Typography.Title id="account-title" level={2}>
        {account.display_name}
      </Typography.Title>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Username">{account.username}</Descriptions.Item>
        <Descriptions.Item label="Email">{account.email}</Descriptions.Item>
        <Descriptions.Item label="Phiên bản">{account.version}</Descriptions.Item>
      </Descriptions>
      {isApiProblem(update.error) && update.error.category === 'stale' && (
        <Alert
          type="warning"
          showIcon
          message="Account đã được người khác cập nhật"
          description="Dữ liệu mới đã được tải lại. Hãy kiểm tra và áp dụng lại thay đổi thủ công."
          action={
            <Button
              onClick={async () => {
                await detail.refetch();
                update.reset();
              }}
            >
              Tải bản mới
            </Button>
          }
        />
      )}
      {update.isError && !(isApiProblem(update.error) && update.error.category === 'stale') && (
        <Alert type="error" message="Không thể cập nhật account" />
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          try {
            await update.mutateAsync({ patch: values, etag });
            message.success('Đã cập nhật account.');
          } catch (error) {
            if (isApiProblem(error) && error.category === 'stale') await detail.refetch();
          }
        }}
      >
        <Form.Item
          name="display_name"
          label="Tên hiển thị"
          rules={[{ required: true, min: 1, max: 120 }]}
        >
          <Input maxLength={120} />
        </Form.Item>
        <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
          <Select
            options={['active', 'locked', 'disabled'].map((value) => ({ value, label: value }))}
          />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={update.isPending}>
            Lưu thay đổi
          </Button>
          <AccountActions accountId={account.id} />
        </Space>
      </Form>
    </section>
  );
}
