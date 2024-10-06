"use client"

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/api/auth";

const Topbar = () => {
  const user = useAuthStore((state: any) => state.user);
  const logout = useAuthStore((state: any) => state.signOut);
  const router = useRouter();
  
  function handleLogout() {
    logout();
    router.push("/");
  }
  
  return (
    <header className="bg-white text-black p-4 shadow">
      <div className="px-4 flex justify-between items-center">
        <Link href="/" passHref>
          <h1 className="text-lg font-medium cursor-pointer">PeerPrep</h1>
        </Link>
        {/* //TODO: Replace with real user data */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage />
                <AvatarFallback>{user ? user.username[0] : "JD"}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user ? user.username : "John Doe"}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              {/* // TODO: Replace with real link */}
              <Link href="/" passHref>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;
