"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="font-bold">Dashboard Page</div>
        <Link href="/questions" passHref>
          <Button className="mt-4">Go to Questions Repository</Button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
