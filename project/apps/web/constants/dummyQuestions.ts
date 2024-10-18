import {
  CATEGORY,
  COMPLEXITY,
} from '@repo/dtos/generated/enums/questions.enums';
import { QuestionDto } from '@repo/dtos/questions';

export const dummyQuestions: QuestionDto[] = [
  {
    id: '1',
    q_title: 'Reverse a String',
    q_desc:
      'Write a function that reverses a string. The input string is given as an array of characters. Modify the input array in-place with O(1) extra memory.',
    q_category: [CATEGORY.Strings, CATEGORY.Algorithms],
    q_complexity: COMPLEXITY.Easy,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  },
  {
    id: '2',
    q_title: 'Word Ladder',
    q_desc:
      'Given two words (beginWord and endWord), and a dictionary, return the length of the shortest transformation sequence from beginWord to endWord. Only one letter can be changed at a time, and each intermediate word must be in the dictionary.',
    q_category: [CATEGORY.Algorithms],
    q_complexity: COMPLEXITY.Hard,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  },
  {
    id: '3',
    q_title: '3Sum Closest',
    q_desc:
      'Given an integer array nums of length n and an integer target, find three integers in nums such that the sum is closest to target. Return the sum of the three integers.',
    q_category: [CATEGORY.Algorithms, CATEGORY.Arrays],
    q_complexity: COMPLEXITY.Medium,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  },
  {
    id: '4',
    q_title: 'Roman to Integer',
    q_desc: 'Given a roman numeral, convert it to an integer.',
    q_category: [CATEGORY.Algorithms],
    q_complexity: COMPLEXITY.Easy,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  },
  {
    id: '5',
    q_title: 'LRU Cache',
    q_desc:
      'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put methods.',
    q_category: [CATEGORY.DataStructures],
    q_complexity: COMPLEXITY.Medium,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  },
  {
    id: '6',
    q_title: 'Add Binary',
    q_desc:
      'Given two binary strings a and b, return their sum as a binary string.',
    q_category: [CATEGORY.BitManipulation, CATEGORY.Algorithms],
    q_complexity: COMPLEXITY.Easy,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  },
  {
    id: '7',
    q_title: 'Fibonacci Number',
    q_desc:
      'The Fibonacci numbers form a sequence such that each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).',
    q_category: [CATEGORY.Recursion, CATEGORY.Algorithms],
    q_complexity: COMPLEXITY.Easy,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  },
  {
    id: '8',
    q_title: 'Implement Stack using Queues',
    q_desc:
      'Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support push, top, pop, and empty operations.',
    q_category: [CATEGORY.DataStructures],
    q_complexity: COMPLEXITY.Medium,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  },
  {
    id: '9',
    q_title: 'Combine Two Tables',
    q_desc:
      'Given tables Person and Address, write a solution to report the first name, last name, city, and state of each person in the Person table.',
    q_category: [CATEGORY.Databases],
    q_complexity: COMPLEXITY.Medium,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  },
  {
    id: '11',
    q_title: 'Merge Sorted Arrays',
    q_desc:
      'Given two sorted integer arrays nums1 and nums2, merge nums2 into nums1 as one sorted array.',
    q_category: [CATEGORY.Arrays, CATEGORY.Algorithms],
    q_complexity: COMPLEXITY.Easy,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  },
  {
    id: '12',
    q_title: 'Valid Parentheses',
    q_desc:
      "Given a string containing only '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    q_category: [CATEGORY.DataStructures, CATEGORY.Algorithms],
    q_complexity: COMPLEXITY.Easy,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  },
];
