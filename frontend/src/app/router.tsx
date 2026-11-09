import { Result } from 'antd';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AnonymousOnly, RequireAdmin, RequireAuthenticated } from './guards/AuthGuards';
import { IdentityAccessLayout } from '../features/identity-access/components/IdentityAccessLayout';
import { LoginPage } from '../features/identity-access/pages/LoginPage';
import { ChangePasswordPage } from '../features/identity-access/pages/ChangePasswordPage';
import { AccountsPage } from '../features/identity-access/pages/AccountsPage';
import { AccountDetailPage } from '../features/identity-access/pages/AccountDetailPage';
import { RolesPage } from '../features/identity-access/pages/RolesPage';
import { MembershipsPage } from '../features/identity-access/pages/MembershipsPage';
import { MembershipDetailPage } from '../features/identity-access/pages/MembershipDetailPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/iam" replace /> },
  { element: <AnonymousOnly />, children: [{ path: '/login', element: <LoginPage /> }] },
  {
    element: <RequireAuthenticated />,
    children: [
      {
        element: <IdentityAccessLayout />,
        children: [
          { path: '/change-password', element: <ChangePasswordPage /> },
          {
            path: '/forbidden',
            element: (
              <Result
                status="403"
                title="Không đủ quyền"
                subTitle="Backend vẫn là thẩm quyền authorization; guard chỉ hỗ trợ trải nghiệm."
              />
            ),
          },
          {
            element: <RequireAdmin />,
            children: [
              { path: '/iam', element: <Navigate to="/iam/accounts" replace /> },
              { path: '/iam/accounts', element: <AccountsPage /> },
              { path: '/iam/accounts/:accountId', element: <AccountDetailPage /> },
              { path: '/iam/roles', element: <RolesPage /> },
              { path: '/iam/memberships', element: <MembershipsPage /> },
              { path: '/iam/memberships/:membershipId', element: <MembershipDetailPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Result status="404" title="Không tìm thấy trang" /> },
]);
