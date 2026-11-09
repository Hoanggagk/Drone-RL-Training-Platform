import { Button, Layout, Menu, Space, Typography } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DemoScenarioPanel } from './DemoScenarioPanel';
import { useCurrentIdentity, useLogout } from '../queries/auth';

export function IdentityAccessLayout() {
  const identity = useCurrentIdentity();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  async function signOut() {
    await logout.mutateAsync();
    navigate('/login', { replace: true });
  }
  return (
    <Layout className="app-shell">
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <Layout.Header className="app-header">
        <Typography.Title level={1}>Identity &amp; Access</Typography.Title>
        <Space>
          <span aria-label="Người dùng hiện tại">{identity.data?.display_name}</span>
          <Button onClick={signOut} loading={logout.isPending}>
            Đăng xuất
          </Button>
        </Space>
      </Layout.Header>
      <Layout>
        <Layout.Sider width={220} breakpoint="lg" collapsedWidth={0}>
          <nav aria-label="Điều hướng MOD-01">
            <Menu
              theme="dark"
              selectedKeys={[location.pathname]}
              items={[
                { key: '/iam/accounts', label: <Link to="/iam/accounts">Tài khoản</Link> },
                { key: '/iam/roles', label: <Link to="/iam/roles">Role toàn cục</Link> },
                {
                  key: '/iam/memberships',
                  label: <Link to="/iam/memberships">Membership dự án</Link>,
                },
                { key: '/change-password', label: <Link to="/change-password">Đổi mật khẩu</Link> },
              ]}
            />
          </nav>
        </Layout.Sider>
        <Layout.Content id="main-content" className="page-content">
          <DemoScenarioPanel />
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
