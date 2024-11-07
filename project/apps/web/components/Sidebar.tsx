'use client';

import { UserDataDto } from '@repo/dtos/users';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Clock,
  HomeIcon,
  ListIcon,
  LogOut,
  UserRound,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { QUERY_KEYS } from '@/constants/queryKeys';
import { checkActiveCollabs } from '@/lib/api/collab';
import { cn } from '@/lib/utils';

interface SidebarProps {
  signOut: () => void;
  user: UserDataDto;
}

const Sidebar = ({ signOut, user }: SidebarProps) => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const { data: showDot } = useQuery<boolean>({
    queryKey: [QUERY_KEYS.Collab, user.id],
    queryFn: () => checkActiveCollabs({ user_id: user.id }),
  });

  const navItems = [
    { name: 'Home', href: '/', icon: <HomeIcon className="w-5 h-5" /> },
    {
      name: 'Questions',
      href: '/questions',
      icon: <ListIcon className="w-5 h-5" />,
    },
    {
      name: 'Sessions',
      href: '/sessions',
      icon: (
        <div className="relative inline-block">
          <Activity className="w-5 h-5" />
          {showDot && (
            <span
              className={`absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white`}
            />
          )}
        </div>
      ),
    },
    {
      name: 'History',
      href: '/history',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: <UserRound className="w-5 h-5" />,
    },
    {
      name: 'Manage Users',
      href: '/manage-users',
      icon: <UsersRound className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    signOut();
    router.replace('/');
  };

  return (
    <motion.aside
      className="fixed top-16 left-0 h-[calc(100vh-4rem)] flex flex-col justify-between z-40 py-4 px-2 shadow bg-white"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ width: 80 }}
      animate={{ width: isHovered ? 180 : 80 }}
      transition={{ duration: 0.2 }}
    >
      <nav className="flex flex-col m-2 space-y-2 overflow-hidden">
        {navItems.map((item) => {
          if (user?.role != 'Admin' && item.name == 'Manage Users') {
            return;
          }

          return (
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
          );
        })}
      </nav>

      <motion.div
        onClick={handleLogout}
        className="flex items-center justify-start px-2 py-2 mx-2 transition-all duration-300 rounded-md cursor-pointer hover:bg-gray-100"
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
