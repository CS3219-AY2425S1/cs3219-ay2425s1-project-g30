'use client';

import { MatchRequestMsgDto } from '@repo/dtos/match';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';  // Updated to handle routing
import { useEffect, useRef, useState } from 'react';

import CardWaterfall from '@/components/match/CardWaterfall';
import MatchingForm from '@/components/match/MatchingForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createMatch } from '@/lib/api/match';
import useSocketStore from '@/stores/useSocketStore';

const Dashboard = () => {
  const { isSearching, startSearch, stopSearch, socket } = useSocketStore(); // Removed toast message logic
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const createMutation = useMutation({
    mutationFn: (newMatch: MatchRequestMsgDto) => createMatch(newMatch),
    onMutate: () => {
      startSearch();
    },
    onError: (error: any) => {
      stopSearch();
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const handleCreateMatch = (newMatch: MatchRequestMsgDto) => {
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

    stopSearch();
  };

  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (message: any) => {
      console.log('Match found:', message);
      stopSearch();
      toast({
        variant: 'success',
        title: 'Match Found',
        description: 'Your match was successful.',
      });
      router.push(`/match/${message.id}`);
    };

    const handleMatchInvalid = (message: string) => {
      console.log('Match invalid:', message);
      stopSearch();
      toast({
        variant: 'error',
        title: 'Match Invalid',
        description: 'Your match was invalid.',
      });
    };

    const handleMatchRequestExpired = (message: string) => {
      console.log('Match request expired:', message);
      stopSearch();
      toast({
        variant: 'error',
        title: 'Match Expired',
        description: 'Your match request has expired. Please try again.',
      });
    };

    socket.on('match_found', handleMatchFound);
    socket.on('match_invalid', handleMatchInvalid);
    socket.on('match_request_expired', handleMatchRequestExpired);

    // Clean up the event listeners when the component is unmounted
    return () => {
      socket.off('match_found', handleMatchFound);
      socket.off('match_invalid', handleMatchInvalid);
      socket.off('match_request_expired', handleMatchRequestExpired);
    };
  }, [socket, stopSearch, toast, router]);

  // Cleanup timer on unmount
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
        {isSearching ? (
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
