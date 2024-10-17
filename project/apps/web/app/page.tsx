'use client';

import CardWaterfall from '@/components/dashboard/CardWaterfall';
import MatchingForm from '@/components/dashboard/MatchingForm';

const Dashboard = () => {
  return (
    <div className="container mx-auto flex justify-between h-full">
      {/* Left Side Form */}
      <div className="flex w-2/5 justify-center items-center mr-12">
        <MatchingForm />
      </div>
      {/* Right Side Card Waterfall */}
      <CardWaterfall className="w-3/5" />
    </div>
  );
};

export default Dashboard;
