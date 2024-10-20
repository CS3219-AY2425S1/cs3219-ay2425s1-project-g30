'use client';

import { Inter, Roboto } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { EnforceLoginStatePageWrapper } from '@/components/auth-wrappers/EnforceLoginStatePageWrapper';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import Sidebar from '@/components/Sidebar';
import Suspense from '@/components/Suspense';
import Topbar from '@/components/Topbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/stores/useAuthStore';
import useMatchStore from '@/stores/useMatchStore';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const LayoutWithSidebarAndTopbar = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const { isMatching } = useMatchStore();
  const user = useAuthStore.use.user();
  const signOut = useAuthStore.use.signOut();

  const excludePaths = ['/login'];

  // TODO: validate match path
  const renderSidebarAndTopbar =
    !excludePaths.includes(pathname) && !pathname.startsWith('/match/');

  return (
    <div className="flex h-screen overflow-hidden transition-opacity duration-500 ease-out">
      {renderSidebarAndTopbar && !isMatching && (
        <>
          <Topbar user={user} />
          <Sidebar signOut={signOut} />
        </>
      )}
      <main
        className={`flex-1 transition-all duration-500 ease-in-out ${renderSidebarAndTopbar && !isMatching ? 'ml-20 mt-16' : 'mt-0 ml-0'} overflow-auto`}
      >
        {children}
      </main>
    </div>
  );
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const fetchUser = useAuthStore.use.fetchUser();
  const excludeLoginStatePaths = ['/login'];
  const shouldEnforceLoginState = !excludeLoginStatePaths.includes(pathname);

  // Fetch user data on initial render, ensures logged in user data is available
  useEffect(() => {
    const initializeUser = async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    initializeUser();
  }, [fetchUser]);

  return (
    <html lang="en" className={inter.className}>
      <body className={roboto.className}>
        <Suspense fallback={<Skeleton className="w-screen h-screen" />}>
          <ReactQueryProvider>
            <EnforceLoginStatePageWrapper enabled={shouldEnforceLoginState}>
              <LayoutWithSidebarAndTopbar>
                {children}
              </LayoutWithSidebarAndTopbar>
            </EnforceLoginStatePageWrapper>
          </ReactQueryProvider>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
