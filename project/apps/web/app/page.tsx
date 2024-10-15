"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

const Dashboard = () => {
  const user = useAuthStore.use.user();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="font-bold">Dashboard Page</div>
        <div className="flex items-center space-x-2">
          {!user && (
            <Link href="/auth" passHref>
              <Button className="mt-4">Log In</Button>
            </Link>
          )}
          <Link href="/questions" passHref>
            <Button className="mt-4">Go to Questions Repository</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
