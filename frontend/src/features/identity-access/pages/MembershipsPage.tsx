import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { components } from '../../../generated/api-schema';
import { isApiProblem } from '../../../lib/api/request';
import {
  useCreateProjectMembership,
  useProjectMemberships,
  useRevokeProjectMembership,
  type MembershipFilters,
} from '../queries/memberships';
type Membership = components['schemas']['ProjectMembership'];
type Create = components['schemas']['MembershipCreate'];
const uuidRule = { pattern: /^[0-9a-f]{8}-[0-9a-f-]{27}$/i, message: 'Giá trị phải là UUID' };
export function MembershipsPage() {
  const [draft, setDraft] = useState<MembershipFilters>({});
  const [filters, setFilters] = useState<MembershipFilters>({ pageSize: 25 });
  const list = useProjectMemberships(filters);
  const create = useCreateProjectMembership();
  const revoke = useRevokeProjectMembership();
  const [form] = Form.useForm<Create>();
  const error = create.error ?? revoke.error ?? list.error;
  const submit = async (values: Create) => {
    await create.mutateAsync(values);
    form.resetFields();
  };
  const confirm = (item: Membership) =>
    Modal.confirm({
      title: 'Thu hồi membership?',
      content: 'Bản ghi vẫn được giữ trong lịch sử.',
      okText: 'Thu hồi',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => revoke.mutateAsync(item.id),
    });
  return (
    <section aria-labelledby="memberships-title">
      <Typography.Title id="memberships-title" level={2}>
        Project Membership
      </Typography.Title>
      <Alert
        type="info"
        showIcon
        title="Project ID là mã phạm vi opaque"
        description="MOD-01 chỉ gán quyền theo mã này; giao diện không đọc hoặc quản lý dữ liệu project."
      />
      {error && (
        <Alert
          role="alert"
          type="error"
          showIcon
          title={
            isApiProblem(error) && error.status === 409
              ? 'Membership đã tồn tại'
              : 'Không thể xử lý membership'
          }
          description={
            isApiProblem(error)
              ? `${error.title}${error.correlation_id ? ` · Mã đối chiếu: ${error.correlation_id}` : ''}`
              : undefined
          }
        />
      )}
      <Card title="Lọc membership">
        <Space wrap>
          <Input
            aria-label="Lọc theo Project ID"
            value={draft.projectId}
            onChange={(e) => setDraft((v) => ({ ...v, projectId: e.target.value || undefined }))}
          />
          <Input
            aria-label="Lọc theo Account ID"
            value={draft.accountId}
            onChange={(e) => setDraft((v) => ({ ...v, accountId: e.target.value || undefined }))}
          />
          <Select
            aria-label="Lọc trạng thái membership"
            allowClear
            value={draft.status}
            options={['active', 'revoked'].map((value) => ({ value, label: value }))}
            onChange={(status) => setDraft((v) => ({ ...v, status }))}
          />
          <Button onClick={() => setFilters({ ...draft, pageSize: 25 })}>Áp dụng bộ lọc</Button>
          <Button
            onClick={() => {
              setDraft({});
              setFilters({ pageSize: 25 });
            }}
          >
            Xóa bộ lọc
          </Button>
        </Space>
      </Card>
      <Card title="Gán membership">
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item
            name="project_id"
            label="Project ID"
            rules={[{ required: true, message: 'Nhập Project ID' }, uuidRule]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="account_id"
            label="Account ID"
            rules={[{ required: true, message: 'Nhập Account ID' }, uuidRule]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role_code"
            label="Role"
            rules={[{ required: true, message: 'Chọn role' }]}
          >
            <Select
              options={['researcher', 'lecturer', 'learner', 'algorithm_developer'].map(
                (value) => ({ value, label: value }),
              )}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={create.isPending}
            disabled={create.isPending}
          >
            Gán membership
          </Button>
        </Form>
      </Card>
      <Card title="Membership hiện tại và lịch sử">
        {list.isLoading ? (
          <div role="status">
            <Spin /> Đang tải membership…
          </div>
        ) : list.data?.items.length === 0 ? (
          <Empty
            description={
              Object.values(filters).some(Boolean)
                ? 'Không có membership khớp bộ lọc'
                : 'Chưa có membership'
            }
          />
        ) : (
          <Table
            rowKey="id"
            pagination={false}
            dataSource={list.data?.items ?? []}
            columns={[
              {
                title: 'Membership ID',
                dataIndex: 'id',
                render: (value: string) => <Link to={`/iam/memberships/${value}`}>{value}</Link>,
              },
              { title: 'Project ID', dataIndex: 'project_id' },
              { title: 'Account ID', dataIndex: 'account_id' },
              { title: 'Role', dataIndex: 'role_code' },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                render: (value: string) => (
                  <Tag color={value === 'active' ? 'green' : 'default'}>{value}</Tag>
                ),
              },
              {
                title: 'Thao tác',
                render: (_: unknown, item: Membership) => (
                  <Button
                    danger
                    disabled={item.status !== 'active' || revoke.isPending}
                    onClick={() => confirm(item)}
                  >
                    Thu hồi
                  </Button>
                ),
              },
            ]}
          />
        )}{' '}
        {list.data?.has_more && (
          <Button
            onClick={() =>
              setFilters((value) => ({ ...value, cursor: list.data?.next_cursor ?? undefined }))
            }
          >
            Trang tiếp
          </Button>
        )}
      </Card>
    </section>
  );
}
