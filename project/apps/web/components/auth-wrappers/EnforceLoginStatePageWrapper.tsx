"use client";

import { useRouter } from "next/navigation";
import { type PropsWithChildren, useMemo } from "react";

import { SIGN_IN } from "@/lib/routes";

import { useLoginState } from "@/contexts/LoginStateContext";

interface EnforceLoginStatePageWrapperProps {
  /**
   * Route to redirect to when user is not authenticated. Defaults to
   * `SIGN_IN` route if not provided.
   */
  redirectTo?: string;
}

const Redirect = ({ redirectTo }: EnforceLoginStatePageWrapperProps) => {
  const router = useRouter();
  const redirectUrl = useMemo(() => {
    if (typeof window === "undefined") return encodeURIComponent("/");
    const { pathname, search, hash } = window.location;
    return encodeURIComponent(`${pathname}${search}${hash}`);
  }, []);

  void router.replace(`${redirectTo}?callbackUrl=${redirectUrl}`);

  return <div>Loading...</div>;
};

/**
 * Page wrapper that renders children only if the login state localStorage flag has been set.
 * Otherwise, will redirect to the route passed into the `redirectTo` prop.
 *
 * @note 🚨 There is no authentication being performed by this component. This component is merely a wrapper that checks for the presence of the login flag in localStorage. This means that a user could add the flag and bypass the check. Any page children that require authentication should also perform authentication checks in that page itself!
 */
export const EnforceLoginStatePageWrapper = ({
  redirectTo = SIGN_IN,
  children,
}: PropsWithChildren<EnforceLoginStatePageWrapperProps>): React.ReactElement => {
  const { hasLoginStateFlag } = useLoginState();

  if (hasLoginStateFlag) {
    return <>{children}</>;
  }

  return <Redirect redirectTo={redirectTo} />;
};
