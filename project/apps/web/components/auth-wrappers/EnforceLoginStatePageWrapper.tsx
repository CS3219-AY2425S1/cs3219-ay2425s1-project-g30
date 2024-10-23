'use client';

import { useRouter } from 'next/navigation';
import { type PropsWithChildren, useEffect, useMemo } from 'react';

import { SIGN_IN } from '@/lib/routes';
import { useAuthStore } from '@/stores/useAuthStore';

import DefaultSkeleton from '../DefaultSkeleton';

interface EnforceLoginStatePageWrapperProps {
  /**
   * Route to redirect to when user is not authenticated. Defaults to
   * `SIGN_IN` route if not provided.
   */
  redirectTo?: string;
  enabled?: boolean;
}

const Redirect = ({ redirectTo }: EnforceLoginStatePageWrapperProps) => {
  const router = useRouter();
  const redirectUrl = useMemo(() => {
    if (typeof window === 'undefined') return encodeURIComponent('/');
    const { pathname, search, hash } = window.location;
    return encodeURIComponent(`${pathname}${search}${hash}`);
  }, []);

  useEffect(() => {
    void router.replace(`${redirectTo}?callbackUrl=${redirectUrl}`);
  }, [router, redirectTo, redirectUrl]);

  return <DefaultSkeleton />;
};

/**
 * Page wrapper that renders children only if the login state localStorage flag has been set.
 * Otherwise, will redirect to the route passed into the `redirectTo` prop.
 *
 * @note 🚨 There is no authentication being performed by this component. This component is merely a wrapper that checks for the presence of the login flag in localStorage. This means that a user could add the flag and bypass the check. Any page children that require authentication should also perform authentication checks in that page itself!
 */
export const EnforceLoginStatePageWrapper = ({
  redirectTo = SIGN_IN,
  enabled = true,
  children,
}: PropsWithChildren<EnforceLoginStatePageWrapperProps>): React.ReactElement => {
  const user = useAuthStore.use.user();

  if (user || !enabled) {
    return <>{children}</>;
  }

  return <Redirect redirectTo={redirectTo} />;
};
