'use client';

import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/Layout';
import ManagementPageLayout from '@/components/ManagementPageLayout/ManagementPageLayout';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <ManagementPageLayout>{children}</ManagementPageLayout>
      </AdminLayout>
    </ProtectedRoute>
  );
}
