'use client';

import { ReactNode } from 'react';

export default function LoginLayout({ children }: { children: ReactNode }) {
  // Don't wrap login page in ProtectedRoute - it should be accessible without authentication
  return <>{children}</>;
}
