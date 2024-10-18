'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
// import { EnforceLoginStatePageWrapper } from "@/components/auth-wrappers/EnforceLoginStatePageWrapper";

interface MatchLayoutProps {
  children: ReactNode;
}

const MatchLayout = ({ children }: MatchLayoutProps) => {
  const animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 },
  };

  // enforce login here
  return (
    <AnimatePresence mode="wait">
      <motion.div key="match-layout" {...animationProps}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchLayout;
