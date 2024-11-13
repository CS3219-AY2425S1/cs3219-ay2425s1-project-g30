'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface CollabLayoutProps {
  children: ReactNode;
}

const CollabLayout = ({ children }: CollabLayoutProps) => {
  const animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div key="collab-layout" {...animationProps}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default CollabLayout;
