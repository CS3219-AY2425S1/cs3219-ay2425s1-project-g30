'use client';

import { MatchRequestDto } from '@repo/dtos/match';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import CardWaterfall from '@/components/match/CardWaterfall';
import MatchingForm from '@/components/match/MatchingForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createMatch } from '@/lib/api/match';
import useMatchStore from '@/stores/useMatchStore';

const Dashboard = () => {
  const { isMatching, setIsMatching } = useMatchStore();
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (newMatch: MatchRequestDto) => createMatch(newMatch),
    onMutate: () => setIsMatching(true),
    onSuccess: async () => {
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Match created successfully',
      });
      // TODO: Replace with actual matching reroute logic
      router.push('/match/1');
    },
    onError: (error: any) => {
      setIsMatching(false);
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const handleCreateMatch = (newMatch: MatchRequestDto) => {
    setTimer(0);

    if (!intervalRef.current) {
      intervalRef.current = window.setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    createMutation.mutate(newMatch);
  };

  const stopMatching = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsMatching(false);
    // TODO: Delete mutation here
  };

  useEffect(() => {
    if (timer >= 5) {
      stopMatching();
    }
  }, [timer]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fadeAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="container mx-auto flex justify-between h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {isMatching ? (
          <motion.div
            className="flex flex-col gap-4 items-center justify-center w-full"
            key="searching"
            {...fadeAnimation}
          >
            <div className="flex flex-row">
              <div className="text-lg font-medium mr-2">Searching...</div>
              <div className="text-gray-600 font-medium text-lg">
                ({timer}s)
              </div>
            </div>
            <Button variant="default" onClick={stopMatching}>
              Cancel
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="flex w-full justify-between items-center"
            key="form-and-results"
            {...fadeAnimation}
          >
            <div className="flex w-2/5 justify-center items-center">
              <MatchingForm onMatch={handleCreateMatch} />
            </div>
            <CardWaterfall className="ml-20 w-3/5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
