'use client';

import { useRouter } from 'next/navigation';
import { type PropsWithChildren, useEffect, useMemo } from 'react';

import { LANDING, SIGN_IN } from '@/lib/routes';
import { useAuthStore } from '@/stores/useAuthStore';

import DefaultSkeleton from '../DefaultSkeleton';

interface EnforceLoginStatePageWrapperProps {
  requireLogin: boolean;
}

const Redirect = ({ requireLogin }: EnforceLoginStatePageWrapperProps) => {
  const router = useRouter();
  const redirectUrlForLogin = useMemo(() => {
    if (typeof window === 'undefined') return encodeURIComponent('/');
    const { pathname, search, hash } = window.location;
    return encodeURIComponent(`${pathname}${search}${hash}`);
  }, []);

  useEffect(() => {
    if (requireLogin) {
      // Redirect to SIGN_IN if not authenticated
      router.replace(`${SIGN_IN}?callbackUrl=${redirectUrlForLogin}`);
    } else {
      // Redirect to LANDING if already authenticated
      router.replace(LANDING);
    }
  }, [requireLogin, redirectUrlForLogin, router]);

  return <DefaultSkeleton />;
};

/**
 * Page wrapper that renders children only if either user authenticated + requireLogin or user unauthenticated + !requireLogin.
 * Otherwise, the user will be redirected.
 *
 * @note 🚨 There is no authentication being performed by this component. This component is merely a wrapper that checks authentication state and redirects if needed. Any page children that require authentication should also perform authentication checks in that page itself!
 */
export const EnforceLoginStatePageWrapper = ({
  requireLogin,
  children,
}: PropsWithChildren<EnforceLoginStatePageWrapperProps>): React.ReactElement => {
  const user = useAuthStore.use.user();

  // Valid conditions for rendering children
  if ((user && requireLogin) || (!user && !requireLogin)) {
    return <>{children}</>;
  }

  return <Redirect requireLogin={requireLogin} />;
};
