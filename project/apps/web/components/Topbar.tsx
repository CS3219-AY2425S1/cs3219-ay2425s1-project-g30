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
import { useAuthStore } from "@/store/AuthStore";
import { Button } from "@/components/ui/button";

const Topbar = () => {
  const user = useAuthStore.use.user();
  const logout = useAuthStore.use.signOut();
  const router = useRouter();
  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white text-black p-4 shadow z-50">
      <div className="px-4 flex justify-between items-center">
        <Link href="/" passHref>
          <h1 className="text-lg font-medium cursor-pointer">PeerPrep</h1>
        </Link>
        { user ?
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage />
                  <AvatarFallback>{user.username[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.username}</span>
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
          :
          <Button>
            <Link href="/auth" passHref>
              Login
            </Link>
          </Button>
        }
      </div>
    </header>
  );
};

export default Topbar;
