'use client';

import { UserDataDto } from '@repo/dtos/users';
import Link from 'next/link';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopBarProps {
  user: UserDataDto | null;
}

const Topbar = ({ user }: TopBarProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white text-black p-4 shadow z-50">
      <div className="px-4 flex justify-between items-center">
        <Link href="/" passHref>
          <h1 className="text-lg font-medium cursor-pointer">PeerPrep</h1>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage />
                <AvatarFallback>{user?.username[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.username}</span>
            </div>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;
