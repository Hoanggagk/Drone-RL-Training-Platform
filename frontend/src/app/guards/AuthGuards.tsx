import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { useCurrentIdentity } from '../../features/identity-access/queries/auth';
import { safeReturnPath } from '../../features/identity-access/model/auth-state';

export function AnonymousOnlyGuard() {
  const identity = useCurrentIdentity();
  if (identity.isLoading) return <Spin aria-label="Đang kiểm tra phiên" />;
  if (identity.data)
    return (
      <Navigate
        replace
        to={identity.data.must_change_password ? '/change-password' : '/iam/accounts'}
      />
    );
  return <Outlet />;
}

export function AuthenticatedGuard() {
  const location = useLocation();
  const identity = useCurrentIdentity();
  if (identity.isLoading) return <Spin aria-label="Đang kiểm tra phiên" />;
  if (!identity.data)
    return (
      <Navigate
        replace
        to={`/login?returnTo=${encodeURIComponent(safeReturnPath(location.pathname))}`}
      />
    );
  if (identity.data.must_change_password && location.pathname !== '/change-password')
    return <Navigate replace to="/change-password" />;
  return <Outlet />;
}

export function AdminGuard() {
  const identity = useCurrentIdentity();
  if (!identity.data?.global_roles.includes('platform_admin'))
    return (
      <Alert type="error" showIcon message="Bạn không có quyền quản trị danh tính và truy cập." />
    );
  return <Outlet />;
}

export const AnonymousOnly = AnonymousOnlyGuard;
export const RequireAuthenticated = AuthenticatedGuard;
export const RequireAdmin = AdminGuard;
