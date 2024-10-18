'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, ListIcon, UserRound, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: <HomeIcon className="w-5 h-5" /> },
    {
      name: 'Question',
      href: '/questions',
      icon: <ListIcon className="w-5 h-5" />,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: <UserRound className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    // TODO: Handle Logout
    console.log('Logout clicked');
  };

  return (
    <motion.aside
      className="fixed top-16 left-0 h-[calc(100vh-4rem)] flex flex-col justify-between z-40 py-4 px-2 shadow bg-white"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ width: 80 }}
      animate={{ width: isHovered ? 160 : 80 }}
      transition={{ duration: 0.2 }}
    >
      <nav className="flex flex-col space-y-2 m-2 overflow-hidden">
        {navItems.map((item) => (
          <motion.div
            key={item.name}
            className={cn(
              'flex items-center justify-start py-2 px-2 rounded-md transition-all duration-300',
              pathname === item.href ? 'bg-gray-100' : 'hover:bg-gray-100',
            )}
          >
            <Link href={item.href} className="flex items-center w-full">
              <div className="ml-1.5">{item.icon}</div>
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="ml-3 text-sm font-medium whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>
        ))}
      </nav>

      <motion.div
        onClick={handleLogout}
        className="flex items-center justify-start mx-2 py-2 px-2 rounded-md cursor-pointer hover:bg-gray-100 transition-all duration-300"
      >
        <div className="ml-1.5">
          <LogOut className="w-5 h-5" />
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="ml-3 text-sm font-medium whitespace-nowrap"
            >
              Logout
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;
