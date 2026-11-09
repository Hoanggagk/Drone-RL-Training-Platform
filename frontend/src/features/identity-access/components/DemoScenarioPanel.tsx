import { Alert, Select, Space, Typography } from 'antd';
import { useState } from 'react';
import { activateScenario, scenarioCatalog } from '../../../mocks/scenarios';
import type { Scenario } from '../../../mocks/store/identity-access-store';
import { queryClient } from '../../../app/query-client';
export function DemoScenarioPanel() {
  const [value, setValue] = useState<Scenario>('auth-standard');
  if (!import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE !== 'true') return null;
  return (
    <aside aria-label="Điều khiển demo" className="demo-panel">
      <Alert
        type="warning"
        showIcon
        message="Mock chỉ phục vụ demo — không phải cơ chế bảo mật thật"
      />
      <Space wrap>
        <Typography.Text strong>Kịch bản:</Typography.Text>
        <Select
          aria-label="Chọn kịch bản demo"
          value={value}
          options={scenarioCatalog.map((x) => ({ value: x.id, label: x.label }))}
          onChange={(next) => {
            setValue(next);
            activateScenario(next);
            void queryClient.invalidateQueries();
          }}
          style={{ minWidth: 240 }}
        />
      </Space>
    </aside>
  );
}
