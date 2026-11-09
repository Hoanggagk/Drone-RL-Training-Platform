import { Alert, Button, Card, Form, Input, Modal, Space, Spin, Table, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { components } from '../../../generated/api-schema';
import { isApiProblem } from '../../../lib/api/request';
import {
  useCreateGlobalRoleBinding,
  useGlobalRoleBindings,
  useRevokeGlobalRoleBinding,
  useRoleDefinitions,
} from '../queries/roles';

type Binding = components['schemas']['GlobalRoleBinding'];
export function RolesPage() {
  const roles = useRoleDefinitions();
  const bindings = useGlobalRoleBindings();
  const create = useCreateGlobalRoleBinding();
  const revoke = useRevokeGlobalRoleBinding();
  const navigate = useNavigate();
  const [form] = Form.useForm<{ account_id: string }>();
  const error = create.error ?? revoke.error ?? roles.error ?? bindings.error;
  const recent = isApiProblem(error) && error.code === 'RECENT_AUTH_REQUIRED';
  const lastAdmin = isApiProblem(error) && error.code === 'LAST_ADMIN';
  const submit = async (values: { account_id: string }) => {
    await create.mutateAsync({ account_id: values.account_id, role_code: 'platform_admin' });
    form.resetFields();
  };
  const confirmRevoke = (item: Binding) =>
    Modal.confirm({
      title: 'Thu hồi quyền quản trị?',
      content: 'Binding được giữ lại trong lịch sử với trạng thái revoked.',
      okText: 'Thu hồi',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => revoke.mutateAsync(item.id),
    });
  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={1}>Role và quyền truy cập</Typography.Title>
      {error && (
        <Alert
          role="alert"
          type="error"
          showIcon
          title={
            recent
              ? 'Cần xác thực gần đây'
              : lastAdmin
                ? 'Không thể thu hồi quản trị viên cuối cùng'
                : 'Không thể xử lý quyền truy cập'
          }
          description={
            recent ? (
              <Button onClick={() => navigate('/iam/change-password')}>Xác thực lại</Button>
            ) : isApiProblem(error) ? (
              `${error.title}${error.correlation_id ? ` · Mã đối chiếu: ${error.correlation_id}` : ''}`
            ) : undefined
          }
        />
      )}
      <Card title="Danh mục role (chỉ đọc)">
        {roles.isLoading ? (
          <Spin />
        ) : (
          <Table
            rowKey="code"
            pagination={false}
            dataSource={roles.data ?? []}
            columns={[
              { title: 'Mã role', dataIndex: 'code' },
              { title: 'Tên', dataIndex: 'name' },
              { title: 'Phạm vi', dataIndex: 'scope_type', render: (v: string) => <Tag>{v}</Tag> },
              { title: 'Mô tả', dataIndex: 'description' },
            ]}
          />
        )}
      </Card>
      <Card title="Gán Platform Administrator">
        <Form form={form} layout="inline" onFinish={submit}>
          <Form.Item
            name="account_id"
            label="Account ID"
            rules={[
              { required: true, message: 'Nhập Account ID' },
              {
                type: 'string',
                pattern: /^[0-9a-f]{8}-[0-9a-f-]{27}$/i,
                message: 'Account ID phải là UUID',
              },
            ]}
          >
            <Input aria-label="Account ID" placeholder="UUID của account" />
          </Form.Item>
          <Button htmlType="submit" type="primary" loading={create.isPending}>
            Gán quyền
          </Button>
        </Form>
      </Card>
      <Card title="Global role bindings">
        {bindings.isLoading ? (
          <Spin />
        ) : (
          <Table
            rowKey="id"
            pagination={false}
            dataSource={bindings.data?.items ?? []}
            columns={[
              { title: 'Account ID', dataIndex: 'account_id' },
              { title: 'Role', dataIndex: 'role_code' },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v}</Tag>,
              },
              {
                title: 'Thao tác',
                render: (_: unknown, item: Binding) => (
                  <Button
                    danger
                    disabled={item.status !== 'active'}
                    onClick={() => confirmRevoke(item)}
                  >
                    Thu hồi
                  </Button>
                ),
              },
            ]}
          />
        )}
      </Card>
    </Space>
  );
}
