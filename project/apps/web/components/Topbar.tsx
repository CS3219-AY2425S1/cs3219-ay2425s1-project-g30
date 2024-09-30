import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Topbar = () => {
  return (
    <header className="bg-white text-black p-4 shadow">
      <div className="px-4 flex justify-between items-center">
        <Link href="/" passHref>
          <h1 className="text-lg font-medium cursor-pointer">PeerPrep</h1>
        </Link>
        {/* //TODO: Replace with real user data */}
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">John Doe</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
