'use client';

import { motion, AnimatePresence } from 'framer-motion';

import { Skeleton } from '@/components/ui/skeleton';

const DefaultSkeleton = () => {
  const fadeAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="h-screen">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 bg-white text-black p-4 shadow z-50">
        <div className="px-4 flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />{' '}
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto flex justify-center items-center h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            className="flex justify-center items-center w-full"
            key="skeleton-form"
            {...fadeAnimation}
          >
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 w-full max-w-md space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DefaultSkeleton;
