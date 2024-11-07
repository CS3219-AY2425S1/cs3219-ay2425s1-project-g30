'use client';

import { Inter, Roboto } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { EnforceLoginStatePageWrapper } from '@/components/auth-wrappers/EnforceLoginStatePageWrapper';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import Sidebar from '@/components/Sidebar';
import Suspense from '@/components/Suspense';
import Topbar from '@/components/Topbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';

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
  const user = useAuthStore.use.user();
  const signOut = useAuthStore.use.signOut();
  const renderSidebarAndTopbar =
    !pathname.startsWith('/collab') &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/search');

  return (
    <div className="flex h-screen overflow-hidden transition-opacity duration-500 ease-out">
      {user && renderSidebarAndTopbar && (
        <>
          <Topbar user={user} />
          <Sidebar signOut={signOut} user={user} />
        </>
      )}
      <main
        className={`flex-1 transition-all duration-500 ease-in-out ${renderSidebarAndTopbar ? 'ml-20 mt-16' : 'mt-0 ml-0'} overflow-auto`}
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
  const router = useRouter();
  const { toast } = useToast();
  const fetchUser = useAuthStore.use.fetchUser();
  const isLoginPage = pathname.startsWith('/login');

  useEffect(() => {
    if (isLoginPage) return;

    const initialiseUser = async () => {
      try {
        await fetchUser();
      } catch {
        router.replace('/login');
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Please login to continue',
        });
      }
    };
    initialiseUser();
  }, [fetchUser]);

  return (
    <html lang="en" className={inter.className}>
      <body className={roboto.className}>
        <Suspense fallback={<Skeleton className="w-screen h-screen" />}>
          <ReactQueryProvider>
            <EnforceLoginStatePageWrapper requireLogin={!isLoginPage}>
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
