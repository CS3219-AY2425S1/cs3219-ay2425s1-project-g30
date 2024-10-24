'use client';

import { MatchCancelDto, MatchRequestMsgDto } from '@repo/dtos/match';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useStopwatch } from 'react-timer-hook';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { cancelMatch, createMatch } from '@/lib/api/match';
import useSocketStore from '@/stores/useSocketStore';
import { validateMatchParam } from '@/utils/validateMatchParam';

const Search = () => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchDataParam = searchParams.get('matchData');

  const { totalSeconds, reset } = useStopwatch({ autoStart: true });

  const connect = useSocketStore((state) => state.connect);
  const isConnected = useSocketStore((state) => state.isConnected);
  const disconnect = useSocketStore((state) => state.disconnect);
  const socket = useSocketStore((state) => state.socket);

  const [matchReqId, setMatchReqId] = useState<string | null>(null);
  const isCreateMutatingRef = useRef(false);
  const isCancelMutatingRef = useRef(false);

  const createMutation = useMutation({
    mutationFn: (newMatch: MatchRequestMsgDto) => createMatch(newMatch),
    onSuccess: (data) => {
      setMatchReqId(data.match_req_id);
      isCreateMutatingRef.current = false;
    },
    onError: (error: any) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message,
      });
      router.push(`/`);
      isCreateMutatingRef.current = false;
    },
  });

  const cancelMatchMutation = useMutation({
    mutationFn: (matchCancel: MatchCancelDto) => cancelMatch(matchCancel),
    onSuccess: () => {
      toast({
        title: 'Canceled',
        description: 'Your match request has been successfully canceled.',
      });
      isCancelMutatingRef.current = false;
    },
    onError: (error: any) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: `Failed to cancel match: ${error.message}`,
      });
      isCancelMutatingRef.current = false;
    },
  });

  const handleCreateMatch = useCallback(
    (newMatch: MatchRequestMsgDto) => {
      if (!isCreateMutatingRef.current) {
        reset();
        isCreateMutatingRef.current = true;
        createMutation.mutate(newMatch);
      }
    },

    [createMutation.mutate, reset],
  );

  const stopMatching = () => {
    if (!isCancelMutatingRef.current && matchReqId) {
      reset();
      isCancelMutatingRef.current = true;
      const cancelMatchReq: MatchCancelDto = { match_req_id: matchReqId };
      cancelMatchMutation.mutate(cancelMatchReq);
    }
    router.push('/');
  };

  // Connect and disconnect the socket server
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Set up WebSocket event listeners for match notifications
  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (message: string) => {
      console.log('Match found:', message);
      toast({
        variant: 'success',
        title: 'Match Found',
        description: 'Your match was successful.',
      });
      router.push(`/match/${message}`);
    };

    const handleMatchInvalid = (message: string) => {
      console.log('Match invalid:', message);
      toast({
        variant: 'error',
        title: 'Match Invalid',
        description: 'Your match was invalid.',
      });
      stopMatching();
    };

    const handleMatchRequestExpired = (message: string) => {
      console.log('Match request expired:', message);
      toast({
        variant: 'error',
        title: 'Match Expired',
        description: 'Your match request has expired. Please try again.',
      });
      stopMatching();
    };

    socket.on('match_found', handleMatchFound);
    socket.on('match_invalid', handleMatchInvalid);
    socket.on('match_request_expired', handleMatchRequestExpired);

    return () => {
      socket.off('match_found', handleMatchFound);
      socket.off('match_invalid', handleMatchInvalid);
      socket.off('match_request_expired', handleMatchRequestExpired);
    };
  }, [socket, toast, router]);

  // Handle match creation from query params
  useEffect(() => {
    if (matchDataParam) {
      const isValidMatchData = validateMatchParam(matchDataParam);
      if (!isValidMatchData) {
        console.log('Invalid search params');
        router.push('/');
        return;
      }
      if (isConnected) {
        const matchData: MatchRequestMsgDto = JSON.parse(matchDataParam);
        handleCreateMatch(matchData);
      }
    } else {
      console.log('No match data params found');
      router.push('/');
    }
  }, [matchDataParam, handleCreateMatch, isConnected]);

  const fadeAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 },
  };
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full gap-2 align-middle">
        Connecting...
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <div className="container flex justify-between h-full mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          className="flex flex-col items-center justify-center w-full gap-4"
          key="searching"
          {...fadeAnimation}
        >
          <div className="flex flex-row">
            <div className="mr-2 text-lg font-medium">Searching...</div>
            <div className="text-lg font-medium text-gray-600">
              ({totalSeconds}s)
            </div>
          </div>
          <Button variant="default" onClick={stopMatching}>
            Cancel
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Search;
