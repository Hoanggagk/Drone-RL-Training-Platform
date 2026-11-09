import { Button, Popconfirm, Space, message } from 'antd';
import { useRevokeAccountSessions } from '../queries/accounts';

export function AccountActions({ accountId }: { accountId: string }) {
  const revoke = useRevokeAccountSessions(accountId);
  return (
    <Space>
      <Popconfirm
        title="Thu hồi mọi phiên?"
        description="Người dùng sẽ phải đăng nhập lại trên mọi thiết bị."
        okText="Thu hồi"
        cancelText="Hủy"
        onConfirm={async () => {
          try {
            await revoke.mutateAsync();
            message.success('Đã thu hồi các phiên đăng nhập.');
          } catch {
            message.error('Không thể thu hồi phiên.');
          }
        }}
      >
        <Button danger loading={revoke.isPending}>
          Thu hồi phiên
        </Button>
      </Popconfirm>
    </Space>
  );
}
