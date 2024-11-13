'use client';

import { MatchRequestMsgDto } from '@repo/dtos/match';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import CardWaterfall from '@/components/home/CardWaterfall';
import MatchingForm from '@/components/home/MatchingForm';

const Home = () => {
  const router = useRouter();

  const fadeAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 },
  };

  const handleMatchRequest = (matchRequestData: MatchRequestMsgDto) => {
    const queryString = new URLSearchParams({
      matchData: JSON.stringify(matchRequestData),
    }).toString();

    router.push(`/search?${queryString}`);
  };

  return (
    <div className="container flex justify-between h-full mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          className="flex w-full justify-between items-center"
          key="form-and-results"
          {...fadeAnimation}
        >
          <div className="flex w-2/5 justify-center items-center">
            <MatchingForm onMatch={handleMatchRequest} />
          </div>
          <CardWaterfall className="ml-20 w-3/5" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Home;
