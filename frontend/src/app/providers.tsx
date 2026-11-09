import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { queryClient } from './query-client';
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider locale={viVN} theme={{ token: { colorPrimary: '#1358a8', borderRadius: 6 } }}>
      <AntApp>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
}
