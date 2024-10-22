'use client';

import { MatchCancelDto, MatchRequestMsgDto } from '@repo/dtos/match';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import CardWaterfall from '@/components/match/CardWaterfall';
import MatchingForm from '@/components/match/MatchingForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cancelMatch, createMatch } from '@/lib/api/match';
import useSocketStore from '@/stores/useSocketStore';

const Dashboard = () => {
  const { isSearching, startSearch, stopSearch, socket } = useSocketStore();
  const [timer, setTimer] = useState(0);
  const [matchReqId, setMatchReqId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const createMutation = useMutation({
    mutationFn: (newMatch: MatchRequestMsgDto) => createMatch(newMatch),
    onMutate: () => {
      startSearch();
    },
    onSuccess: (data) => {
      setMatchReqId(data.match_req_id);
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

  const cancelMatchMutation = useMutation({
    mutationFn: (matchCancel: MatchCancelDto) => cancelMatch(matchCancel),
    onSuccess: () => {
      toast({
        title: 'Canceled',
        description: 'Your match request has been successfully canceled.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: `Failed to cancel match: ${error.message}`,
      });
      toast({
        variant: 'error',
        title: 'Error',
        description: `Failed to cancel match: ${error.message}`,
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

    if (matchReqId) {
      const cancelMatchReq: MatchCancelDto = { match_req_id: matchReqId };
      cancelMatchMutation.mutate(cancelMatchReq);
    }
    stopSearch();
  };

  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (message: string) => {
      console.log('Match found:', message);
      stopSearch();
      toast({
        variant: 'success',
        title: 'Match Found',
        description: 'Your match was successful.',
      });

      router.push(`/match/${message}`);
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

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (matchReqId) {
        const matchCancel: MatchCancelDto = { match_req_id: matchReqId };
        cancelMatchMutation.mutate(matchCancel);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [matchReqId, cancelMatchMutation]);

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
    <div className="container flex justify-between h-full mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        {isSearching ? (
          <motion.div
            className="flex flex-col items-center justify-center w-full gap-4"
            key="searching"
            {...fadeAnimation}
          >
            <div className="flex flex-row">
              <div className="mr-2 text-lg font-medium">Searching...</div>
              <div className="text-lg font-medium text-gray-600">
                ({timer}s)
              </div>
            </div>
            <Button variant="default" onClick={stopMatching}>
              Cancel
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center justify-between w-full"
            key="form-and-results"
            {...fadeAnimation}
          >
            <div className="flex items-center justify-center w-2/5">
              <MatchingForm onMatch={handleCreateMatch} />
            </div>
            <CardWaterfall className="w-3/5 ml-20" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
