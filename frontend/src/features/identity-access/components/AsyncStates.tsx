import { Alert, Button, Empty, Skeleton, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { ApiProblem } from '../../../lib/api/problem';
import { messages } from '../model/messages';

export function LoadingState({ label = 'Đang tải dữ liệu' }: { label?: string }) {
  return (
    <div role="status" aria-label={label}>
      <Skeleton active />
    </div>
  );
}
export function EmptyState({ filtered = false }: { filtered?: boolean }) {
  return <Empty description={filtered ? 'Không có kết quả phù hợp bộ lọc' : 'Chưa có dữ liệu'} />;
}
export function ErrorState({ problem, onRetry }: { problem: ApiProblem; onRetry?: () => void }) {
  const [remaining, setRemaining] = useState(problem.retryAfter ?? 0);
  useEffect(() => {
    if (!problem.retryAfter) return;
    const timer = window.setInterval(() => setRemaining((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(timer);
  }, [problem.retryAfter]);
  const description =
    messages[problem.category as keyof typeof messages] ?? problem.detail ?? messages.generic;
  return (
    <Alert
      type="error"
      showIcon
      role="alert"
      title={problem.title ?? 'Đã xảy ra lỗi'}
      description={
        <Space orientation="vertical">
          <Typography.Text>{description}</Typography.Text>
          {problem.correlation_id && (
            <Typography.Text type="secondary">
              Mã đối chiếu: {problem.correlation_id}
            </Typography.Text>
          )}
          {onRetry && (
            <Button onClick={onRetry} disabled={remaining > 0}>
              Thử lại{remaining > 0 ? ` (${remaining}s)` : ''}
            </Button>
          )}
        </Space>
      }
    />
  );
}
