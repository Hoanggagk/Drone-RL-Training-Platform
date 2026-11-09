import { Alert, Descriptions, Spin, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { useProjectMembership } from '../queries/memberships';
export function MembershipDetailPage() {
  const { membershipId } = useParams();
  const membership = useProjectMembership(membershipId);
  if (membership.isLoading)
    return (
      <div role="status">
        <Spin /> Đang tải membership…
      </div>
    );
  if (membership.isError || !membership.data)
    return <Alert role="alert" type="error" title="Không tải được membership" showIcon />;
  const item = membership.data;
  return (
    <section aria-labelledby="membership-detail-title">
      <Typography.Title id="membership-detail-title" level={2}>
        Chi tiết Project Membership
      </Typography.Title>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Membership ID">{item.id}</Descriptions.Item>
        <Descriptions.Item label="Project ID (opaque)">{item.project_id}</Descriptions.Item>
        <Descriptions.Item label="Account ID">{item.account_id}</Descriptions.Item>
        <Descriptions.Item label="Role">{item.role_code}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">{item.status}</Descriptions.Item>
        <Descriptions.Item label="Version">{item.version}</Descriptions.Item>
      </Descriptions>
    </section>
  );
}
