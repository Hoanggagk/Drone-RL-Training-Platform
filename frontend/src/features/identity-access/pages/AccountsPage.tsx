import {
  Alert,
  Button,
  Empty,
  Flex,
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
import { AccountCreateForm } from '../components/AccountCreateForm';
import { useAccounts, useCreateAccount, type AccountStatus } from '../queries/accounts';

export function AccountsPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [status, setStatus] = useState<AccountStatus | undefined>();
  const [cursor, setCursor] = useState<string | undefined>();
  const [creating, setCreating] = useState(false);
  const accounts = useAccounts({ query: submitted, status, cursor, pageSize: 25 });
  const create = useCreateAccount();
  const emptyFiltered = Boolean(submitted || status);
  return (
    <section aria-labelledby="accounts-title">
      <Flex justify="space-between" align="center">
        <Typography.Title id="accounts-title" level={2}>
          Quản lý account
        </Typography.Title>
        <Button type="primary" onClick={() => setCreating(true)}>
          Tạo account
        </Button>
      </Flex>
      <Space wrap>
        <Input.Search
          aria-label="Tìm account"
          placeholder="Username, email hoặc tên"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSearch={() => {
            setSubmitted(query.trim());
            setCursor(undefined);
          }}
          allowClear
        />
        <Select
          aria-label="Lọc trạng thái"
          placeholder="Mọi trạng thái"
          allowClear
          value={status}
          onChange={(value) => {
            setStatus(value);
            setCursor(undefined);
          }}
          options={['active', 'locked', 'disabled'].map((value) => ({ value, label: value }))}
        />
        <Button onClick={() => accounts.refetch()}>Làm mới</Button>
      </Space>
      {accounts.isLoading ? (
        <div role="status">
          <Spin /> Đang tải account…
        </div>
      ) : accounts.isError ? (
        <Alert
          type="error"
          showIcon
          message="Không tải được danh sách account"
          action={<Button onClick={() => accounts.refetch()}>Thử lại</Button>}
        />
      ) : accounts.data?.items.length === 0 ? (
        <Empty description={emptyFiltered ? 'Không có account khớp bộ lọc' : 'Chưa có account'} />
      ) : (
        <Table
          rowKey="id"
          loading={accounts.isFetching}
          dataSource={accounts.data?.items ?? []}
          pagination={false}
          columns={[
            {
              title: 'Tên đăng nhập',
              dataIndex: 'username',
              render: (value: string, row) => <Link to={`/iam/accounts/${row.id}`}>{value}</Link>,
            },
            { title: 'Tên hiển thị', dataIndex: 'display_name' },
            { title: 'Email', dataIndex: 'email' },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              render: (value: string) => <Tag>{value}</Tag>,
            },
          ]}
        />
      )}
      {accounts.data?.has_more && (
        <Button onClick={() => setCursor(accounts.data?.next_cursor ?? undefined)}>
          Trang tiếp
        </Button>
      )}
      <Modal
        title="Tạo account"
        open={creating}
        footer={null}
        destroyOnHidden
        onCancel={() => {
          setCreating(false);
          create.reset();
        }}
      >
        <AccountCreateForm
          pending={create.isPending}
          error={create.error}
          onSubmit={async (value) => {
            await create.mutateAsync(value);
            setCreating(false);
          }}
        />
      </Modal>
    </section>
  );
}
