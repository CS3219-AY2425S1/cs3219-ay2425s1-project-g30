'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import QuestionCard from '@/components/dashboard/QuestionCard';
import { dummyQuestions } from '@/constants/dummyQuestions';

interface CardWaterfallProps {
  animationDuration?: number;
  distance?: number;
  className?: string;
}

const CardWaterfall = ({
  animationDuration = 60,
  distance = 1900,
  className = '',
}: CardWaterfallProps) => {
  const [showInitial, setShowInitial] = useState(true);
  const reversedQuestions = [...dummyQuestions].reverse();
  const intervalBetweenCards = animationDuration / dummyQuestions.length;
  const cardOffset = distance / dummyQuestions.length;

  const startY = -200;
  const endY = startY + distance;

  // Hide initial cards after they complete their fall
  useEffect(() => {
    const hideInitialTimer = setTimeout(
      () => setShowInitial(false),
      animationDuration * 1000,
    );
    return () => clearTimeout(hideInitialTimer);
  }, [animationDuration]);

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: `${distance}px` }}
    >
      {/* Non-looping Initial Cards */}
      {showInitial &&
        reversedQuestions.map((question, index) => {
          const initialStartY = startY + (index + 1) * cardOffset;
          const initialEndY = endY + (index + 1) * cardOffset;

          return (
            <motion.div
              key={`initial-${question.id}`}
              className="absolute inset-x-0"
              initial={{ y: initialStartY, opacity: 1 }}
              animate={{ y: initialEndY, opacity: 0 }}
              transition={{
                duration: animationDuration,
                ease: 'linear',
                opacity: {
                  duration: animationDuration / 4,
                  delay: animationDuration * (0.7 - index * 0.05),
                },
              }}
            >
              <QuestionCard question={question} />
            </motion.div>
          );
        })}
      {/* Looping Cards */}
      {dummyQuestions.map((question, index) => (
        <motion.div
          key={`looping-${question.id}`}
          className="absolute inset-x-0"
          initial={{ y: startY }}
          animate={{ y: endY }}
          transition={{
            duration: animationDuration,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
            delay: index * intervalBetweenCards,
          }}
        >
          <QuestionCard question={question} />
        </motion.div>
      ))}
    </div>
  );
};

export default CardWaterfall;
