"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { type PropsWithChildren } from "react";

import { useLoginState } from "@/contexts/LoginStateContext";
import { LANDING } from "@/lib/routes";

interface PublicPageWrapperProps {
  redirect: Redirect;
}

/**
 * If `strict` is true, only users without the login flag in localStorage can access the route.
 * i.e. signin page, where authed users accessing that page should be
 * redirected out.
 * If `strict` is false, then both authed and non-authed users can access
 * the route.
 */
type Redirect = { strict: true; defaultUrl: string } | { strict: false };

/**
 * Page wrapper that renders children only if the login cookie is NOT found.
 * Otherwise, will redirect to the route passed into the `CALLBACK_URL_KEY` URL parameter.
 *
 * @note There is no authentication being performed by this component. This component is merely a
 *       wrapper that checks for the presence of the login flag in localStorage.
 */
export const PublicPageWrapper = ({
  redirect,
  children,
}: PropsWithChildren<PublicPageWrapperProps>): JSX.Element => {
  const router = useRouter();
  const { hasLoginStateFlag } = useLoginState();
  const searchParams = useSearchParams();

  if (hasLoginStateFlag && redirect.strict) {
    const callbackUrl =
      searchParams?.get("callbackUrl") ?? redirect.defaultUrl ?? LANDING;
    router.replace(callbackUrl);
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};
