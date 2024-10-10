"use client";

import {
  type ComponentProps,
  Suspense as ReactSuspense,
  useEffect,
  useState,
} from "react";

export default function SuspenseWrapper(
  props: ComponentProps<typeof ReactSuspense>
) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Since `next/navigation`'s router doesn't have `isReady`, use `useEffect` to set mounted
    setIsMounted(true);
  }, []);

  if (isMounted) {
    return <ReactSuspense {...props} />;
  }
  return <>{props.fallback}</>;
}
