'use client';

import { MatchCancelDto, MatchRequestMsgDto } from '@repo/dtos/match';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cancelMatch, createMatch } from '@/lib/api/match';
import useSocketStore from '@/stores/useSocketStore';

const Search = () => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchDataParam = searchParams.get('matchData');

  const isSearching = useSocketStore((state) => state.isSearching);
  const startSearch = useSocketStore((state) => state.startSearch);
  const stopSearch = useSocketStore((state) => state.stopSearch);
  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);
  const socket = useSocketStore((state) => state.socket);

  const previousIsSearching = useRef(isSearching);
  const intervalRef = useRef<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [matchReqId, setMatchReqId] = useState<string | null>(null);
  const [matchFound, setMatchFound] = useState(false);

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
    },
  });

  const handleCreateMatch = (newMatch: MatchRequestMsgDto) => {
    setTimer(0);
    createMutation.mutate(newMatch);
  };

  const stopMatching = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (matchReqId) {
      const cancelMatchReq: MatchCancelDto = { match_req_id: matchReqId };
      cancelMatchMutation.mutate(cancelMatchReq);
    }
    stopSearch();
  };

  // Set up WebSocket event listeners for match notifications
  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (message: string) => {
      console.log('Match found:', message);
      setMatchFound(true);
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
      stopMatching();
      toast({
        variant: 'error',
        title: 'Match Invalid',
        description: 'Your match was invalid.',
      });
    };

    const handleMatchRequestExpired = (message: string) => {
      console.log('Match request expired:', message);
      stopSearch();
      stopMatching();
      toast({
        variant: 'error',
        title: 'Match Expired',
        description: 'Your match request has expired. Please try again.',
      });
    };

    socket.on('match_found', handleMatchFound);
    socket.on('match_invalid', handleMatchInvalid);
    socket.on('match_request_expired', handleMatchRequestExpired);

    return () => {
      socket.off('match_found', handleMatchFound);
      socket.off('match_invalid', handleMatchInvalid);
      socket.off('match_request_expired', handleMatchRequestExpired);
    };
  }, [socket, stopSearch, toast, router]);

  // Handle match creation from query params
  useEffect(() => {
    if (matchDataParam) {
      const matchData: MatchRequestMsgDto = JSON.parse(matchDataParam);
      handleCreateMatch(matchData);
    }
  }, [matchDataParam]);

  // Handle browser tab close to cancel match
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

  // Connect and disconnect the socket server
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle timer
  useEffect(() => {
    if (isSearching && intervalRef.current === null) {
      intervalRef.current = window.setInterval(() => {
        setTimer((prev) => {
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSearching]);

  // Redirect to home page when isSearching becomes false & no match found
  useEffect(() => {
    if (previousIsSearching.current && !isSearching && !matchFound) {
      router.push('/');
    }

    previousIsSearching.current = isSearching;
  }, [isSearching, router, matchFound]);

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
            className="flex w-full justify-center items-center"
            key="redirecting"
            {...fadeAnimation}
          >
            <div className="text-lg font-medium">
              Redirecting to home page...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
