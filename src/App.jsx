import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import faqs from './data/faqs.json';
import mathCatalog from './data/math.json';
import elaCatalog from './data/ela.json';
import scienceCatalog from './data/science.json';
import socialCatalog from './data/social_studies.json';
import {
  Sparkles, Trophy, Flame, Star, Target, BookOpen, Calculator, FlaskConical,
  Globe2, ChevronRight, ChevronLeft, Check, X, Lightbulb, RotateCcw, Menu,
  TrendingUp, BarChart3, GraduationCap,
  Heart, Crown, ArrowRight, Brain,
  Lock, CheckCircle2, Circle, Play, Settings, Users, Search, UserCircle,
  Cpu, Code2, ChevronDown
} from 'lucide-react';
import {
  clearSavedSession,
  createAccount,
  emptyStats,
  loadSavedSession,
  saveLearningState,
  signInAccount,
} from './services/accountStorage';
import {
  getPlans,
  getStatus as getSubStatus,
  createCheckout,
  cancelSubscription as cancelSub,
  reactivateSubscription as reactivateSub,
  changePlan as changePlanAPI,
  getInvoices,
  getBillingPortal,
} from './services/paymentService';

/* =========================================================================
   Wijs — A complete educational platform inspired by Wijs
   Single-file React app with working practice engine, progress tracking,
   gamification, and adaptive difficulty.
   ========================================================================= */

// ---------- DATA LAYER ----------
// In a production app this would come from an API. Structured to make
// content management trivial: just add to these objects.

const GRADES = [
  { id: 'k',    label: 'Kindergarten',  color: '#EAB308', emoji: '🎨' },
  { id: '1',    label: 'Grade 1',       color: '#22C55E', emoji: '⭐' },
  { id: '2',    label: 'Grade 2',       color: '#06B6D4', emoji: '🌱' },
  { id: '3',    label: 'Grade 3',       color: '#6D8BC0', emoji: '🚀' },
  { id: '4',    label: 'Grade 4',       color: '#EC4899', emoji: '🔬' },
  { id: '5',    label: 'Grade 5',       color: '#F43F5E', emoji: '📚' },
  { id: '6',    label: 'Grade 6',       color: '#0EA5E9', emoji: '🔭' },
  { id: '7',    label: 'Grade 7',       color: '#10B981', emoji: '⚗️' },
  { id: '8',    label: 'Grade 8',       color: '#525AFF', emoji: '📐' },
  { id: '9',    label: 'Grade 9',       color: '#F59E0B', emoji: '🧬' },
  { id: '10',   label: 'Grade 10',      color: '#EF4444', emoji: '📊' },
  { id: '11',   label: 'Grade 11',      color: '#6D8BC0', emoji: '🏛️' },
  { id: '12',   label: 'Grade 12',      color: '#4AB5B5', emoji: '🎓' },
];

const SUBJECTS = {
  math:    { label: 'Math',           icon: Calculator,   color: '#525AFF', bg: '#F0FAFF', tagline: 'Numbers, shapes & patterns' },
  ela:     { label: 'ELA',            icon: BookOpen,     color: '#DB2777', bg: '#FDF2F8', tagline: 'Reading, writing & grammar' },
  science: { label: 'Science',        icon: FlaskConical, color: '#4AB5B5', bg: '#F0FDFA', tagline: 'Discover how the world works' },
  social:  { label: 'Social Studies', icon: Globe2,       color: '#B45309', bg: '#FFFBEB', tagline: 'History, geography & civics' },
};

// Skill catalog. Each skill has a curated set of questions across types.
// Difficulty levels: 1 (easy) → 3 (hard). Adaptive engine selects accordingly.
const SKILLS = {
  // ============ MATH — KINDERGARTEN ============
  'math-k-counting-10': {
    id: 'math-k-counting-10', subject: 'math', grade: 'k',
    title: 'Counting to 10', description: 'Count and compare numbers up to 10',
    explanation: 'You can count up to 10 on your fingers! 1, 2, 3, 4, 5, 6, 7, 8, 9, 10. Every number is one more than the last.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'How many fingers? ✋✋', options: ['8','9','10','11'], answer: '10', hint: 'Two whole hands!' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'How many dots? ⚫⚫⚫⚫⚫⚫⚫', options: ['5','6','7','8'], answer: '7', hint: 'Count each dot carefully.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'What number comes after 6?', options: ['5','7','8','9'], answer: '7', hint: 'Just one more than 6.' },
      { id: 'q4', type: 'mcq', difficulty: 1, prompt: 'What number comes before 9?', options: ['7','8','10','6'], answer: '8', hint: 'One less than 9.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Which number is bigger: 8 or 5?', options: ['8','5'], answer: '8', hint: 'Bigger numbers come later when you count.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Which number is smaller: 4 or 7?', options: ['4','7'], answer: '4', hint: 'Smaller numbers come first.' },
      { id: 'q7', type: 'mcq', difficulty: 2, prompt: 'Fill in: 5, 6, __, 8', options: ['7','9','4','10'], answer: '7', hint: 'Count up from 6.' },
      { id: 'q8', type: 'mcq', difficulty: 2, prompt: 'Fill in: 8, 9, __', options: ['7','10','11','6'], answer: '10', hint: 'After 9 comes 10.' },
      { id: 'q9', type: 'mcq', difficulty: 3, prompt: 'Which group has 9 stars?', options: ['⭐⭐⭐⭐⭐⭐⭐⭐','⭐⭐⭐⭐⭐⭐⭐⭐⭐','⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐','⭐⭐⭐⭐⭐⭐⭐'], answer: '⭐⭐⭐⭐⭐⭐⭐⭐⭐', hint: 'Count each row of stars.' },
      { id: 'q10', type: 'mcq', difficulty: 3, prompt: 'Tom has 6 marbles. Lily has 9. Who has MORE?', options: ['Tom','Lily'], answer: 'Lily', hint: '9 is bigger than 6.' },
    ],
  },
  'math-k-add-subtract-5': {
    id: 'math-k-add-subtract-5', subject: 'math', grade: 'k',
    title: 'Adding & Subtracting to 5', description: 'Simple add and take-away with small numbers',
    explanation: 'Adding (+) means putting groups together. Subtracting (−) means taking some away. 2 + 1 = 3. 4 − 1 = 3.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: '1 + 1 = ?', options: ['1','2','3','4'], answer: '2', hint: 'One plus one more.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: '2 + 2 = ?', options: ['3','4','5','6'], answer: '4', hint: 'Doubles! Two and two more.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: '3 + 1 = ?', options: ['2','3','4','5'], answer: '4', hint: 'Start at 3, add one more.' },
      { id: 'q4', type: 'mcq', difficulty: 1, prompt: '5 − 1 = ?', options: ['3','4','5','6'], answer: '4', hint: 'Take one away from 5.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: '2 + 3 = ?', options: ['4','5','6','7'], answer: '5', hint: 'Two plus three more.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: '4 − 2 = ?', options: ['1','2','3','4'], answer: '2', hint: 'Start with 4, take away 2.' },
      { id: 'q7', type: 'mcq', difficulty: 2, prompt: '🐶 + 🐶🐶 = how many dogs?', options: ['2','3','4','5'], answer: '3', hint: 'One dog plus two dogs.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'You have 5 cookies and eat 2. How many left? 🍪', options: ['1','2','3','4'], answer: '3', hint: '5 − 2.' },
      { id: 'q9', type: 'mcq', difficulty: 3, prompt: '3 + 2 is the same as:', options: ['4','5','6','7'], answer: '5', hint: 'Count up: 3, 4, 5.' },
      { id: 'q10', type: 'mcq', difficulty: 3, prompt: 'Sam has 4 cars. He gives 1 to a friend. How many now?', options: ['2','3','4','5'], answer: '3', hint: '4 − 1.' },
    ],
  },
  'math-k-shapes-2d': {
    id: 'math-k-shapes-2d', subject: 'math', grade: 'k',
    title: '2D Shapes', description: 'Identify shapes and their sides',
    explanation: '2D shapes are flat. Circles are round, squares have 4 equal sides, triangles have 3 sides, rectangles have 4 sides (2 long, 2 short).',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'How many sides does a square have?', options: ['3','4','5','6'], answer: '4', hint: 'Count the edges.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'How many sides does a triangle have?', options: ['2','3','4','5'], answer: '3', hint: '"Tri" means three.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'A circle has how many corners?', options: ['0','1','3','4'], answer: '0', hint: 'It is smooth and round.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Which has 4 sides but is NOT a square?', options: ['Circle','Triangle','Rectangle','Star'], answer: 'Rectangle', hint: '2 long sides and 2 short sides.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Which shape looks like a stop sign?', options: ['Circle','Square','Octagon','Triangle'], answer: 'Octagon', hint: '8 sides!' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'A clock face is most like a:', options: ['Square','Circle','Triangle','Rectangle'], answer: 'Circle', hint: 'It is round.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Which shape has more sides: square or triangle?', options: ['Square','Triangle'], answer: 'Square', hint: 'Square has 4, triangle has 3.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'A book cover is shaped like a:', options: ['Circle','Triangle','Rectangle','Star'], answer: 'Rectangle', hint: '4 sides — 2 long, 2 short.' },
    ],
  },
  'math-k-odd-even': {
    id: 'math-k-odd-even', subject: 'math', grade: 'k',
    title: 'Odd & Even Numbers', description: 'Count blocks and decide if the number is odd or even',
    explanation: 'Even numbers can be split into two equal groups: 2, 4, 6, 8, 10. Odd numbers always have one left over: 1, 3, 5, 7, 9. Try pairing up objects — if none are left over, the number is even!',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Is 2 odd or even? 🟦🟦', options: ['Odd','Even'], answer: 'Even', hint: 'Can you split 2 into two equal groups? 1 and 1 — yes! So it is even.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Is 3 odd or even? 🟨🟨🟨', options: ['Odd','Even'], answer: 'Odd', hint: 'Try to pair them: 1+1 — one is left over! That means 3 is odd.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Is 4 odd or even? 🟦🟦🟦🟦', options: ['Odd','Even'], answer: 'Even', hint: 'Pair them up: 2 and 2 — none left over! Even.' },
      { id: 'q4', type: 'mcq', difficulty: 1, prompt: 'Is 1 odd or even? 🟨', options: ['Odd','Even'], answer: 'Odd', hint: 'You cannot split 1 into two equal groups — it is odd.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Count the blocks: 🟦🟦🟦🟦🟦. Is 5 odd or even?', options: ['Odd','Even'], answer: 'Odd', hint: 'Pair them: 2+2, then 1 is left over. Odd!' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Count the blocks: 🟨🟨🟨🟨🟨🟨. Is 6 odd or even?', options: ['Odd','Even'], answer: 'Even', hint: 'Pair them: 3 groups of 2 — none left over. Even!' },
      { id: 'q7', type: 'mcq', difficulty: 2, prompt: 'Count the blocks: 🟦🟦🟦🟦🟦🟦🟦. Is 7 odd or even?', options: ['Odd','Even'], answer: 'Odd', hint: '3 pairs and 1 left over. Odd numbers always have one extra.' },
      { id: 'q8', type: 'mcq', difficulty: 2, prompt: 'Count the blocks: 🟨🟨🟨🟨🟨🟨🟨🟨. Is 8 odd or even?', options: ['Odd','Even'], answer: 'Even', hint: '4 pairs of 2 — nothing left over. Even!' },
      { id: 'q9', type: 'mcq', difficulty: 3, prompt: 'Count the blocks: 🟦🟦🟦🟦🟦🟦🟦🟦🟦. Is 9 odd or even?', options: ['Odd','Even'], answer: 'Odd', hint: '4 pairs and 1 block left over — so 9 is odd.' },
      { id: 'q10', type: 'mcq', difficulty: 3, prompt: 'Count the blocks: 🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨. Is 10 odd or even?', options: ['Odd','Even'], answer: 'Even', hint: '5 perfect pairs — nothing left over. 10 is even!' },
      { id: 'q11', type: 'mcq', difficulty: 3, prompt: 'Which of these numbers is EVEN?', options: ['1','3','6','9'], answer: '6', hint: 'Even numbers can be split into two equal groups. Try each one.' },
      { id: 'q12', type: 'mcq', difficulty: 3, prompt: 'Which of these numbers is ODD?', options: ['2','4','6','7'], answer: '7', hint: 'Odd numbers have one left over when you try to pair them. Which one has a leftover?' },
    ],
  },

  'math-k-ten-frames': {
    id: 'math-k-ten-frames', subject: 'math', grade: 'k',
    title: 'Ten Frames Counting', description: 'Count the dots in a ten frame to find the number',
    explanation: 'A ten frame is a box with 2 rows of 5 spaces. We fill it with dots to show numbers 1–10. Count all the filled circles (⚫) to find the number!',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Count the dots in the ten frame:\n⚫⚫⚫⚫⚫\n⚫⬜⬜⬜⬜\nHow many dots?', options: ['5','6','7','8'], answer: '6', hint: 'Count each dot one by one: 1, 2, 3, 4, 5, 6.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Count the dots in the ten frame:\n⚫⚫⚫⚫⬜\n⬜⬜⬜⬜⬜\nHow many dots?', options: ['3','4','5','6'], answer: '4', hint: 'Count just the top row: 1, 2, 3, 4.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Count the dots in the ten frame:\n⚫⚫⚫⚫⚫\n⬜⬜⬜⬜⬜\nHow many dots?', options: ['4','5','6','7'], answer: '5', hint: 'The top row is all filled! Count across: 1, 2, 3, 4, 5.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Count the dots in the ten frame:\n⚫⚫⚫⚫⚫\n⚫⚫⚫⬜⬜\nHow many dots?', options: ['6','7','8','9'], answer: '8', hint: 'Top row has 5. Count the bottom: 6, 7, 8.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Count the dots in the ten frame:\n⚫⚫⚫⚫⚫\n⚫⚫⬜⬜⬜\nHow many dots?', options: ['5','6','7','8'], answer: '7', hint: 'Top row has 5. Bottom row adds 2 more: 5 + 2 = 7.' },
      { id: 'q6', type: 'mcq', difficulty: 1, prompt: 'Count the dots in the ten frame:\n⚫⬜⬜⬜⬜\n⬜⬜⬜⬜⬜\nHow many dots?', options: ['1','2','3','4'], answer: '1', hint: 'There is only 1 dot in the whole frame!' },
      { id: 'q7', type: 'mcq', difficulty: 1, prompt: 'Count the dots in the ten frame:\n⚫⚫⚫⬜⬜\n⬜⬜⬜⬜⬜\nHow many dots?', options: ['2','3','4','5'], answer: '3', hint: 'Count the dots in the top row: 1, 2, 3.' },
      { id: 'q8', type: 'mcq', difficulty: 2, prompt: 'Count the dots in the ten frame:\n⚫⚫⚫⚫⚫\n⚫⚫⚫⚫⚫\nHow many dots?', options: ['8','9','10','11'], answer: '10', hint: 'The ten frame is full! A full ten frame always equals 10.' },
      { id: 'q9', type: 'mcq', difficulty: 2, prompt: 'A ten frame has 5 dots on top and 3 on the bottom. How many dots in all?', options: ['6','7','8','9'], answer: '8', hint: 'Add the top and bottom: 5 + 3 = ?' },
      { id: 'q10', type: 'mcq', difficulty: 3, prompt: 'A ten frame shows 9 dots. How many empty spaces are there?', options: ['0','1','2','3'], answer: '1', hint: 'A ten frame holds 10. 10 − 9 = ?' },
      { id: 'q11', type: 'mcq', difficulty: 3, prompt: 'Which ten frame shows the number 6?\nA: ⚫⚫⚫⚫⚫ / ⚫⬜⬜⬜⬜\nB: ⚫⚫⚫⚫⬜ / ⚫⚫⬜⬜⬜', options: ['A','B','Both','Neither'], answer: 'A', hint: 'Count A: 5 + 1 = 6. Count B: 4 + 2 = 6. Wait — check again!' },
      { id: 'q12', type: 'mcq', difficulty: 3, prompt: 'A ten frame has 4 empty spaces. How many dots does it show?', options: ['4','5','6','7'], answer: '6', hint: 'A ten frame holds 10. 10 − 4 empty = ? dots filled.' },
    ],
  },

  'math-k-counting-to-4': {
    id: 'math-k-counting-to-4', subject: 'math', grade: 'k',
    title: 'Counting to 4', description: 'Count balloons, fish, and objects from 1 to 4',
    explanation: 'We count objects by touching or pointing to each one and saying its number. 1, 2, 3, 4! Each number has a word: ONE, TWO, THREE, FOUR.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Count the balloons: 🎈\nHow many balloons?', options: ['1','2','3','4'], answer: '1', hint: 'There is just one balloon. That is ONE.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Count the balloons: 🎈🎈\nHow many balloons?', options: ['1','2','3','4'], answer: '2', hint: 'Count each balloon: 1, 2. That is TWO.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Count the balloons: 🎈🎈🎈\nHow many balloons?', options: ['1','2','3','4'], answer: '3', hint: 'Count: 1, 2, 3. That is THREE.' },
      { id: 'q4', type: 'mcq', difficulty: 1, prompt: 'Count the balloons: 🎈🎈🎈🎈\nHow many balloons?', options: ['1','2','3','4'], answer: '4', hint: 'Count: 1, 2, 3, 4. That is FOUR.' },
      { id: 'q5', type: 'mcq', difficulty: 1, prompt: 'Count the fish: 🐟\nHow many fish?', options: ['1','2','3','4'], answer: '1', hint: 'There is only one fish — ONE.' },
      { id: 'q6', type: 'mcq', difficulty: 1, prompt: 'Count the fish: 🐟🐟🐟\nHow many fish?', options: ['1','2','3','4'], answer: '3', hint: 'Point to each fish and count: 1, 2, 3.' },
      { id: 'q7', type: 'mcq', difficulty: 2, prompt: 'The number 2 is spelled:', options: ['ONE','TWO','THREE','FOUR'], answer: 'TWO', hint: '2 = TWO. Like two eyes!' },
      { id: 'q8', type: 'mcq', difficulty: 2, prompt: 'The number 4 is spelled:', options: ['ONE','TWO','THREE','FOUR'], answer: 'FOUR', hint: '4 = FOUR. Count your fingers on one hand minus the thumb!' },
      { id: 'q9', type: 'mcq', difficulty: 2, prompt: 'The word THREE means the number:', options: ['1','2','3','4'], answer: '3', hint: 'ONE=1, TWO=2, THREE=3, FOUR=4.' },
      { id: 'q10', type: 'mcq', difficulty: 2, prompt: 'Count the stars: ⭐⭐⭐⭐\nWhat number is this?', options: ['ONE','TWO','THREE','FOUR'], answer: 'FOUR', hint: 'Count: 1, 2, 3, 4. The word for 4 is FOUR.' },
      { id: 'q11', type: 'mcq', difficulty: 2, prompt: 'Count the apples: 🍎🍎\nWhat number is this?', options: ['ONE','TWO','THREE','FOUR'], answer: 'TWO', hint: '2 apples = TWO.' },
      { id: 'q12', type: 'mcq', difficulty: 3, prompt: 'Which group shows THREE objects?', options: ['🎈🎈','🐟🐟🐟','⭐⭐⭐⭐','🍎'], answer: '🐟🐟🐟', hint: 'Count each group. Which one has exactly 3?' },
    ],
  },

  // ============ MATH — GRADE 1 ============
  'math-1-addition': {
    id: 'math-1-addition', subject: 'math', grade: '1',
    title: 'Addition within 20', description: 'Add two numbers to make sums up to 20',
    explanation: 'When we add, we put two groups together. 3 + 2 means start with 3, then add 2 more, which gives us 5!',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: '3 + 4 = ?', options: ['5','6','7','8'], answer: '7', hint: 'Start at 3 and count up 4 more.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: '5 + 5 = ?', options: ['8','9','10','11'], answer: '10', hint: 'Doubles! Two hands of 5 fingers each.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: '6 + 2 = ?', options: ['7','8','9','10'], answer: '8', hint: 'Start at 6, count up 2.' },
      { id: 'q4', type: 'mcq', difficulty: 1, prompt: '4 + 4 = ?', options: ['6','7','8','9'], answer: '8', hint: 'Doubles trick!' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: '8 + 6 = ?', options: ['12','13','14','15'], answer: '14', hint: 'Try 8 + 2 = 10, then add 4 more.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: '7 + 5 = ?', options: ['10','11','12','13'], answer: '12', hint: '7 + 3 = 10, then add 2.' },
      { id: 'q7', type: 'mcq', difficulty: 2, prompt: '9 + 7 = ?', options: ['14','15','16','17'], answer: '16', hint: 'Make a 10: 9 + 1 = 10, then add 6.' },
      { id: 'q8', type: 'mcq', difficulty: 2, prompt: '6 + 6 = ?', options: ['10','11','12','13'], answer: '12', hint: 'Doubles: half a dozen plus half a dozen.' },
      { id: 'q9', type: 'mcq', difficulty: 3, prompt: 'Sara has 7 stickers. She gets 8 more. How many now?', options: ['13','14','15','16'], answer: '15', hint: 'Add 7 + 8.' },
      { id: 'q10', type: 'mcq', difficulty: 3, prompt: '13 + 6 = ?', options: ['18','19','20','21'], answer: '19', hint: 'Add the ones: 3 + 6 = 9, then add the ten.' },
      { id: 'q11', type: 'mcq', difficulty: 3, prompt: 'There are 9 birds in a tree and 4 more fly in. How many birds?', options: ['11','12','13','14'], answer: '13', hint: '9 + 4.' },
      { id: 'q12', type: 'mcq', difficulty: 3, prompt: 'Which two numbers add up to 15?', options: ['6 + 8','7 + 8','9 + 5','6 + 7'], answer: '7 + 8', hint: 'Try each pair.' },
    ],
  },
  'math-1-subtraction': {
    id: 'math-1-subtraction', subject: 'math', grade: '1',
    title: 'Subtraction within 20', description: 'Take away to find the difference',
    explanation: 'Subtraction means taking away. 8 − 3 means start with 8 and remove 3, leaving 5.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: '5 − 2 = ?', options: ['1','2','3','4'], answer: '3', hint: 'Start at 5, count back 2.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: '7 − 3 = ?', options: ['3','4','5','6'], answer: '4', hint: '7, 6, 5, 4 — count back 3.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: '10 − 5 = ?', options: ['3','4','5','6'], answer: '5', hint: 'Half of 10!' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: '12 − 4 = ?', options: ['6','7','8','9'], answer: '8', hint: 'Take 4 away from 12.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: '15 − 7 = ?', options: ['7','8','9','10'], answer: '8', hint: 'Think: 7 + ? = 15.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: '14 − 6 = ?', options: ['6','7','8','9'], answer: '8', hint: 'Count back from 14.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'There were 13 ducks. 5 swam away. How many left?', options: ['6','7','8','9'], answer: '8', hint: '13 − 5.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Sam had 18 candies. He gave 9 away. How many now?', options: ['7','8','9','10'], answer: '9', hint: '18 − 9 = half!' },
      { id: 'q9', type: 'mcq', difficulty: 3, prompt: 'Which problem equals 6?', options: ['10 − 3','11 − 5','12 − 7','15 − 8'], answer: '11 − 5', hint: 'Calculate each one.' },
    ],
  },
  'math-1-place-value': {
    id: 'math-1-place-value', subject: 'math', grade: '1',
    title: 'Tens and Ones', description: 'Understand 2-digit numbers as tens and ones',
    explanation: 'Numbers like 24 have a "tens" place and a "ones" place. 24 = 2 tens (20) + 4 ones (4).',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'In the number 23, what digit is in the tens place?', options: ['2','3','5','23'], answer: '2', hint: 'Tens is the first digit.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'In the number 47, what digit is in the ones place?', options: ['4','7','11','47'], answer: '7', hint: 'Ones is the last digit.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: '3 tens + 5 ones = ?', options: ['8','35','53','305'], answer: '35', hint: '3 tens is 30. 30 + 5 = ?' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: '1 ten + 8 ones = ?', options: ['9','18','81','108'], answer: '18', hint: '1 ten is 10. 10 + 8 = ?' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'How many tens are in 60?', options: ['0','6','16','60'], answer: '6', hint: '6 groups of 10.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Which is the same as 4 tens and 2 ones?', options: ['24','42','402','420'], answer: '42', hint: '40 + 2.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Which number is bigger: 39 or 41?', options: ['39','41'], answer: '41', hint: 'Compare the tens place first.' },
    ],
  },
  'math-1-number-bonds-8': {
    id: 'math-1-number-bonds-8', subject: 'math', grade: '1',
    title: 'Number Bonds — Sums of 8', description: 'Find the missing number that makes 8 when added together',
    explanation: 'Number bonds show two parts that make a whole. When the whole is 8, the two parts always add up to 8. If one part is 5, the other must be 3, because 5 + 3 = 8. Think: what is missing to reach 8?',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: '4 + __ = 8\nWhat is the missing number?', options: ['2','3','4','5'], answer: '4', hint: 'Start at 4 and count up to 8: 5, 6, 7, 8 — that is 4 more.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: '5 + __ = 8\nWhat is the missing number?', options: ['2','3','4','5'], answer: '3', hint: 'Start at 5 and count up to 8: 6, 7, 8 — that is 3 more.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: '2 + __ = 8\nWhat is the missing number?', options: ['4','5','6','7'], answer: '6', hint: 'Start at 2 and count up to 8: 3, 4, 5, 6, 7, 8 — that is 6 more.' },
      { id: 'q4', type: 'mcq', difficulty: 1, prompt: '7 + __ = 8\nWhat is the missing number?', options: ['0','1','2','3'], answer: '1', hint: 'Start at 7 — just one more step reaches 8!' },
      { id: 'q5', type: 'mcq', difficulty: 1, prompt: '6 + __ = 8\nWhat is the missing number?', options: ['1','2','3','4'], answer: '2', hint: '6 + 2 = 8. Count up from 6: 7, 8.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: '3 + __ = 8\nWhat is the missing number?', options: ['3','4','5','6'], answer: '5', hint: '3 + 5 = 8. Think of the pair: 5 + 3.' },
      { id: 'q7', type: 'mcq', difficulty: 2, prompt: '8 + __ = 8\nWhat is the missing number?', options: ['0','1','2','8'], answer: '0', hint: '8 is already 8! Adding 0 keeps it the same.' },
      { id: 'q8', type: 'mcq', difficulty: 2, prompt: '1 + __ = 8\nWhat is the missing number?', options: ['5','6','7','8'], answer: '7', hint: 'Start at 1 and count up to 8 — you need 7 more.' },
      { id: 'q9', type: 'mcq', difficulty: 2, prompt: 'Tom has 4 red marbles. He needs 8 marbles in all. How many more does he need?', options: ['2','3','4','5'], answer: '4', hint: '4 + ? = 8.' },
      { id: 'q10', type: 'mcq', difficulty: 3, prompt: 'Which pair of numbers makes a sum of 8?', options: ['3 + 6','2 + 5','6 + 2','4 + 3'], answer: '6 + 2', hint: 'Add each pair. Which one totals 8?' },
      { id: 'q11', type: 'mcq', difficulty: 3, prompt: 'A number bond shows 8 as the whole. One part is 5. What is the other part?', options: ['2','3','4','5'], answer: '3', hint: '5 + ? = 8. Count up from 5.' },
      { id: 'q12', type: 'mcq', difficulty: 3, prompt: 'Lucy baked 8 cookies total. She put 7 on a plate. How many cookies are left?', options: ['0','1','2','3'], answer: '1', hint: '7 + ? = 8.' },
    ],
  },

  // ============ MATH — GRADE 2 ============
  'math-2-place-value-100': {
    id: 'math-2-place-value-100', subject: 'math', grade: '2',
    title: 'Place Value to 1,000', description: 'Understand hundreds, tens, and ones',
    explanation: 'A 3-digit number has hundreds, tens, and ones. 365 = 3 hundreds (300) + 6 tens (60) + 5 ones (5).',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'In 247, what is in the hundreds place?', options: ['2','4','7','24'], answer: '2', hint: 'First digit on the left.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'In 538, what is in the tens place?', options: ['5','3','8','53'], answer: '3', hint: 'Middle digit.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: '4 hundreds + 0 tens + 9 ones = ?', options: ['49','409','490','940'], answer: '409', hint: '400 + 0 + 9.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Which is the same as 6 hundreds + 5 tens + 2 ones?', options: ['265','562','625','652'], answer: '652', hint: '600 + 50 + 2.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'How many tens are in 80?', options: ['0','8','18','80'], answer: '8', hint: 'Count by 10s: 10, 20, … 80.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Which is bigger: 432 or 423?', options: ['432','423'], answer: '432', hint: 'Compare the tens place.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'What is 100 more than 348?', options: ['349','358','438','448'], answer: '448', hint: 'Add 1 to the hundreds digit.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'What is 10 less than 526?', options: ['416','516','525','536'], answer: '516', hint: 'Subtract 1 from the tens digit.' },
    ],
  },
  'math-2-add-subtract-100': {
    id: 'math-2-add-subtract-100', subject: 'math', grade: '2',
    title: 'Add & Subtract within 100', description: 'Two-digit math with regrouping',
    explanation: 'Line up the tens and ones. Add ones first, then tens. If ones add to more than 9, carry a ten.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: '20 + 30 = ?', options: ['40','50','60','70'], answer: '50', hint: '2 tens + 3 tens.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: '45 + 10 = ?', options: ['46','54','55','65'], answer: '55', hint: 'Add 1 to the tens place.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: '36 + 25 = ?', options: ['51','61','62','71'], answer: '61', hint: '6 + 5 = 11. Carry the 1.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: '70 − 30 = ?', options: ['30','40','50','60'], answer: '40', hint: '7 tens − 3 tens.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: '54 − 18 = ?', options: ['34','35','36','46'], answer: '36', hint: 'Borrow from the tens place.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Mia read 28 pages on Monday and 35 on Tuesday. How many pages total?', options: ['53','62','63','73'], answer: '63', hint: '28 + 35.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'There were 82 cookies. 47 were eaten. How many left?', options: ['25','35','45','47'], answer: '35', hint: '82 − 47.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Which is closest to 50? 48, 41, 56, or 64?', options: ['48','41','56','64'], answer: '48', hint: 'Find the smallest difference from 50.' },
    ],
  },
  'math-2-time-money': {
    id: 'math-2-time-money', subject: 'math', grade: '2',
    title: 'Time & Money', description: 'Read clocks and count coins',
    explanation: 'Clocks: short hand = hours, long hand = minutes. Coins: penny=1¢, nickel=5¢, dime=10¢, quarter=25¢.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'How many cents is a dime worth?', options: ['1¢','5¢','10¢','25¢'], answer: '10¢', hint: 'A dime is small but worth more than a nickel.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'How many cents is a quarter worth?', options: ['10¢','15¢','25¢','50¢'], answer: '25¢', hint: 'A "quarter" of a dollar.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'How many minutes are in an hour?', options: ['30','45','60','100'], answer: '60', hint: 'A full circle around the clock.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'A nickel + a dime = ?', options: ['10¢','15¢','20¢','25¢'], answer: '15¢', hint: '5 + 10.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: '2 quarters = ?', options: ['25¢','50¢','75¢','$1'], answer: '50¢', hint: '25 + 25.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'How many quarters make $1.00?', options: ['2','3','4','5'], answer: '4', hint: '4 × 25¢ = 100¢.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: '3 dimes and 2 nickels = ?', options: ['25¢','30¢','40¢','50¢'], answer: '40¢', hint: '30¢ + 10¢.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'If it is 3:00 now, what time will it be in 2 hours?', options: ['4:00','5:00','6:00','3:30'], answer: '5:00', hint: 'Add 2 to the hour.' },
    ],
  },

  // ============ MATH — GRADE 3 ============
  'math-3-multiplication': {
    id: 'math-3-multiplication', subject: 'math', grade: '3',
    title: 'Multiplication Facts', description: 'Master multiplication tables 1–10',
    explanation: 'Multiplication is repeated addition. 4 × 3 means "4 groups of 3" or 3 + 3 + 3 + 3 = 12.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: '3 × 4 = ?', options: ['7','10','12','15'], answer: '12', hint: 'Three groups of 4: 4 + 4 + 4.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: '5 × 6 = ?', options: ['25','30','35','40'], answer: '30', hint: 'Count by 5s six times.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: '2 × 9 = ?', options: ['11','16','18','20'], answer: '18', hint: 'Doubles of 9.' },
      { id: 'q4', type: 'mcq', difficulty: 1, prompt: '4 × 5 = ?', options: ['15','20','25','30'], answer: '20', hint: '4 groups of 5.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: '7 × 8 = ?', options: ['54','56','58','64'], answer: '56', hint: 'A classic! 7 × 8 = 56.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: '9 × 6 = ?', options: ['45','48','54','56'], answer: '54', hint: 'Try 10 × 6 = 60, then subtract 6.' },
      { id: 'q7', type: 'mcq', difficulty: 2, prompt: '6 × 7 = ?', options: ['36','42','48','49'], answer: '42', hint: '6 × 7 = 42.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'A box holds 8 pencils. How many in 7 boxes?', options: ['49','54','56','64'], answer: '56', hint: 'Multiply 8 × 7.' },
      { id: 'q9', type: 'mcq', difficulty: 3, prompt: '12 × 4 = ?', options: ['44','46','48','52'], answer: '48', hint: 'Break it: 10 × 4 = 40, plus 2 × 4 = 8.' },
      { id: 'q10', type: 'mcq', difficulty: 3, prompt: 'Liam has 6 bags with 9 marbles each. How many marbles?', options: ['45','54','56','63'], answer: '54', hint: '6 × 9.' },
    ],
  },
  'math-3-division': {
    id: 'math-3-division', subject: 'math', grade: '3',
    title: 'Division Basics', description: 'Share equally and find how many in each group',
    explanation: 'Division splits into equal groups. 12 ÷ 3 means "split 12 into 3 equal groups" — each group has 4.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: '10 ÷ 2 = ?', options: ['3','4','5','6'], answer: '5', hint: 'Half of 10.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: '12 ÷ 4 = ?', options: ['2','3','4','6'], answer: '3', hint: '4 × ? = 12.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: '15 ÷ 5 = ?', options: ['2','3','4','5'], answer: '3', hint: '5 × ? = 15.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: '24 ÷ 6 = ?', options: ['3','4','5','6'], answer: '4', hint: '6 × 4 = 24.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: '36 ÷ 9 = ?', options: ['3','4','5','6'], answer: '4', hint: '9 × 4 = 36.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: '21 ÷ 3 = ?', options: ['6','7','8','9'], answer: '7', hint: '3 × 7 = 21.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: '20 cookies shared equally among 4 kids. Each gets:', options: ['4','5','6','8'], answer: '5', hint: '20 ÷ 4.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'A teacher splits 32 students into 4 equal teams. Team size?', options: ['6','7','8','9'], answer: '8', hint: '32 ÷ 4.' },
      { id: 'q9', type: 'mcq', difficulty: 3, prompt: '56 ÷ 8 = ?', options: ['6','7','8','9'], answer: '7', hint: '8 × 7 = 56.' },
    ],
  },
  'math-3-fractions-intro': {
    id: 'math-3-fractions-intro', subject: 'math', grade: '3',
    title: 'Intro to Fractions', description: 'Understand parts of a whole',
    explanation: 'A fraction has two parts. The bottom (denominator) is the total parts. The top (numerator) is how many we have. 1/4 means 1 part out of 4.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'In 3/4, what is the numerator?', options: ['3','4','7','12'], answer: '3', hint: 'Numerator is on top.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'In 2/5, what is the denominator?', options: ['2','5','7','10'], answer: '5', hint: 'Denominator is on the bottom.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'A pizza is cut into 8 equal pieces. Each piece is what fraction?', options: ['1/4','1/6','1/8','1/10'], answer: '1/8', hint: '1 piece out of 8.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Which fraction is bigger: 1/2 or 1/4?', options: ['1/2','1/4'], answer: '1/2', hint: 'Bigger denominators = smaller pieces.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Which fraction equals one whole?', options: ['1/2','3/3','2/4','5/8'], answer: '3/3', hint: 'Top and bottom are the same.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'You eat 2 of 6 cookies. What fraction did you eat?', options: ['1/6','2/6','4/6','6/6'], answer: '2/6', hint: '2 out of 6.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Which is the SMALLEST? 1/3, 1/5, or 1/8?', options: ['1/3','1/5','1/8'], answer: '1/8', hint: 'Bigger denominator = smaller piece.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: '1/2 is the same as:', options: ['1/4','2/4','3/4','4/4'], answer: '2/4', hint: 'Half of 4 is 2.' },
    ],
  },
  'math-5-fractions': {
    id: 'math-5-fractions', subject: 'math', grade: '5',
    title: 'Adding Fractions', description: 'Add fractions with like and unlike denominators',
    explanation: 'To add fractions, the denominators (bottom numbers) must be the same. If they\'re different, find a common denominator first.',
    questions: [
      { id: 'q1', type: 'fill', difficulty: 1, prompt: '1/4 + 2/4 = ? (write as a fraction like 3/4)', answer: '3/4', hint: 'Same denominator: just add the tops.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: '1/2 + 1/4 = ?', options: ['2/6','3/4','2/4','1/4'], answer: '3/4', hint: 'Convert 1/2 to 2/4 first.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: '2/3 + 1/6 = ?', options: ['3/9','5/6','3/6','4/6'], answer: '5/6', hint: '2/3 equals 4/6. Then add 1/6.' },
      { id: 'q4', type: 'fill', difficulty: 3, prompt: '1/3 + 1/4 = ? (use a/b form, like 7/12)', answer: '7/12', hint: 'Common denominator is 12. 1/3 = 4/12, 1/4 = 3/12.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: '3/5 + 1/2 = ?', options: ['4/7','11/10','11/10','1 1/10'], answer: '11/10', hint: 'Common denominator: 10. 6/10 + 5/10.' },
    ],
  },

  // ============ ELA — KINDERGARTEN ============
  'ela-k-letters': {
    id: 'ela-k-letters', subject: 'ela', grade: 'k',
    title: 'Letter Sounds', description: 'Match letters to the sounds they make',
    explanation: 'Every letter makes a special sound. The letter B says "buh" like in "ball" or "banana".',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Which word starts with the letter B?', options: ['Cat','Ball','Sun','Tree'], answer: 'Ball', hint: 'Listen for the "buh" sound.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Which word starts with the letter S?', options: ['Dog','Apple','Sun','Fish'], answer: 'Sun', hint: 'Listen for the "sss" sound.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Which word starts with the letter D?', options: ['Cat','Dog','Sun','Tree'], answer: 'Dog', hint: 'Listen for "duh".' },
      { id: 'q4', type: 'mcq', difficulty: 1, prompt: 'Which word starts with M?', options: ['Cat','Moon','Pig','Hen'], answer: 'Moon', hint: 'M makes the "mmm" sound.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'What letter does "Tiger" start with?', options: ['T','D','P','G'], answer: 'T', hint: 'Tiger… tuh, tuh, T!' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'What letter does "Apple" start with?', options: ['B','A','E','O'], answer: 'A', hint: 'Apple starts with the "aa" sound.' },
      { id: 'q7', type: 'mcq', difficulty: 2, prompt: 'What letter does "Lion" start with?', options: ['I','N','L','R'], answer: 'L', hint: 'Lion makes a "luh" sound at the start.' },
      { id: 'q8', type: 'mcq', difficulty: 2, prompt: 'What letter does "Fish" start with?', options: ['F','S','H','I'], answer: 'F', hint: '"Fff…ish".' },
      { id: 'q9', type: 'mcq', difficulty: 3, prompt: 'Which two words start with the same letter?', options: ['Frog & Fish','Dog & Cat','Sun & Moon','Tree & Apple'], answer: 'Frog & Fish', hint: 'Both start with the "fff" sound.' },
      { id: 'q10', type: 'mcq', difficulty: 3, prompt: 'Which word has the letter E in the MIDDLE?', options: ['Apple','Bed','Sun','Fox'], answer: 'Bed', hint: 'B-E-D.' },
    ],
  },
  'ela-k-sight-words': {
    id: 'ela-k-sight-words', subject: 'ela', grade: 'k',
    title: 'Sight Words', description: 'Common words to recognize at a glance',
    explanation: 'Sight words are words we see all the time. Words like "the", "and", "is" appear in almost every book!',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Which is a sight word?', options: ['Elephant','The','Banana','Refrigerator'], answer: 'The', hint: 'A short, common word.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Fill in: "I ___ happy."', options: ['am','an','at','as'], answer: 'am', hint: 'I AM happy.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Fill in: "The cat ___ here."', options: ['is','it','if','in'], answer: 'is', hint: 'The cat IS here.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Fill in: "I see ___ dog."', options: ['a','an','of','to'], answer: 'a', hint: 'Use "a" before "dog".' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Fill in: "He ___ go to school."', options: ['can','cap','car','cat'], answer: 'can', hint: 'He IS ABLE to go.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Fill in: "We are happy ___ play."', options: ['to','too','two','tip'], answer: 'to', hint: 'Happy TO play.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Fill in: "I have ___ apples."', options: ['two','too','to','tow'], answer: 'two', hint: 'A number word.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Which word means more than one?', options: ['He','She','They','It'], answer: 'They', hint: '"They" is for groups.' },
    ],
  },
  'ela-k-beginning-sounds': {
    id: 'ela-k-beginning-sounds', subject: 'ela', grade: 'k',
    title: 'Beginning Sounds', description: 'Identify the first sound in words',
    explanation: 'Every word has a first sound. Listen carefully when you say a word — what do you hear FIRST?',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'What sound does "Cat" start with?', options: ['/k/','/a/','/t/','/s/'], answer: '/k/', hint: '"Cuh"-at.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'What sound does "Pig" start with?', options: ['/g/','/i/','/p/','/b/'], answer: '/p/', hint: '"Puh"-ig.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Which word starts with the same sound as "Sun"?', options: ['Moon','Snake','Cat','Dog'], answer: 'Snake', hint: 'Both start with "sss".' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Which word starts with the same sound as "Boy"?', options: ['Apple','Banana','Tree','Cat'], answer: 'Banana', hint: 'Both start with "buh".' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Which word starts with the same sound as "Dog"?', options: ['Fish','Duck','Cat','Hen'], answer: 'Duck', hint: 'Both start with "duh".' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Which word does NOT start with /m/?', options: ['Moon','Map','Mom','Cat'], answer: 'Cat', hint: 'Three start with "mmm".' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Which two words have the same beginning sound?', options: ['Hat & Hop','Hat & Cup','Hat & Sun','Cup & Hop'], answer: 'Hat & Hop', hint: 'Both start with /h/.' },
    ],
  },

  // ============ ELA — GRADE 1 ============
  'ela-1-cvc-words': {
    id: 'ela-1-cvc-words', subject: 'ela', grade: '1',
    title: 'Short Vowel Words (CVC)', description: 'Read three-letter words like cat, hop, sun',
    explanation: 'CVC words have a consonant, vowel, consonant. Like CAT (c-a-t) or RUN (r-u-n). The vowel makes a short sound.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Which word has the short "a" sound?', options: ['Cat','Cake','Car','Cup'], answer: 'Cat', hint: 'Short A like in "apple".' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'What is the missing letter? "p_g" (a baby pig)', options: ['a','e','i','o'], answer: 'i', hint: 'P-I-G.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Which word has the short "o" sound?', options: ['Hop','Hope','Home','Hose'], answer: 'Hop', hint: 'Short O like "octopus".' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'What letters make the word? 🌞 (a yellow ball in the sky)', options: ['son','sun','sin','san'], answer: 'sun', hint: 'S-U-N.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Which word rhymes with "bed"?', options: ['Bid','Bad','Red','Rod'], answer: 'Red', hint: 'Both end in "-ed".' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Which word has 3 sounds? c-a-t', options: ['Cake (4 sounds)','Cat (3 sounds)','Car (2 sounds)','Cot (3 sounds)'], answer: 'Cat (3 sounds)', hint: 'C-A-T = 3.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Read: "The big dog ran." How many CVC words?', options: ['1','2','3','4'], answer: '3', hint: 'Big, dog, ran — all 3 letters with short vowels.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Change the "a" in "cat" to "u". What word do you make?', options: ['Cat','Cot','Cup','Cut'], answer: 'Cut', hint: 'C-U-T.' },
    ],
  },
  'ela-1-sentences': {
    id: 'ela-1-sentences', subject: 'ela', grade: '1',
    title: 'Building Sentences', description: 'Capital letters, punctuation, and word order',
    explanation: 'A sentence starts with a capital letter and ends with a period (.), question mark (?), or exclamation point (!).',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Which is a complete sentence?', options: ['Big dog','The dog runs.','Runs fast','Happy'], answer: 'The dog runs.', hint: 'It tells a complete idea.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'What goes at the END of this sentence: "I see a cat"', options: ['?','!','.',','], answer: '.', hint: 'A telling sentence ends with a period.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Which letter should be CAPITAL? "the boy ran fast."', options: ['the','boy','ran','fast'], answer: 'the', hint: 'First word of every sentence.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'What goes at the end of: "Where is my hat"', options: ['.','?','!',','], answer: '?', hint: 'It is a question.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'What goes at the end of: "I am so happy"', options: ['.','?','!',','], answer: '!', hint: 'It shows strong feeling.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Which is correct?', options: ['the cat is fat.','The cat is fat.','The Cat Is Fat.','The cat is fat'], answer: 'The cat is fat.', hint: 'Capital first word, period at end.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Put in order: "fast / runs / The / dog"', options: ['Fast runs the dog.','The dog runs fast.','Runs the dog fast.','Dog the runs fast.'], answer: 'The dog runs fast.', hint: 'Who? What? How?' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Which sentence is a QUESTION?', options: ['I love pizza.','Do you like pizza?','Pizza is fun!','Eat the pizza.'], answer: 'Do you like pizza?', hint: 'Ends with a question mark.' },
    ],
  },
  'ela-1-word-families': {
    id: 'ela-1-word-families', subject: 'ela', grade: '1',
    title: 'Word Families', description: 'Words that share a common ending',
    explanation: 'Word families share a sound. The "-at" family includes cat, hat, bat, rat. They all rhyme!',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Which word is in the "-at" family?', options: ['Bat','Big','Bus','Boy'], answer: 'Bat', hint: 'Look for "-at" at the end.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Which word is in the "-an" family?', options: ['Pin','Pan','Pet','Pot'], answer: 'Pan', hint: 'Ends in "-an".' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Which word is in the "-op" family?', options: ['Mop','Map','Mat','Mug'], answer: 'Mop', hint: 'Ends in "-op".' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Which word does NOT belong with cat, hat, bat?', options: ['Mat','Sat','Rat','Run'], answer: 'Run', hint: 'Three end in "-at".' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Which word does NOT belong with bug, hug, mug?', options: ['Rug','Tug','Bag','Jug'], answer: 'Bag', hint: 'Three end in "-ug".' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Add the letter to make a word: "_at" (a flying mammal)', options: ['B','D','F','H'], answer: 'B', hint: 'Bat flies at night.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Which two are in the SAME word family?', options: ['Ring & King','Ring & Bag','King & Cup','Bag & Cup'], answer: 'Ring & King', hint: 'Both end in "-ing".' },
    ],
  },

  // ============ ELA — GRADE 2 ============
  'ela-2-grammar': {
    id: 'ela-2-grammar', subject: 'ela', grade: '2',
    title: 'Nouns and Verbs', description: 'Identify nouns (things) and verbs (actions)',
    explanation: 'A noun is a person, place, or thing (like "dog" or "school"). A verb is an action word (like "run" or "jump").',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Which word is a noun?', options: ['Run','Jump','Cat','Quickly'], answer: 'Cat', hint: 'A noun names a person, place, or thing.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Which word is a verb?', options: ['Tree','Sing','Happy','Blue'], answer: 'Sing', hint: 'A verb is something you DO.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Which is a noun?', options: ['Eat','School','Slow','Run'], answer: 'School', hint: 'A place is a noun.' },
      { id: 'q4', type: 'mcq', difficulty: 1, prompt: 'Which is a verb?', options: ['Park','Book','Read','Pencil'], answer: 'Read', hint: 'You can DO it.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'In "The dog barks", what is the verb?', options: ['The','dog','barks','None'], answer: 'barks', hint: 'What is the dog doing?' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'In "Sara reads books", what is the noun?', options: ['Sara only','books only','reads','Both Sara and books'], answer: 'Both Sara and books', hint: 'Sara is a person, books are things.' },
      { id: 'q7', type: 'mcq', difficulty: 2, prompt: 'In "The bird flies", what is the noun?', options: ['The','bird','flies','None'], answer: 'bird', hint: 'A bird is a thing.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Which sentence has both a noun and a verb?', options: ['Very fast','The bird flies','Big and red','Slowly'], answer: 'The bird flies', hint: 'Look for a thing AND an action.' },
      { id: 'q9', type: 'mcq', difficulty: 3, prompt: 'Pick the verb in: "The boy kicks the ball."', options: ['boy','kicks','ball','the'], answer: 'kicks', hint: 'What is the boy doing?' },
      { id: 'q10', type: 'mcq', difficulty: 3, prompt: 'How many nouns: "The cat chased the mouse"?', options: ['0','1','2','3'], answer: '2', hint: 'Cat and mouse — both things.' },
    ],
  },
  'ela-2-plurals': {
    id: 'ela-2-plurals', subject: 'ela', grade: '2',
    title: 'Singular & Plural', description: 'One thing vs. many',
    explanation: 'Singular means ONE. Plural means MORE than one. Most plurals add -s (cat → cats) or -es (box → boxes).',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Which is plural (more than one)?', options: ['Cat','Cats','Dog','Bird'], answer: 'Cats', hint: 'It ends in -s.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'What is the plural of "dog"?', options: ['Dog','Dogs','Doges','Dogges'], answer: 'Dogs', hint: 'Just add -s.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Which is singular (just one)?', options: ['Apples','Apple','Birds','Trees'], answer: 'Apple', hint: 'No -s at the end.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'What is the plural of "box"?', options: ['Boxs','Boxes','Box','Boxxes'], answer: 'Boxes', hint: 'Words ending in -x add -es.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'What is the plural of "bus"?', options: ['Buss','Bus','Buses','Busies'], answer: 'Buses', hint: 'Add -es to words ending in -s.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'What is the plural of "child"?', options: ['Childs','Children','Childes','Child'], answer: 'Children', hint: 'It changes completely!' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'What is the plural of "mouse"?', options: ['Mouses','Mices','Mice','Mousies'], answer: 'Mice', hint: 'Mouse changes to mice.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'What is the plural of "foot"?', options: ['Foots','Feet','Footes','Foots'], answer: 'Feet', hint: 'Special: foot → feet.' },
    ],
  },
  'ela-2-reading-basic': {
    id: 'ela-2-reading-basic', subject: 'ela', grade: '2',
    title: 'Reading Stories', description: 'Understand short passages',
    explanation: 'When you read, look for WHO is in the story, WHERE it happens, and WHAT they do.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Read: "Mia rode her bike to the park." Where did Mia go?', options: ['School','Park','Store','Home'], answer: 'Park', hint: 'Look at the last word.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Read: "Tom likes red apples." What does Tom like?', options: ['Green apples','Red apples','Bananas','Oranges'], answer: 'Red apples', hint: 'Look for the color word.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Read: "Lily played in the snow with her dog. They built a snowman." What did they build?', options: ['A house','A snowman','A fort','A castle'], answer: 'A snowman', hint: 'Read the second sentence.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Read: "Ben felt happy when he found his lost toy." How did Ben feel?', options: ['Sad','Angry','Happy','Tired'], answer: 'Happy', hint: 'The feeling word is right there.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Read: "It was raining, so Sam wore his boots." Why did Sam wear boots?', options: ['It was cold','It was raining','It was sunny','He wanted to'], answer: 'It was raining', hint: 'The word "so" gives the reason.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Read: "The puppy was tired after playing all day. He fell asleep on the rug." Where did the puppy sleep?', options: ['On a bed','Outside','On the rug','In a box'], answer: 'On the rug', hint: 'The last sentence tells you.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Read: "Kate wanted ice cream, but the store was closed." Did Kate get ice cream?', options: ['Yes','No','We don\'t know','Maybe'], answer: 'No', hint: 'The store was closed!' },
    ],
  },

  // ============ ELA — GRADE 3 ============
  'ela-3-vocabulary': {
    id: 'ela-3-vocabulary', subject: 'ela', grade: '3',
    title: 'Synonyms & Antonyms', description: 'Words that mean the same or opposite',
    explanation: 'Synonyms have similar meanings (happy/joyful). Antonyms have opposite meanings (hot/cold).',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Which word means the SAME as "big"?', options: ['Tiny','Large','Slow','Cold'], answer: 'Large', hint: 'Look for a similar meaning.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'What is the OPPOSITE of "hot"?', options: ['Warm','Cold','Sunny','Spicy'], answer: 'Cold', hint: 'Think weather opposites.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'A synonym for "happy" is:', options: ['Sad','Angry','Joyful','Tired'], answer: 'Joyful', hint: 'A word that means the same as happy.' },
      { id: 'q4', type: 'mcq', difficulty: 1, prompt: 'An antonym for "fast" is:', options: ['Quick','Slow','Run','Move'], answer: 'Slow', hint: 'Opposite of fast.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Which word means the SAME as "small"?', options: ['Big','Tiny','Tall','Wide'], answer: 'Tiny', hint: 'Both mean little.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'An antonym for "brave" is:', options: ['Bold','Fearful','Strong','Kind'], answer: 'Fearful', hint: 'Opposite of courageous.' },
      { id: 'q7', type: 'mcq', difficulty: 2, prompt: 'Which is a synonym for "shout"?', options: ['Whisper','Yell','Cry','Sit'], answer: 'Yell', hint: 'Both mean loud talking.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Which pair are antonyms?', options: ['Tiny & Small','Ancient & Modern','Quick & Fast','Begin & Start'], answer: 'Ancient & Modern', hint: 'Old vs new.' },
      { id: 'q9', type: 'mcq', difficulty: 3, prompt: 'Which pair are SYNONYMS?', options: ['Up & Down','Begin & Start','Hot & Cold','Big & Small'], answer: 'Begin & Start', hint: 'Both mean to start something.' },
      { id: 'q10', type: 'mcq', difficulty: 3, prompt: 'Which word is the OPPOSITE of "ancient"?', options: ['Old','Modern','Tiny','Wise'], answer: 'Modern', hint: 'Old vs new.' },
    ],
  },
  'ela-3-grammar': {
    id: 'ela-3-grammar', subject: 'ela', grade: '3',
    title: 'Adjectives & Adverbs', description: 'Words that describe nouns and verbs',
    explanation: 'Adjectives describe nouns (red ball, big dog). Adverbs describe verbs and often end in -ly (run quickly, sing loudly).',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Which word is an adjective in "The blue sky"?', options: ['The','blue','sky','None'], answer: 'blue', hint: 'It describes the sky.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Which is an adjective?', options: ['Run','Big','Eat','School'], answer: 'Big', hint: 'It describes how something is.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Which word ends like most adverbs?', options: ['Quickly','Quick','Quicker','Quickness'], answer: 'Quickly', hint: 'Adverbs often end in -ly.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'In "She sings loudly", what is the adverb?', options: ['She','sings','loudly','None'], answer: 'loudly', hint: 'It tells HOW she sings.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'In "The fluffy cat sleeps", what is the adjective?', options: ['The','fluffy','cat','sleeps'], answer: 'fluffy', hint: 'It describes the cat.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Which sentence has an adverb?', options: ['The dog ran.','The fast dog ran.','The dog ran quickly.','The big dog.'], answer: 'The dog ran quickly.', hint: 'Look for -ly.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Which word is an adjective in "The tired puppy slept softly"?', options: ['Tired','Slept','Softly','Puppy'], answer: 'Tired', hint: 'It describes the puppy.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Which word is an adverb in "The tired puppy slept softly"?', options: ['Tired','Puppy','Slept','Softly'], answer: 'Softly', hint: 'It describes HOW the puppy slept.' },
    ],
  },
  'ela-3-reading-comprehension': {
    id: 'ela-3-reading-comprehension', subject: 'ela', grade: '3',
    title: 'Reading Comprehension', description: 'Understand main ideas and details',
    explanation: 'The MAIN IDEA is what a story is mostly about. DETAILS are smaller facts that support it.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Read: "Sharks have many teeth. They lose them often. New ones grow back!" What is this about?', options: ['Sharks\' teeth','Where sharks live','What sharks eat','Shark colors'], answer: 'Sharks\' teeth', hint: 'Every sentence is about teeth.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'Read: "Bees live in groups called colonies. They make honey from flower nectar." What do bees make?', options: ['Flowers','Honey','Hives','Bread'], answer: 'Honey', hint: 'Look at the second sentence.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Read: "The library has thousands of books. You can borrow them for free with a library card." What do you need to borrow books?', options: ['Money','A library card','A backpack','Permission'], answer: 'A library card', hint: 'The second sentence tells you.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Read: "Lin loved space. Every night she set up her telescope on the roof and wrote down what she saw." What is Lin\'s hobby?', options: ['Cooking','Reading','Astronomy','Writing songs'], answer: 'Astronomy', hint: 'Telescope = stars and space.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Read: "The cat darted under the porch as thunder rumbled overhead." How did the cat feel?', options: ['Excited','Frightened','Hungry','Sleepy'], answer: 'Frightened', hint: 'Why would a cat hide during thunder?' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Read: "Despite the rain, the team kept practicing." What does this tell us?', options: ['They hate rain','They are dedicated','They forgot umbrellas','They are losing'], answer: 'They are dedicated', hint: 'Practicing in bad weather shows commitment.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Read: "Marco brought his umbrella, even though it was sunny." Why might he have brought it?', options: ['He wanted to share','He thought it might rain later','He likes to carry things','He lost it'], answer: 'He thought it might rain later', hint: 'Umbrellas are for rain.' },
    ],
  },

  // ============ SCIENCE ============
  'science-1-animals': {
    id: 'science-1-animals', subject: 'science', grade: '1',
    title: 'Animal Habitats', description: 'Where different animals live',
    explanation: 'Animals live in different places called habitats. Fish live in water, birds live in trees, and polar bears live where it is cold.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Where does a fish live?', options: ['Tree','Water','Desert','Cave'], answer: 'Water', hint: 'Fish need to swim!' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Where does a polar bear live?', options: ['Jungle','Beach','Arctic (cold places)','Desert'], answer: 'Arctic (cold places)', hint: 'Polar bears love snow and ice.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Which animal lives in a desert?', options: ['Penguin','Camel','Whale','Frog'], answer: 'Camel', hint: 'It can survive without much water.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Which animal lives in trees?', options: ['Shark','Monkey','Crab','Snake (mostly)'], answer: 'Monkey', hint: 'Swings from branch to branch!' },
    ],
  },
  'science-3-plants': {
    id: 'science-3-plants', subject: 'science', grade: '3',
    title: 'Plant Life Cycle', description: 'How plants grow from seed to flower',
    explanation: 'Plants begin as seeds. With water, sunlight, and soil, they sprout, grow, and eventually produce flowers and new seeds.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'What do plants need to grow?', options: ['Only water','Water, sunlight, and soil','Only sunlight','Just air'], answer: 'Water, sunlight, and soil', hint: 'Plants need several things.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'What does a plant start as?', options: ['Flower','Seed','Leaf','Root'], answer: 'Seed', hint: 'You plant it in the ground.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'What do roots do?', options: ['Make food','Take in water','Grow flowers','Make seeds'], answer: 'Take in water', hint: 'They are underground for a reason.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'What part of a plant makes food using sunlight?', options: ['Roots','Stem','Leaves','Petals'], answer: 'Leaves', hint: 'They are usually green.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'What is photosynthesis?', options: ['When plants drink water','When plants make food from sunlight','When seeds break open','When flowers bloom'], answer: 'When plants make food from sunlight', hint: 'Photo means light.' },
    ],
  },
  'science-5-states': {
    id: 'science-5-states', subject: 'science', grade: '5',
    title: 'States of Matter', description: 'Solids, liquids, and gases',
    explanation: 'Matter exists in three main states: solids hold their shape, liquids flow and take the shape of their container, gases spread out to fill any space.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Which is a solid?', options: ['Water','Steam','Ice','Air'], answer: 'Ice', hint: 'It holds its shape.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Which is a gas?', options: ['Rock','Milk','Steam','Wood'], answer: 'Steam', hint: 'It floats up and disappears.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'When water boils, it changes from liquid to:', options: ['Solid','Gas','Plasma','Nothing'], answer: 'Gas', hint: 'You see steam rise up.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'What happens when liquid water freezes?', options: ['Becomes a gas','Becomes a solid','Disappears','Boils'], answer: 'Becomes a solid', hint: 'It turns into ice.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Which property is true for liquids?', options: ['Fixed shape and volume','Takes shape of container, fixed volume','No fixed shape or volume','Always cold'], answer: 'Takes shape of container, fixed volume', hint: 'Pour water into different cups.' },
    ],
  },

  // ============ SOCIAL STUDIES ============
  'social-2-community': {
    id: 'social-2-community', subject: 'social', grade: '2',
    title: 'Community Helpers', description: 'People who help us in our community',
    explanation: 'Community helpers are people whose jobs help everyone. Doctors keep us healthy, firefighters keep us safe, teachers help us learn.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Who helps put out fires?', options: ['Teacher','Firefighter','Doctor','Chef'], answer: 'Firefighter', hint: 'They use water and big trucks.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Who helps you when you are sick?', options: ['Police','Doctor','Mail carrier','Farmer'], answer: 'Doctor', hint: 'They work in a hospital or clinic.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Who delivers letters and packages?', options: ['Chef','Mail carrier','Pilot','Builder'], answer: 'Mail carrier', hint: 'They wear a uniform and carry a bag.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Where would you find a librarian?', options: ['Bakery','Library','Hospital','Park'], answer: 'Library', hint: 'They help you find books.' },
    ],
  },
  'social-4-geography': {
    id: 'social-4-geography', subject: 'social', grade: '4',
    title: 'World Geography', description: 'Continents, oceans, and major landmarks',
    explanation: 'Earth has 7 continents and 5 oceans. Each continent has unique countries, cultures, and landmarks.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'How many continents are there?', options: ['5','6','7','8'], answer: '7', hint: 'Africa, Antarctica, Asia, Australia, Europe, North America, South America.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Which is the largest ocean?', options: ['Atlantic','Indian','Pacific','Arctic'], answer: 'Pacific', hint: 'It covers a third of Earth.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Which continent has the Sahara Desert?', options: ['Asia','Africa','Australia','South America'], answer: 'Africa', hint: 'A huge desert in the north.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Where is the Amazon Rainforest?', options: ['Africa','Asia','South America','Europe'], answer: 'South America', hint: 'Mostly in Brazil.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Which is the longest river in the world?', options: ['Amazon','Nile','Mississippi','Yangtze'], answer: 'Nile', hint: 'It flows through Egypt.' },
    ],
  },

  // ============ MATH — GRADE 4 ============
  'math-4-fractions': {
    id: 'math-4-fractions', subject: 'math', grade: '4',
    title: 'Fractions & Decimals', description: 'Compare, order, and convert fractions and decimals',
    explanation: 'A fraction like 3/4 means 3 parts out of 4. Decimals like 0.75 represent the same value. To compare fractions, find a common denominator or convert to decimals.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Which fraction is equivalent to 2/4?', options: ['1/2','1/4','3/4','2/3'], answer: '1/2', hint: 'Divide both top and bottom by 2.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'What decimal equals 1/2?', options: ['0.25','0.5','0.75','1.0'], answer: '0.5', hint: '1 divided by 2.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Which is greater: 3/4 or 1/2?', options: ['3/4','1/2'], answer: '3/4', hint: 'Compare with a common denominator of 4.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: '1/4 + 2/4 = ?', options: ['1/4','2/4','3/4','4/4'], answer: '3/4', hint: 'Add numerators; keep denominator.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'What is 3/5 as a decimal?', options: ['0.3','0.35','0.6','0.65'], answer: '0.6', hint: '3 ÷ 5.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Order from least to greatest: 1/4, 1/2, 1/3', options: ['1/4, 1/3, 1/2','1/2, 1/3, 1/4','1/3, 1/2, 1/4','1/4, 1/2, 1/3'], answer: '1/4, 1/3, 1/2', hint: 'Convert to decimals: 0.25, 0.33, 0.5.' },
      { id: 'q7', type: 'mcq', difficulty: 2, prompt: '5/8 − 3/8 = ?', options: ['1/4','1/8','2/8','3/8'], answer: '2/8', hint: 'Subtract numerators; keep denominator.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Which is equivalent to 0.75?', options: ['1/2','2/3','3/4','4/5'], answer: '3/4', hint: '0.75 = 75/100 = 3/4.' },
      { id: 'q9', type: 'mcq', difficulty: 3, prompt: 'A recipe uses 2/3 cup sugar. Doubled, you need:', options: ['1 cup','4/3 cups','1 1/3 cups','2 cups'], answer: '4/3 cups', hint: '2 × 2/3 = 4/3.' },
      { id: 'q10', type: 'mcq', difficulty: 3, prompt: 'Which is larger: 0.6 or 5/9?', options: ['0.6','5/9'], answer: '0.6', hint: '5/9 ≈ 0.556, which is less than 0.6.' },
    ],
  },
  'math-4-multiplication': {
    id: 'math-4-multiplication', subject: 'math', grade: '4',
    title: 'Multi-Digit Multiplication', description: 'Multiply 2- and 3-digit numbers using place value',
    explanation: 'To multiply multi-digit numbers, break them into parts. 23 × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92. This is the distributive property.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: '12 × 4 = ?', options: ['44','48','52','56'], answer: '48', hint: '10 × 4 = 40, plus 2 × 4 = 8.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: '25 × 3 = ?', options: ['60','65','75','85'], answer: '75', hint: '25 + 25 + 25.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: '14 × 5 = ?', options: ['60','65','70','75'], answer: '70', hint: '10 × 5 = 50, plus 4 × 5 = 20.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: '36 × 7 = ?', options: ['242','252','256','266'], answer: '252', hint: '30 × 7 = 210, plus 6 × 7 = 42.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: '45 × 6 = ?', options: ['240','250','260','270'], answer: '270', hint: '40 × 6 + 5 × 6.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: '23 × 15 = ?', options: ['285','325','345','365'], answer: '345', hint: '23 × 10 = 230, plus 23 × 5 = 115.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: '124 × 3 = ?', options: ['362','372','382','392'], answer: '372', hint: '100 × 3 + 24 × 3.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'A school orders 48 boxes with 25 crayons each. How many crayons total?', options: ['1,100','1,200','1,300','1,400'], answer: '1,200', hint: '48 × 25.' },
      { id: 'q9', type: 'mcq', difficulty: 3, prompt: '203 × 4 = ?', options: ['802','812','820','832'], answer: '812', hint: '200 × 4 = 800, plus 3 × 4 = 12.' },
    ],
  },
  'math-4-geometry': {
    id: 'math-4-geometry', subject: 'math', grade: '4',
    title: 'Angles & 2D Shapes', description: 'Classify angles and identify polygon properties',
    explanation: 'Angles are measured in degrees. A right angle = 90°, acute angle < 90°, obtuse angle > 90°. The angles in any triangle always sum to 180°.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'A right angle measures:', options: ['45°','60°','90°','180°'], answer: '90°', hint: 'Think of the corner of a square.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'An acute angle is:', options: ['Exactly 90°','Greater than 90°','Less than 90°','Exactly 180°'], answer: 'Less than 90°', hint: '"Acute" means sharp and small.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'How many sides does a pentagon have?', options: ['4','5','6','8'], answer: '5', hint: '"Penta" means five.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'The sum of angles in a triangle equals:', options: ['90°','180°','270°','360°'], answer: '180°', hint: 'A flat straight line is 180°.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'A triangle with all equal sides is:', options: ['Isosceles','Scalene','Equilateral','Right'], answer: 'Equilateral', hint: '"Equi" means equal.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'A quadrilateral with exactly one pair of parallel sides is a:', options: ['Rectangle','Parallelogram','Trapezoid','Rhombus'], answer: 'Trapezoid', hint: 'Only one pair of parallel sides.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'In a triangle, two angles are 60° and 80°. The third angle is:', options: ['30°','40°','50°','60°'], answer: '40°', hint: '180 − 60 − 80 = 40.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'How many degrees are in a full rotation?', options: ['90°','180°','270°','360°'], answer: '360°', hint: 'Think of a full circle.' },
    ],
  },

  // ============ MATH — GRADE 6 ============
  'math-6-ratios': {
    id: 'math-6-ratios', subject: 'math', grade: '6',
    title: 'Ratios & Proportions', description: 'Write ratios, find unit rates, and solve proportions',
    explanation: 'A ratio compares two quantities. A proportion says two ratios are equal. Cross-multiply to solve: a/b = c/d → a×d = b×c.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'What is the ratio of 4 apples to 6 oranges in simplest form?', options: ['4:6','2:3','3:2','1:2'], answer: '2:3', hint: 'Divide both numbers by their GCF (2).' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'A car travels 120 miles in 3 hours. What is the unit rate?', options: ['30 mph','40 mph','50 mph','60 mph'], answer: '40 mph', hint: 'Divide total miles by total hours.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'If 5 notebooks cost $15, how much does 1 notebook cost?', options: ['$2','$3','$4','$5'], answer: '$3', hint: 'Divide total cost by number of items.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Solve the proportion: x/9 = 4/12', options: ['2','3','4','6'], answer: '3', hint: 'Cross-multiply: 12x = 36.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'A recipe uses 2 cups of flour for every 3 cups of sugar. How many cups of flour are needed for 9 cups of sugar?', options: ['4','5','6','7'], answer: '6', hint: 'Set up a proportion: 2/3 = x/9.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Which ratio is equivalent to 3:5?', options: ['6:8','9:15','12:18','15:20'], answer: '9:15', hint: 'Multiply both parts of 3:5 by the same number.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'A store sells 3 shirts for $24. At the same rate, how much do 7 shirts cost?', options: ['$48','$52','$56','$60'], answer: '$56', hint: 'Find the unit rate first: $24 ÷ 3 = $8 per shirt.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'A map has a scale of 1 inch = 50 miles. Two cities are 3.5 inches apart. What is the actual distance?', options: ['125 mi','150 mi','175 mi','200 mi'], answer: '175 mi', hint: 'Multiply 3.5 by 50.' },
    ],
  },
  'math-6-expressions': {
    id: 'math-6-expressions', subject: 'math', grade: '6',
    title: 'Expressions & Equations', description: 'Write, evaluate, and solve algebraic expressions and equations',
    explanation: 'An expression has numbers and variables (like 3x + 2). An equation has an equals sign (3x + 2 = 8). Solve by isolating the variable.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'What is the value of 4x when x = 5?', options: ['9','16','20','25'], answer: '20', hint: 'Substitute x = 5: 4 × 5.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Write an expression: "7 more than a number n"', options: ['7n','n − 7','n + 7','7 − n'], answer: 'n + 7', hint: '"More than" means addition.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Solve: x + 9 = 15', options: ['5','6','7','8'], answer: '6', hint: 'Subtract 9 from both sides.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Solve: 3x = 24', options: ['6','7','8','9'], answer: '8', hint: 'Divide both sides by 3.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Evaluate 2a − b when a = 6 and b = 4', options: ['6','7','8','10'], answer: '8', hint: 'Substitute and compute: 2(6) − 4.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Which expression is equivalent to 3(x + 4)?', options: ['3x + 4','3x + 7','3x + 12','x + 12'], answer: '3x + 12', hint: 'Distribute the 3 to both terms.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Solve: 2x + 5 = 17', options: ['5','6','7','8'], answer: '6', hint: 'Subtract 5 first, then divide by 2.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Write an inequality: "A number y is at least 12"', options: ['y < 12','y > 12','y ≤ 12','y ≥ 12'], answer: 'y ≥ 12', hint: '"At least" means greater than or equal to.' },
    ],
  },
  'math-6-geometry': {
    id: 'math-6-geometry', subject: 'math', grade: '6',
    title: 'Area & Surface Area', description: 'Find area of polygons and surface area of 3D figures',
    explanation: 'Area of a triangle = ½ × base × height. Area of a parallelogram = base × height. Surface area is the sum of all face areas.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'What is the area of a triangle with base 8 cm and height 5 cm?', options: ['13 cm²','20 cm²','30 cm²','40 cm²'], answer: '20 cm²', hint: 'Area = ½ × base × height.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'What is the area of a parallelogram with base 10 m and height 4 m?', options: ['14 m²','20 m²','40 m²','80 m²'], answer: '40 m²', hint: 'Area = base × height.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'A rectangle is 7 in long and 3 in wide. What is its area?', options: ['10 in²','14 in²','21 in²','42 in²'], answer: '21 in²', hint: 'Area = length × width.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'What is the volume of a rectangular prism that is 4 × 3 × 5?', options: ['12','24','60','120'], answer: '60', hint: 'Volume = length × width × height.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'A triangle has an area of 36 cm² and a base of 9 cm. What is its height?', options: ['4 cm','6 cm','8 cm','10 cm'], answer: '8 cm', hint: '36 = ½ × 9 × h → h = 8.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'A cube has side length 4 cm. What is its surface area?', options: ['24 cm²','48 cm²','64 cm²','96 cm²'], answer: '96 cm²', hint: 'A cube has 6 faces. Surface area = 6 × s².' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'A rectangular prism is 5 × 3 × 2. What is its surface area?', options: ['30','31','62','120'], answer: '62', hint: 'SA = 2(lw + lh + wh).' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'What is the area of a trapezoid with bases 6 and 10 and height 4?', options: ['24','32','40','64'], answer: '32', hint: 'Area = ½ × (b₁ + b₂) × h.' },
    ],
  },
  'math-6-statistics': {
    id: 'math-6-statistics', subject: 'math', grade: '6',
    title: 'Statistics', description: 'Analyze data using mean, median, mode, and range',
    explanation: 'Mean = sum ÷ count. Median = middle value. Mode = most frequent. Range = max − min.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Find the mean of: 4, 8, 6, 10, 2', options: ['5','6','7','8'], answer: '6', hint: 'Add all values (30) then divide by 5.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Find the median of: 3, 7, 1, 9, 5', options: ['3','5','7','9'], answer: '5', hint: 'Order the numbers first: 1, 3, 5, 7, 9.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: 'Find the mode of: 2, 4, 4, 6, 8, 4', options: ['2','4','6','8'], answer: '4', hint: 'Mode is the value that appears most often.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Find the range of: 15, 22, 8, 30, 11', options: ['14','19','22','30'], answer: '22', hint: 'Range = max − min = 30 − 8.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'A data set has values 5, 8, 12, 8, 7. What is the mean?', options: ['7','8','8.5','10'], answer: '8', hint: 'Sum = 40, count = 5. Mean = 40 ÷ 5.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Find the median of: 10, 14, 18, 20', options: ['14','16','18','20'], answer: '16', hint: 'Even number of values — average the two middle values.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Which measure of center best represents: 2, 3, 3, 4, 100?', options: ['Mean','Median','Mode','Range'], answer: 'Median', hint: 'Outliers like 100 pull the mean up — median is more representative.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'A student scored 80, 90, 85, and 95 on four tests. What score on the 5th test gives a mean of 88?', options: ['88','90','91','92'], answer: '90', hint: 'Total needed = 88 × 5 = 440. 440 − (80+90+85+95) = 90.' },
    ],
  },
  // ============ MATH — GRADE 7 ============
  'math-7-integers': {
    id: 'math-7-integers', subject: 'math', grade: '7',
    title: 'Integers & Rational Numbers', description: 'Add, subtract, multiply and divide integers and rational numbers',
    explanation: 'Adding a negative is subtracting. Multiplying two negatives gives a positive. Rational numbers include fractions and decimals.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: '−8 + 3 = ?', options: ['−11','−5','5','11'], answer: '−5', hint: 'Start at −8, move 3 to the right.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: '−4 × −5 = ?', options: ['−20','−9','9','20'], answer: '20', hint: 'Negative × Negative = Positive.' },
      { id: 'q3', type: 'mcq', difficulty: 1, prompt: '12 ÷ (−3) = ?', options: ['−9','−4','4','9'], answer: '−4', hint: 'Positive ÷ Negative = Negative.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: '−2.5 + (−1.5) = ?', options: ['−4','−1','1','4'], answer: '−4', hint: 'Both are negative — add and keep the sign.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'What is the absolute value of −17?', options: ['−17','−1','1','17'], answer: '17', hint: 'Absolute value is always the positive distance from 0.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Order from least to greatest: −3, 1, −7, 0', options: ['−3, −7, 0, 1','−7, −3, 0, 1','0, −3, −7, 1','1, 0, −3, −7'], answer: '−7, −3, 0, 1', hint: 'Negative numbers decrease as they get farther from 0.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: '−3 × (4 + (−7)) = ?', options: ['−21','−9','9','21'], answer: '9', hint: 'Solve inside parentheses first: 4 + (−7) = −3. Then −3 × −3 = 9.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Which expression equals −8?', options: ['−3 + 5','3 − 11','2 × 4','−2 × −4'], answer: '3 − 11', hint: '3 − 11 = −8.' },
    ],
  },
  'math-7-proportions': {
    id: 'math-7-proportions', subject: 'math', grade: '7',
    title: 'Proportional Relationships & Percents', description: 'Solve percent problems and identify proportional relationships',
    explanation: 'Percent means "per hundred." To find percent of a number: multiply by the decimal form. Percent change = (change ÷ original) × 100.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'What is 30% of 90?', options: ['18','27','30','63'], answer: '27', hint: 'Multiply 90 × 0.30.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'A shirt costs $40. It is on sale for 25% off. What is the sale price?', options: ['$10','$15','$25','$30'], answer: '$30', hint: '25% of $40 = $10 discount. $40 − $10 = $30.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: '18 is what percent of 72?', options: ['18%','20%','25%','30%'], answer: '25%', hint: '18 ÷ 72 = 0.25 = 25%.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'A price increased from $50 to $65. What is the percent increase?', options: ['15%','20%','25%','30%'], answer: '30%', hint: '(65 − 50) ÷ 50 × 100 = 30%.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Which table shows a proportional relationship? (y = kx)', options: ['x: 1,2,3 / y: 2,5,8','x: 1,2,3 / y: 3,6,9','x: 1,2,3 / y: 1,3,6','x: 1,2,3 / y: 2,3,5'], answer: 'x: 1,2,3 / y: 3,6,9', hint: 'In a proportional relationship, y ÷ x is constant.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Sales tax is 8%. What is the total cost of a $25 item?', options: ['$25.80','$26.00','$27.00','$27.50'], answer: '$27.00', hint: 'Tax = $25 × 0.08 = $2. Total = $25 + $2.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Simple interest: Principal = $800, rate = 5%, time = 3 years. What is the interest earned?', options: ['$40','$80','$120','$160'], answer: '$120', hint: 'I = P × r × t = 800 × 0.05 × 3.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'A population of 200 increases by 15%. What is the new population?', options: ['215','220','230','250'], answer: '230', hint: 'Increase = 200 × 0.15 = 30. New = 200 + 30.' },
    ],
  },
  'math-7-equations': {
    id: 'math-7-equations', subject: 'math', grade: '7',
    title: 'Equations & Inequalities', description: 'Solve two-step equations and graph inequalities',
    explanation: 'To solve a two-step equation, undo operations in reverse order (PEMDAS backwards). For inequalities, flip the sign when multiplying/dividing by a negative.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Solve: 2x + 3 = 11', options: ['3','4','5','6'], answer: '4', hint: 'Subtract 3 first, then divide by 2.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Solve: x/3 − 2 = 4', options: ['6','12','18','24'], answer: '18', hint: 'Add 2 first, then multiply by 3.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Solve: 5x − 7 = 18', options: ['3','4','5','6'], answer: '5', hint: 'Add 7 to both sides, then divide by 5.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Solve the inequality: x + 4 > 10', options: ['x > 6','x > 14','x < 6','x < 14'], answer: 'x > 6', hint: 'Subtract 4 from both sides.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Solve: −3x ≥ 12', options: ['x ≥ −4','x ≤ −4','x ≥ 4','x ≤ 4'], answer: 'x ≤ −4', hint: 'Divide by −3 and flip the inequality sign.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'A number is tripled and then decreased by 5. The result is 16. What is the number?', options: ['5','6','7','8'], answer: '7', hint: '3x − 5 = 16 → 3x = 21 → x = 7.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Solve: 4(x − 2) = 20', options: ['5','6','7','8'], answer: '7', hint: 'Divide by 4 first: x − 2 = 5, then x = 7.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Solve: 2x + 5 = 3x − 1', options: ['4','5','6','7'], answer: '6', hint: 'Get x on one side: 2x − 3x = −1 − 5 → −x = −6.' },
    ],
  },
  'math-7-geometry': {
    id: 'math-7-geometry', subject: 'math', grade: '7',
    title: 'Geometry — Circles & Angles', description: 'Find circumference, area of circles, and solve angle problems',
    explanation: 'Circumference = 2πr or πd. Area of circle = πr². Supplementary angles add to 180°. Complementary angles add to 90°.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'What is the circumference of a circle with radius 5? (Use π ≈ 3.14)', options: ['15.7','31.4','78.5','157'], answer: '31.4', hint: 'C = 2πr = 2 × 3.14 × 5.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'What is the area of a circle with radius 4? (Use π ≈ 3.14)', options: ['12.56','25.12','50.24','100.48'], answer: '50.24', hint: 'A = πr² = 3.14 × 16.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Two angles are supplementary. One is 65°. What is the other?', options: ['25°','35°','115°','125°'], answer: '115°', hint: 'Supplementary angles sum to 180°.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Two angles are complementary. One is 38°. What is the other?', options: ['42°','52°','62°','142°'], answer: '52°', hint: 'Complementary angles sum to 90°.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'What is the diameter of a circle with circumference ≈ 62.8? (Use π ≈ 3.14)', options: ['10','20','30','40'], answer: '20', hint: 'C = πd → d = C ÷ π = 62.8 ÷ 3.14.' },
      { id: 'q6', type: 'mcq', difficulty: 2, prompt: 'Two vertical angles are formed. One measures 75°. What does the other measure?', options: ['15°','75°','105°','150°'], answer: '75°', hint: 'Vertical angles are always equal.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'A circle has an area of 78.5 cm². What is its radius? (π ≈ 3.14)', options: ['3','4','5','6'], answer: '5', hint: 'A = πr² → 78.5 = 3.14 × r² → r² = 25.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'A semicircle has a diameter of 12 cm. What is its perimeter? (π ≈ 3.14)', options: ['18.84','30.84','37.68','43.96'], answer: '30.84', hint: 'Perimeter = half circumference + diameter = πr + d.' },
    ],
  },
  // ============ MATH — GRADE 8 ============
  'math-8-perimeter': {
    id: 'math-8-perimeter', subject: 'math', grade: '8',
    title: 'Perimeter', description: 'Calculate perimeter of polygons and solve real-world problems',
    explanation: 'Perimeter is the total distance around a shape. For a rectangle: P = 2(l + w). For a square: P = 4s. For any polygon: add all side lengths.',
    questions: [
      { id: 'q1',  type: 'mcq', difficulty: 1, prompt: 'A rectangle has a length of 12 cm and a width of 5 cm. What is its perimeter?', options: ['17 cm','24 cm','34 cm','60 cm'], answer: '34 cm', hint: 'Add the length and width, then multiply by 2.' },
      { id: 'q2',  type: 'mcq', difficulty: 1, prompt: 'A square has a side length of 9 inches. What is its perimeter?', options: ['18 inches','27 inches','36 inches','81 inches'], answer: '36 inches', hint: 'Multiply the side length by 4.' },
      { id: 'q3',  type: 'mcq', difficulty: 1, prompt: 'A triangle has side lengths of 7 m, 8 m, and 10 m. What is the perimeter?', options: ['15 m','18 m','25 m','56 m'], answer: '25 m', hint: 'Add all three side lengths.' },
      { id: 'q4',  type: 'mcq', difficulty: 2, prompt: 'A rectangle has a perimeter of 48 feet. Its length is 14 feet. What is its width?', options: ['8 feet','10 feet','12 feet','20 feet'], answer: '10 feet', hint: 'Divide the perimeter by 2 first.' },
      { id: 'q5',  type: 'mcq', difficulty: 2, prompt: 'A regular hexagon has a side length of 6 cm. What is its perimeter?', options: ['12 cm','24 cm','36 cm','42 cm'], answer: '36 cm', hint: 'A hexagon has 6 sides.' },
      { id: 'q6',  type: 'mcq', difficulty: 2, prompt: 'The sides of a quadrilateral are 11 cm, 13 cm, 15 cm, and 17 cm. What is the perimeter?', options: ['39 cm','45 cm','56 cm','66 cm'], answer: '56 cm', hint: 'Perimeter means the total distance around the shape.' },
      { id: 'q7',  type: 'mcq', difficulty: 2, prompt: 'A rectangular garden is 18 yards long and 7 yards wide. How many yards of fencing are needed to go around it?', options: ['25 yards','36 yards','50 yards','126 yards'], answer: '50 yards', hint: 'Fencing around a shape means perimeter.' },
      { id: 'q8',  type: 'mcq', difficulty: 2, prompt: 'An equilateral triangle has a perimeter of 45 inches. What is the length of each side?', options: ['12 inches','15 inches','18 inches','20 inches'], answer: '15 inches', hint: 'Equilateral means all sides are equal.' },
      { id: 'q9',  type: 'mcq', difficulty: 3, prompt: 'A rectangle has a length of x + 6 and a width of x + 2. Which expression represents its perimeter?', options: ['2x + 8','4x + 8','4x + 16','x² + 8x + 12'], answer: '4x + 16', hint: 'Add the length and width first, then multiply by 2.' },
      { id: 'q10', type: 'mcq', difficulty: 3, prompt: 'A regular octagon has a perimeter of 96 cm. What is the length of each side?', options: ['8 cm','10 cm','12 cm','14 cm'], answer: '12 cm', hint: 'An octagon has 8 sides.' },
      { id: 'q11', type: 'mcq', difficulty: 3, prompt: 'A rectangle has a width of 9 inches. Its length is twice its width. What is the perimeter?', options: ['27 inches','36 inches','54 inches','81 inches'], answer: '54 inches', hint: 'Find the length first.' },
      { id: 'q12', type: 'mcq', difficulty: 3, prompt: 'A park is shaped like a rectangle with a length of 3x meters and a width of x + 4 meters. Which expression represents the perimeter?', options: ['4x + 4','6x + 8','8x + 8','3x² + 12x'], answer: '8x + 8', hint: 'Combine like terms inside the parentheses first.' },
    ],
  },
  'math-8-functions': {
    id: 'math-8-functions', subject: 'math', grade: '8',
    title: 'Linear Equations & Functions', description: 'Understand slope, y-intercept, and graph linear equations',
    explanation: 'Slope (m) = rise/run = (y₂−y₁)/(x₂−x₁). Slope-intercept form: y = mx + b where m is slope and b is y-intercept.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'What is the slope of a line that goes through (0,0) and (3,6)?', options: ['1','2','3','6'], answer: '2', hint: 'Slope = rise/run = 6/3.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'In y = 3x + 5, what is the y-intercept?', options: ['3','5','8','15'], answer: '5', hint: 'The y-intercept is b in y = mx + b.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'What is the slope of the line y = −2x + 7?', options: ['−7','−2','2','7'], answer: '−2', hint: 'The slope is m in y = mx + b.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Which equation has a slope of 4 and y-intercept of −1?', options: ['y = −x + 4','y = 4x − 1','y = −4x + 1','y = x − 4'], answer: 'y = 4x − 1', hint: 'Use y = mx + b with m = 4 and b = −1.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Find the slope through (2, 5) and (6, 13).', options: ['1','2','3','4'], answer: '2', hint: 'Slope = (13−5)/(6−2) = 8/4.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Which of these is a function?', options: ['A circle','A vertical line','y = x²','x = 4'], answer: 'y = x²', hint: 'A function passes the vertical line test.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Two lines are parallel. Line 1 is y = 3x + 1. What is the slope of Line 2?', options: ['−3','−1/3','1/3','3'], answer: '3', hint: 'Parallel lines have the same slope.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Solve the system: y = 2x + 1 and y = x + 4', options: ['x=1,y=3','x=2,y=5','x=3,y=7','x=4,y=8'], answer: 'x=3,y=7', hint: 'Set 2x + 1 = x + 4 → x = 3.' },
    ],
  },
  'math-8-pythagorean': {
    id: 'math-8-pythagorean', subject: 'math', grade: '8',
    title: 'Pythagorean Theorem', description: 'Apply the Pythagorean theorem to find missing sides and distances',
    explanation: 'In a right triangle: a² + b² = c², where c is the hypotenuse. To find a missing leg: a² = c² − b².',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'A right triangle has legs of 3 and 4. What is the hypotenuse?', options: ['4','5','6','7'], answer: '5', hint: '3² + 4² = 9 + 16 = 25. √25 = 5.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'A right triangle has legs of 5 and 12. What is the hypotenuse?', options: ['13','14','15','17'], answer: '13', hint: '5² + 12² = 25 + 144 = 169. √169 = 13.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'The hypotenuse is 10 and one leg is 6. What is the other leg?', options: ['6','7','8','9'], answer: '8', hint: '6² + b² = 10² → b² = 100 − 36 = 64.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Is a triangle with sides 7, 24, 25 a right triangle?', options: ['Yes','No'], answer: 'Yes', hint: '7² + 24² = 49 + 576 = 625 = 25².' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'A ladder 13 ft long leans against a wall. The base is 5 ft from the wall. How high does it reach?', options: ['8 ft','10 ft','12 ft','14 ft'], answer: '12 ft', hint: '5² + h² = 13² → h² = 169 − 25 = 144.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Find the distance between (1, 2) and (4, 6).', options: ['3','4','5','7'], answer: '5', hint: 'd = √((4−1)² + (6−2)²) = √(9+16) = √25.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'A square has a diagonal of 10. What is its side length? (Round to nearest tenth)', options: ['5.0','6.7','7.1','8.0'], answer: '7.1', hint: 'Diagonal² = s² + s² = 2s². s = √(100/2) ≈ 7.1.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'A right triangle has hypotenuse √50 and one leg 5. Find the other leg.', options: ['3','4','5','6'], answer: '5', hint: '5² + b² = 50 → b² = 25 → b = 5.' },
    ],
  },
  // ============ MATH — GRADE 9 ============
  'math-9-algebra': {
    id: 'math-9-algebra', subject: 'math', grade: '9',
    title: 'Linear Equations & Inequalities', description: 'Solve multi-step equations, absolute value, and compound inequalities',
    explanation: 'Multi-step equations: combine like terms, then isolate the variable. Absolute value equations: |x| = a means x = a or x = −a.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Solve: 3(x − 4) = 15', options: ['5','7','9','11'], answer: '9', hint: 'Divide both sides by 3 first: x − 4 = 5.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Solve: |x| = 8', options: ['x = 8','x = −8','x = 8 or x = −8','x = ±64'], answer: 'x = 8 or x = −8', hint: 'Absolute value equations have two solutions.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Solve: 2x + 3 = 5x − 9', options: ['2','3','4','5'], answer: '4', hint: 'Move all x terms to one side: −3x = −12.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Solve: |2x − 1| = 7', options: ['x = 4 only','x = −3 only','x = 4 or x = −3','x = 3 or x = −4'], answer: 'x = 4 or x = −3', hint: '2x − 1 = 7 OR 2x − 1 = −7.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Solve the compound inequality: 3 < 2x − 1 < 9', options: ['2 < x < 5','1 < x < 4','3 < x < 9','0 < x < 6'], answer: '2 < x < 5', hint: 'Add 1 throughout, then divide by 2.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Solve: (x+2)/3 = (2x−1)/4', options: ['5','8','11','14'], answer: '11', hint: 'Cross multiply: 4(x+2) = 3(2x−1). Solve for x.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'The sum of three consecutive integers is 48. What is the largest integer?', options: ['14','15','16','17'], answer: '17', hint: 'Let them be n, n+1, n+2. Sum = 3n+3 = 48.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Solve for x: ax + b = c', options: ['(c+b)/a','(c−b)/a','a(c−b)','b−c/a'], answer: '(c−b)/a', hint: 'Subtract b from both sides, then divide by a.' },
    ],
  },
  'math-9-quadratics': {
    id: 'math-9-quadratics', subject: 'math', grade: '9',
    title: 'Quadratic Equations', description: 'Factor, complete the square, and use the quadratic formula',
    explanation: 'Quadratic formula: x = (−b ± √(b²−4ac)) / 2a. The discriminant b²−4ac tells you the number of real solutions.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Factor: x² + 5x + 6', options: ['(x+1)(x+6)','(x+2)(x+3)','(x+3)(x+4)','(x+1)(x+5)'], answer: '(x+2)(x+3)', hint: 'Find two numbers that multiply to 6 and add to 5.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Solve: x² = 25', options: ['x = 5','x = −5','x = ±5','x = ±25'], answer: 'x = ±5', hint: 'Take the square root of both sides.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Factor: x² − 9', options: ['(x−3)²','(x+3)(x−3)','(x−9)(x+1)','(x−3)(x+9)'], answer: '(x+3)(x−3)', hint: 'This is a difference of squares: a² − b² = (a+b)(a−b).' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Solve: x² + 3x − 10 = 0', options: ['x = 2 or x = −5','x = −2 or x = 5','x = 1 or x = −10','x = 5 or x = −2'], answer: 'x = 2 or x = −5', hint: 'Factor into (x+5)(x−2) = 0.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Use the quadratic formula for x² + 2x − 8 = 0', options: ['x = 2 or x = −4','x = −2 or x = 4','x = 4 or x = 8','x = −4 or x = −2'], answer: 'x = 2 or x = −4', hint: 'a=1, b=2, c=−8. Discriminant = 4+32 = 36.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'What is the vertex of y = x² − 4x + 1?', options: ['(2, −3)','(−2, 13)','(4, 1)','(2, 3)'], answer: '(2, −3)', hint: 'x-vertex = −b/2a = 4/2 = 2. y = 4 − 8 + 1 = −3.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'How many real solutions does x² + 4x + 5 = 0 have?', options: ['0','1','2','Infinite'], answer: '0', hint: 'Discriminant = 16 − 20 = −4. Negative means no real solutions.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Factor: 2x² + 7x + 3', options: ['(2x+1)(x+3)','(2x+3)(x+1)','(x+3)(2x+1)','(2x−1)(x+3)'], answer: '(2x+1)(x+3)', hint: 'Find factors of 6 that add to 7 when using the AC method.' },
    ],
  },
  'math-9-systems': {
    id: 'math-9-systems', subject: 'math', grade: '9',
    title: 'Systems of Equations', description: 'Solve systems by substitution and elimination',
    explanation: 'Substitution: solve for one variable, plug into the other equation. Elimination: add or subtract equations to cancel a variable.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Solve by substitution: y = 2x and x + y = 9', options: ['(2,4)','(3,6)','(4,8)','(5,10)'], answer: '(3,6)', hint: 'Substitute y = 2x into x + y = 9.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'Solve by elimination: x + y = 10 and x − y = 4', options: ['(5,5)','(6,4)','(7,3)','(8,2)'], answer: '(7,3)', hint: 'Add the equations: 2x = 14.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'How many solutions does a system have if the lines are parallel?', options: ['0','1','2','Infinite'], answer: '0', hint: 'Parallel lines never intersect.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Solve: 2x + y = 7 and x − y = 2', options: ['(2,3)','(3,1)','(4,−1)','(5,−3)'], answer: '(3,1)', hint: 'Add equations: 3x = 9. Then find y.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'A total of 30 students are in a class. There are 6 more girls than boys. How many boys are there?', options: ['10','12','14','16'], answer: '12', hint: 'b + g = 30 and g = b + 6. Substitute to get 2b + 6 = 30.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Solve: 3x + 2y = 12 and x + 2y = 8', options: ['(1,4)','(2,3)','(3,2)','(4,0)'], answer: '(2,3)', hint: 'Subtract equations: 2x = 4.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Two numbers have a sum of 20 and a product of 96. What are the numbers?', options: ['8 and 12','6 and 16','9 and 11','7 and 13'], answer: '8 and 12', hint: 'n + m = 20 and n × m = 96. Try 8 × 12 = 96.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'If a system of equations has infinitely many solutions, the lines are:', options: ['Parallel','Perpendicular','Identical','Intersecting once'], answer: 'Identical', hint: 'Infinitely many solutions means the equations represent the same line.' },
    ],
  },
  'math-9-functions': {
    id: 'math-9-functions', subject: 'math', grade: '9',
    title: 'Functions', description: 'Understand function notation, domain, range, and interpret graphs',
    explanation: 'A function maps each input to exactly one output. Domain = set of inputs. Range = set of outputs. f(x) means the function value at x.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'If f(x) = 3x − 2, what is f(4)?', options: ['8','10','12','14'], answer: '10', hint: 'Substitute x = 4: 3(4) − 2 = 10.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Which of these is NOT a function?', options: ['y = x + 1','y = x²','x = 4','y = 2x − 3'], answer: 'x = 4', hint: 'x = 4 is a vertical line — it fails the vertical line test.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Find the domain of f(x) = 1/(x−3)', options: ['All real numbers','x ≠ 3','x > 3','x ≥ 3'], answer: 'x ≠ 3', hint: 'The denominator cannot equal 0.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'If g(x) = x² + 1, what is g(−3)?', options: ['7','8','9','10'], answer: '10', hint: '(−3)² + 1 = 9 + 1 = 10.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'What is the range of f(x) = |x|?', options: ['All real numbers','x ≥ 0','y ≥ 0','y > 0'], answer: 'y ≥ 0', hint: 'Absolute value is never negative.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'If f(x) = 2x + 1 and g(x) = x − 3, what is f(g(5))?', options: ['3','5','7','9'], answer: '5', hint: 'g(5) = 2. Then f(2) = 2(2) + 1 = 5.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'A function is increasing when:', options: ['It goes up from left to right','It goes down from left to right','It forms a U shape','It is a horizontal line'], answer: 'It goes up from left to right', hint: 'Increasing means as x increases, y increases.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'What is the inverse of f(x) = 3x − 6?', options: ['f⁻¹(x) = (x+6)/3','f⁻¹(x) = (x−6)/3','f⁻¹(x) = 3x + 6','f⁻¹(x) = x/3 − 6'], answer: 'f⁻¹(x) = (x+6)/3', hint: 'Replace f(x) with y, swap x and y, then solve for y.' },
    ],
  },
  // ============ MATH — GRADE 10 ============
  'math-10-geometry': {
    id: 'math-10-geometry', subject: 'math', grade: '10',
    title: 'Geometry — Proofs & Properties', description: 'Prove triangle congruence and work with parallel lines',
    explanation: 'Triangle congruence: SSS, SAS, ASA, AAS. Parallel lines cut by a transversal form alternate interior angles (equal) and co-interior angles (supplementary).',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Two triangles are congruent if they have three pairs of equal sides. This is:', options: ['SSS','SAS','ASA','AAS'], answer: 'SSS', hint: 'SSS = Side-Side-Side.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Parallel lines are cut by a transversal. Alternate interior angles are:', options: ['Supplementary','Complementary','Equal','Perpendicular'], answer: 'Equal', hint: 'Alternate interior angles are always equal.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'The sum of interior angles of a triangle is:', options: ['90°','180°','270°','360°'], answer: '180°', hint: 'All triangle angles always add to 180°.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'A polygon has 6 sides. What is the sum of its interior angles?', options: ['540°','600°','720°','900°'], answer: '720°', hint: 'Formula: (n−2) × 180 = (6−2) × 180.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Co-interior angles (same-side interior) formed by parallel lines are:', options: ['Equal','Complementary','Supplementary','Vertical'], answer: 'Supplementary', hint: 'Co-interior angles add up to 180°.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'An exterior angle of a triangle equals:', options: ['The adjacent interior angle','The sum of the two non-adjacent interior angles','180° minus all interior angles','90°'], answer: 'The sum of the two non-adjacent interior angles', hint: 'Exterior Angle Theorem.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Two triangles are congruent by SAS. Which information is needed?', options: ['2 sides only','2 angles only','2 sides and the included angle','2 angles and any side'], answer: '2 sides and the included angle', hint: 'SAS = Side-Angle-Side: the angle is between the two sides.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'A regular polygon has interior angles of 135°. How many sides does it have?', options: ['6','7','8','9'], answer: '8', hint: 'Interior angle = (n−2)×180/n = 135 → n = 8.' },
    ],
  },
  'math-10-trig': {
    id: 'math-10-trig', subject: 'math', grade: '10',
    title: 'Right Triangle Trigonometry', description: 'Use sin, cos, tan to solve right triangles and angle problems',
    explanation: 'SOH-CAH-TOA: sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'In a right triangle, sin(θ) = ?', options: ['adj/hyp','opp/hyp','opp/adj','hyp/opp'], answer: 'opp/hyp', hint: 'SOH: Sin = Opposite/Hypotenuse.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'What is sin(30°)?', options: ['0.5','0.707','0.866','1'], answer: '0.5', hint: 'sin(30°) = 1/2.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'What is cos(60°)?', options: ['0.5','0.707','0.866','1'], answer: '0.5', hint: 'cos(60°) = 1/2.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'In a right triangle, the angle is 45° and the hypotenuse is 10. Find the opposite side.', options: ['5','7.07','8.66','10'], answer: '7.07', hint: 'opposite = hypotenuse × sin(45°) = 10 × 0.707.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'tan(θ) = 1. What is θ?', options: ['30°','45°','60°','90°'], answer: '45°', hint: 'tan(45°) = 1.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'A tree casts a 24 ft shadow. The angle of elevation of the sun is 30°. How tall is the tree?', options: ['8 ft','12 ft','13.9 ft','41.6 ft'], answer: '13.9 ft', hint: 'tan(30°) = height/24 → height = 24 × tan(30°) ≈ 13.9.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'A ladder 20 ft long makes a 60° angle with the ground. How high does it reach on the wall?', options: ['10 ft','13.3 ft','17.3 ft','20 ft'], answer: '17.3 ft', hint: 'height = 20 × sin(60°) = 20 × 0.866.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Which ratio represents cos(θ) in a right triangle?', options: ['opp/hyp','adj/hyp','opp/adj','hyp/adj'], answer: 'adj/hyp', hint: 'CAH: Cos = Adjacent/Hypotenuse.' },
    ],
  },
  'math-10-circles': {
    id: 'math-10-circles', subject: 'math', grade: '10',
    title: 'Circles', description: 'Arc length, sector area, inscribed angles, and equations of circles',
    explanation: 'Arc length = (θ/360) × 2πr. Sector area = (θ/360) × πr². Inscribed angle = ½ × intercepted arc. Circle equation: (x−h)² + (y−k)² = r².',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'What is the arc length of a 90° arc on a circle with radius 8? (π ≈ 3.14)', options: ['4π','8π','12.56','25.12'], answer: '12.56', hint: 'Arc = (90/360) × 2π(8) = ¼ × 50.24.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'An inscribed angle intercepts an arc of 80°. What is the inscribed angle?', options: ['20°','40°','80°','160°'], answer: '40°', hint: 'Inscribed angle = ½ × intercepted arc.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'What is the center of the circle (x−3)² + (y+2)² = 25?', options: ['(3,2)','(−3,2)','(3,−2)','(−3,−2)'], answer: '(3,−2)', hint: 'Center is (h, k) from (x−h)² + (y−k)² = r².' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'What is the radius of x² + y² = 49?', options: ['7','14','24.5','49'], answer: '7', hint: 'r² = 49 → r = √49 = 7.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'What is the area of a sector with radius 6 and central angle 120°? (π ≈ 3.14)', options: ['6.28','12.56','18.84','37.68'], answer: '37.68', hint: 'Area = (120/360) × π(6²) = ⅓ × 113.04.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'A central angle is 70°. What is the inscribed angle that intercepts the same arc?', options: ['35°','70°','105°','140°'], answer: '35°', hint: 'Inscribed angle = ½ × central angle.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Write the equation of a circle with center (−1, 4) and radius 3.', options: ['(x+1)²+(y−4)²=3','(x+1)²+(y−4)²=9','(x−1)²+(y+4)²=9','(x+1)²+(y+4)²=9'], answer: '(x+1)²+(y−4)²=9', hint: '(x−h)²+(y−k)²=r² with h=−1, k=4, r=3.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Two chords intersect inside a circle. The segments of one chord are 4 and 6. One segment of the other chord is 3. Find the missing segment.', options: ['6','7','8','9'], answer: '8', hint: 'Intersecting chords: a×b = c×d → 4×6 = 3×x.' },
    ],
  },
  // ============ MATH — GRADE 11 ============
  'math-11-polynomials': {
    id: 'math-11-polynomials', subject: 'math', grade: '11',
    title: 'Polynomials & Factoring', description: 'Add, subtract, multiply polynomials and factor completely',
    explanation: 'Degree of a polynomial = highest exponent. FOIL for multiplying binomials. Factor by grouping, difference of squares, or sum/difference of cubes.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Add: (3x² + 2x − 1) + (x² − 4x + 5)', options: ['4x² − 2x + 4','4x² + 6x − 6','2x² + 6x + 4','4x² − 2x − 4'], answer: '4x² − 2x + 4', hint: 'Combine like terms: 3x²+x², 2x−4x, −1+5.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Multiply: (x + 3)(x − 5)', options: ['x² − 2x − 15','x² + 2x − 15','x² − 2x + 15','x² − 15'], answer: 'x² − 2x − 15', hint: 'Use FOIL: F+O+I+L.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Factor completely: 2x² − 8', options: ['2(x²−4)','2(x−2)(x+2)','(2x−4)(x+2)','2x(x−4)'], answer: '2(x−2)(x+2)', hint: 'Factor out 2 first, then use difference of squares.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Factor: x³ − 27', options: ['(x−3)(x²+3x+9)','(x−3)³','(x−3)(x²−3x+9)','(x+3)(x²−3x+9)'], answer: '(x−3)(x²+3x+9)', hint: 'Difference of cubes: a³−b³ = (a−b)(a²+ab+b²).' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Expand: (2x − 3)²', options: ['4x²−9','4x²−6x+9','4x²−12x+9','4x²+12x+9'], answer: '4x²−12x+9', hint: '(a−b)² = a² − 2ab + b².' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Factor by grouping: x³ + 2x² + 3x + 6', options: ['(x²+3)(x+2)','(x+2)(x²+3)','(x²+2)(x+3)','(x+3)(x+2)'], answer: '(x²+3)(x+2)', hint: 'Group: (x³+2x²) + (3x+6) = x²(x+2) + 3(x+2).' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Divide: (x² + 5x + 6) ÷ (x + 2)', options: ['x+2','x+3','x+4','x+5'], answer: 'x+3', hint: 'Use polynomial long division or factor the numerator.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'What is the degree of 4x⁵ − 3x³ + 7x − 2?', options: ['2','3','4','5'], answer: '5', hint: 'Degree = highest exponent.' },
    ],
  },
  'math-11-logs': {
    id: 'math-11-logs', subject: 'math', grade: '11',
    title: 'Exponentials & Logarithms', description: 'Solve exponential and logarithmic equations using log properties',
    explanation: 'log_b(x) = y means b^y = x. Product rule: log(xy) = log(x) + log(y). Quotient rule: log(x/y) = log(x) − log(y). Power rule: log(x^n) = n·log(x).',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Evaluate: log₂(8)', options: ['2','3','4','8'], answer: '3', hint: '2³ = 8, so log₂(8) = 3.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Solve: 2^x = 32', options: ['4','5','6','7'], answer: '5', hint: '2⁵ = 32.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Expand: log(x²y)', options: ['2log x + log y','2log x − log y','log x + 2log y','log(2x) + log y'], answer: '2log x + log y', hint: 'Product rule + Power rule.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Solve: log₃(x) = 4', options: ['12','27','64','81'], answer: '81', hint: '3⁴ = 81.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Which property states log(x/y) = log x − log y?', options: ['Product rule','Quotient rule','Power rule','Chain rule'], answer: 'Quotient rule', hint: 'Division becomes subtraction in logarithms.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Solve: 3^(x+1) = 27', options: ['1','2','3','4'], answer: '2', hint: '27 = 3³, so x+1 = 3 → x = 2.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'A population doubles every 5 years. Starting at 1000, what is the population after 15 years?', options: ['4000','6000','8000','16000'], answer: '8000', hint: 'After 3 doubling periods (15÷5): 1000 × 2³ = 8000.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Simplify: log₅(25) + log₅(5)', options: ['2','3','5','10'], answer: '3', hint: 'log₅(25) = 2 and log₅(5) = 1. Sum = 3.' },
    ],
  },
  'math-11-sequences': {
    id: 'math-11-sequences', subject: 'math', grade: '11',
    title: 'Sequences & Series', description: 'Find terms and sums of arithmetic and geometric sequences',
    explanation: 'Arithmetic: aₙ = a₁ + (n−1)d. Geometric: aₙ = a₁ × r^(n−1). Sum of arithmetic: Sₙ = n/2(a₁ + aₙ). Sum of geometric: Sₙ = a₁(1−rⁿ)/(1−r).',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Find the 8th term of the arithmetic sequence: 3, 7, 11, 15, ...', options: ['27','31','35','39'], answer: '31', hint: 'aₙ = 3 + (8−1)×4 = 3 + 28 = 31.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Find the common ratio of the geometric sequence: 2, 6, 18, 54, ...', options: ['2','3','4','6'], answer: '3', hint: 'Divide any term by the previous: 6÷2 = 3.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Find the 5th term of the geometric sequence: 4, 12, 36, ...', options: ['108','324','972','1296'], answer: '324', hint: 'a₅ = 4 × 3⁴ = 4 × 81.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Find the sum of the first 6 terms: 1 + 3 + 5 + 7 + 9 + 11', options: ['30','33','36','39'], answer: '36', hint: 'Sₙ = n/2 × (first + last) = 6/2 × (1+11) = 36.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Is the sequence 2, 5, 10, 17, 26 arithmetic, geometric, or neither?', options: ['Arithmetic','Geometric','Neither','Both'], answer: 'Neither', hint: 'Check differences: 3, 5, 7, 9 — not constant. Check ratios: not constant either.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Find the sum of the first 5 terms of the geometric sequence with a₁ = 3 and r = 2.', options: ['63','93','96','128'], answer: '93', hint: 'S₅ = 3(1−2⁵)/(1−2) = 3(−31)/(−1) = 93.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'What is the 10th term of the arithmetic sequence with a₁ = 5 and d = −3?', options: ['−22','−19','−16','−13'], answer: '−22', hint: 'a₁₀ = 5 + (9)(−3) = 5 − 27 = −22.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'A geometric series has a₁ = 8 and r = 1/2. What is the infinite sum?', options: ['8','12','16','24'], answer: '16', hint: 'S∞ = a₁/(1−r) = 8/(1−½) = 16.' },
    ],
  },
  'math-11-radicals': {
    id: 'math-11-radicals', subject: 'math', grade: '11',
    title: 'Radicals & Rational Exponents', description: 'Simplify radicals and convert between radical and exponent form',
    explanation: 'x^(m/n) = ⁿ√(xᵐ). To simplify √(a×b) = √a × √b. Rationalize by multiplying numerator and denominator by the conjugate.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Simplify: √48', options: ['4√3','6√2','8√3','12√2'], answer: '4√3', hint: '48 = 16 × 3. √48 = √16 × √3 = 4√3.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Write 8^(2/3) in radical form', options: ['∛8²','√8³','(∛8)²','∛(8²)'], answer: '(∛8)²', hint: 'x^(m/n) = (ⁿ√x)^m.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Evaluate: 27^(2/3)', options: ['3','6','9','18'], answer: '9', hint: '∛27 = 3. Then 3² = 9.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Simplify: 3√5 + 2√5', options: ['5√5','5√10','6√5','6√10'], answer: '5√5', hint: 'Like radicals can be added: (3+2)√5.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Simplify: √12 × √3', options: ['3','6','9','18'], answer: '6', hint: '√12 × √3 = √36 = 6.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Rationalize: 5/√3', options: ['5√3','5√3/3','15/√3','5/3'], answer: '5√3/3', hint: 'Multiply by √3/√3: 5√3/3.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Solve: √(2x + 1) = 5', options: ['10','12','13','24'], answer: '12', hint: 'Square both sides: 2x + 1 = 25 → x = 12.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Simplify: (x^(1/2) × x^(1/3))', options: ['x^(1/6)','x^(1/5)','x^(5/6)','x^(2/3)'], answer: 'x^(5/6)', hint: 'Add exponents: 1/2 + 1/3 = 3/6 + 2/6 = 5/6.' },
    ],
  },
  // ============ MATH — GRADE 12 ============
  'math-12-precalc': {
    id: 'math-12-precalc', subject: 'math', grade: '12',
    title: 'Pre-Calculus & Trigonometry', description: 'Unit circle, trig identities, and advanced functions',
    explanation: 'Unit circle: at angle θ, point is (cos θ, sin θ). Key identities: sin²θ + cos²θ = 1. Radian measure: π radians = 180°.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Convert 180° to radians', options: ['π/2','π','2π','3π/2'], answer: 'π', hint: '180° = π radians.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'What are the coordinates of the point at 90° on the unit circle?', options: ['(1,0)','(0,1)','(−1,0)','(0,−1)'], answer: '(0,1)', hint: 'At 90°: cos(90°) = 0, sin(90°) = 1.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'If sin θ = 3/5, what is cos θ? (θ in first quadrant)', options: ['4/5','3/4','5/3','1/5'], answer: '4/5', hint: 'sin²θ + cos²θ = 1 → cos²θ = 1 − 9/25 = 16/25.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'What is the period of y = sin(2x)?', options: ['π','2π','π/2','4π'], answer: 'π', hint: 'Period = 2π/|b| = 2π/2 = π.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Simplify: sin²θ + cos²θ', options: ['0','1','2sin θ','2cos θ'], answer: '1', hint: 'Pythagorean identity.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'The amplitude of y = 3 sin(x) is:', options: ['1','π','3','6'], answer: '3', hint: 'Amplitude = |a| in y = a sin(x).' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'What is tan(π/4)?', options: ['0','1/2','1','√3'], answer: '1', hint: 'tan(45°) = sin(45°)/cos(45°) = 1.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Find all solutions of sin(x) = 0 on [0, 2π]', options: ['0 only','π only','0 and π','0, π, and 2π'], answer: '0, π, and 2π', hint: 'sin(x) = 0 at x = 0, π, 2π.' },
    ],
  },
  'math-12-calculus': {
    id: 'math-12-calculus', subject: 'math', grade: '12',
    title: 'Introduction to Calculus', description: 'Limits, derivatives, and basic integration concepts',
    explanation: 'A limit describes what a function approaches. The derivative measures instantaneous rate of change: f\'(x) = lim(h→0) [f(x+h)−f(x)]/h. Power rule: d/dx[xⁿ] = nxⁿ⁻¹.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Evaluate: lim(x→3) of (x² − 9)/(x − 3)', options: ['0','3','6','9'], answer: '6', hint: 'Factor: (x+3)(x−3)/(x−3) = x+3. At x=3: 6.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Find the derivative of f(x) = x⁴ using the power rule.', options: ['x³','4x³','4x⁴','x⁵/5'], answer: '4x³', hint: 'Power rule: d/dx[xⁿ] = nxⁿ⁻¹.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Find f\'(x) if f(x) = 3x² − 5x + 2', options: ['6x − 5','3x − 5','6x − 5x','3x + 2'], answer: '6x − 5', hint: 'Differentiate term by term.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'The slope of the tangent to y = x² at x = 3 is:', options: ['3','6','9','12'], answer: '6', hint: 'f\'(x) = 2x. At x = 3: 2(3) = 6.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'Find the critical point of f(x) = x² − 6x + 8', options: ['x = 2','x = 3','x = 4','x = 6'], answer: 'x = 3', hint: 'Set f\'(x) = 2x − 6 = 0 → x = 3.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Evaluate: ∫ 2x dx', options: ['2','x²','x² + C','2x² + C'], answer: 'x² + C', hint: '∫ 2x dx = 2 × x²/2 + C = x² + C.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'Find f\'(x) if f(x) = 5x³ − 2x² + x', options: ['15x² − 4x + 1','5x² − 2x + 1','15x² − 4x','5x³ − 4x + 1'], answer: '15x² − 4x + 1', hint: 'Differentiate each term.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'A function is concave up when its second derivative is:', options: ['Equal to 0','Negative','Positive','Undefined'], answer: 'Positive', hint: 'f\'\'(x) > 0 means concave up (like a cup shape).' },
    ],
  },
  'math-12-statistics': {
    id: 'math-12-statistics', subject: 'math', grade: '12',
    title: 'Statistics & Probability', description: 'Normal distribution, confidence intervals, and hypothesis testing',
    explanation: 'Normal distribution is bell-shaped and symmetric. 68% of data within 1 SD, 95% within 2 SD. A confidence interval estimates a population parameter.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'In a normal distribution, what percent of data falls within 2 standard deviations of the mean?', options: ['68%','95%','99.7%','50%'], answer: '95%', hint: '68-95-99.7 rule: 2 SD → 95%.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'What is the probability of flipping heads twice in a row?', options: ['1/4','1/2','1/3','3/4'], answer: '1/4', hint: '1/2 × 1/2 = 1/4.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'A normal distribution has mean 50 and SD 10. What is the z-score for x = 70?', options: ['1','1.5','2','2.5'], answer: '2', hint: 'z = (x − μ)/σ = (70 − 50)/10 = 2.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'What does a p-value less than 0.05 indicate?', options: ['Accept null hypothesis','Reject null hypothesis','Inconclusive result','Data is invalid'], answer: 'Reject null hypothesis', hint: 'p < 0.05 means the result is statistically significant.' },
      { id: 'q5', type: 'mcq', difficulty: 2, prompt: 'If you roll two dice, what is the probability of getting a sum of 7?', options: ['1/6','1/9','1/12','5/36'], answer: '1/6', hint: 'There are 6 ways to get 7 out of 36 total outcomes.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'A 95% confidence interval means:', options: ['95% of the data falls in the interval','We are 95% confident the true mean is in the interval','The sample mean equals the population mean','The sample size is large enough'], answer: 'We are 95% confident the true mean is in the interval', hint: 'Confidence intervals estimate population parameters.' },
      { id: 'q7', type: 'mcq', difficulty: 3, prompt: 'What increases the power of a hypothesis test?', options: ['Smaller sample size','Smaller effect size','Larger sample size','Higher p-value threshold'], answer: 'Larger sample size', hint: 'More data → more power to detect real differences.' },
      { id: 'q8', type: 'mcq', difficulty: 3, prompt: 'Permutations of 5 items taken 3 at a time (P(5,3)) =', options: ['10','20','60','120'], answer: '60', hint: 'P(n,r) = n!/(n−r)! = 5!/2! = 60.' },
    ],
  },

  // ── ELA 6-12 ────────────────────────────────────────────────────────────────
  'ela-6-grammar': {
    id: 'ela-6-grammar', subject: 'ela', grade: '6',
    title: 'Grammar & Language', description: 'Pronouns, sentence structure, punctuation',
    explanation: 'Strong grammar makes your writing clear and professional.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Which sentence uses correct pronoun-antecedent agreement?', options: ['Each student must bring their book.','Each student must bring his or her book.','Each student must bring its book.','Each student must bring our book.'], answer: 'Each student must bring his or her book.', hint: 'Singular antecedent → singular pronoun.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Which is a compound sentence?', options: ['I ran fast.','I ran fast, and I won the race.','Running fast, I won.','Because I ran fast.'], answer: 'I ran fast, and I won the race.', hint: 'Compound = two independent clauses joined by a conjunction.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Identify the error: "Between you and I, this is wrong."', options: ['No error','Should be "between you and me"','Should be "between us and I"','Should be "among you and me"'], answer: 'Should be "between you and me"', hint: 'After a preposition, use object pronouns (me, him, her).' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Which correctly uses a semicolon?', options: ['I like cats; but not dogs.','I like cats; however, I prefer dogs.','I like; cats and dogs.','I like cats; and dogs.'], answer: 'I like cats; however, I prefer dogs.', hint: 'Semicolons join independent clauses, often with a conjunctive adverb.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'What is a dangling modifier?', options: ['A modifier far from the word it modifies','A modifier that modifies nothing in the sentence','A misplaced adjective','A redundant phrase'], answer: 'A modifier that modifies nothing in the sentence', hint: 'Example: "Running down the hall, the bell rang." — who was running?' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Which sentence is in the passive voice?', options: ['The dog chased the cat.','The cat was chased by the dog.','The cat ran away.','Dogs chase cats.'], answer: 'The cat was chased by the dog.', hint: 'Passive: subject receives the action.' },
    ],
  },
  'ela-6-vocabulary': {
    id: 'ela-6-vocabulary', subject: 'ela', grade: '6',
    title: 'Vocabulary', description: 'Context clues, figurative language, word relationships',
    explanation: 'A strong vocabulary helps you read and write with precision.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'What does "benevolent" mean?', options: ['Cruel','Kind and generous','Angry','Shy'], answer: 'Kind and generous', hint: 'Bene- means good.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'A "metaphor" directly compares two things without using:', options: ['Nouns','Like or as','Adjectives','Verbs'], answer: 'Like or as', hint: 'Similes use "like" or "as"; metaphors do not.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: '"The wind whispered through the trees" is an example of:', options: ['Hyperbole','Personification','Simile','Alliteration'], answer: 'Personification', hint: 'Giving human qualities to non-human things.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Use context: "The arid desert had not seen rain in months." Arid means:', options: ['Cold','Wet','Dry','Dark'], answer: 'Dry', hint: 'No rain for months suggests very dry conditions.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'What is the relationship between "frugal" and "extravagant"?', options: ['Synonyms','Antonyms','Homophones','Homographs'], answer: 'Antonyms', hint: 'Frugal = careful with money; extravagant = overspending.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: '"I have told you a million times" is an example of:', options: ['Simile','Metaphor','Hyperbole','Understatement'], answer: 'Hyperbole', hint: 'Extreme exaggeration for effect.' },
    ],
  },
  'ela-6-reading': {
    id: 'ela-6-reading', subject: 'ela', grade: '6',
    title: 'Reading & Comprehension', description: 'Cite evidence, central idea, author\'s purpose',
    explanation: 'Good readers find evidence in the text to support their thinking.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Textual evidence means:', options: ['Your personal opinion','Specific words or quotes from the text','A summary of the story','Information from another book'], answer: 'Specific words or quotes from the text', hint: 'Always go back to the text.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'The central idea of a nonfiction text is:', options: ['The first sentence','The most important point the author makes','The last paragraph','The title'], answer: 'The most important point the author makes', hint: 'Central idea = the main message.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'To "summarize" a text means to:', options: ['Copy it word for word','Retell every detail','Briefly state the main points','Add your own ideas'], answer: 'Briefly state the main points', hint: 'A summary is short and sticks to the main ideas.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'An author writing to persuade is trying to:', options: ['Tell a story','Explain how something works','Change the reader\'s opinion or actions','Describe a person'], answer: 'Change the reader\'s opinion or actions', hint: 'Persuasive writing uses arguments and evidence.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Which best describes an "inference"?', options: ['A direct quote from the text','A conclusion drawn from evidence and reasoning','A fact stated in the text','An opinion from the author'], answer: 'A conclusion drawn from evidence and reasoning', hint: 'Inferences go beyond what is directly stated.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'When comparing two texts on the same topic, you should look for:', options: ['Which is longer','Similarities and differences in content and perspective','Which has more pictures','Which was written first'], answer: 'Similarities and differences in content and perspective', hint: 'Compare the authors\' claims, evidence, and viewpoints.' },
    ],
  },
  'ela-6-writing': {
    id: 'ela-6-writing', subject: 'ela', grade: '6',
    title: 'Writing', description: 'Argumentative, informative, and narrative writing',
    explanation: 'Good writing has a clear purpose, organization, and supporting details.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'An argumentative essay must include:', options: ['A made-up story','A clear claim and supporting evidence','Only personal opinions','A list of vocabulary words'], answer: 'A clear claim and supporting evidence', hint: 'Arguments need a position and proof.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'A thesis statement appears:', options: ['At the end of the essay','In the introduction','In every paragraph','Only in conclusions'], answer: 'In the introduction', hint: 'The thesis tells the reader your main argument.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Transition words like "however" and "therefore" help with:', options: ['Adding humor','Connecting ideas','Describing characters','Starting a story'], answer: 'Connecting ideas', hint: 'Transitions guide the reader between thoughts.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'A counterargument in persuasive writing is:', options: ['Your main claim','An opposing viewpoint you address','A supporting detail','The conclusion'], answer: 'An opposing viewpoint you address', hint: 'Addressing counterarguments strengthens your position.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Which type of evidence is strongest in an argumentative essay?', options: ['Personal feelings','Statistics from a reliable source','An opinion from a friend','A made-up example'], answer: 'Statistics from a reliable source', hint: 'Data and facts from credible sources are most convincing.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'In narrative writing, "pacing" refers to:', options: ['Word choice','How fast or slow the story moves','The setting','Character description'], answer: 'How fast or slow the story moves', hint: 'Short sentences speed up action; longer ones slow it down.' },
    ],
  },

  'ela-7-grammar': {
    id: 'ela-7-grammar', subject: 'ela', grade: '7',
    title: 'Grammar & Language', description: 'Modifiers, phrases, clauses, capitalization',
    explanation: 'Understanding sentence structure helps you write with precision.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'A phrase is:', options: ['A complete sentence','A group of words without a subject and verb acting as one unit','Two independent clauses','A paragraph'], answer: 'A group of words without a subject and verb acting as one unit', hint: 'Phrases do not have both a subject and a predicate.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'Identify the misplaced modifier: "She almost drove her kids to school every day."', options: ['No error','Almost should be near every day','Almost should follow kids','The sentence has no modifier'], answer: 'Almost should be near every day', hint: 'Modifiers should be placed next to what they modify.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Which is a dependent clause?', options: ['The dog barked.','When the dog barked','The dog barked loudly.','Bark!'], answer: 'When the dog barked', hint: 'Dependent clauses cannot stand alone.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'Which word should be capitalized? "we visited the amazon river."', options: ['visited','the','amazon river','we'], answer: 'amazon river', hint: 'Proper nouns — names of specific places — are capitalized.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'What is a participial phrase?', options: ['A phrase using a gerund as a noun','A phrase using a verb form as an adjective','A phrase starting with a preposition','A phrase with two subjects'], answer: 'A phrase using a verb form as an adjective', hint: 'Example: "Running quickly, she caught the bus." — "running quickly" modifies "she".' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'In "Swimming is fun," "swimming" is a:', options: ['Participle','Gerund','Infinitive','Adjective'], answer: 'Gerund', hint: 'A gerund is a verb form ending in -ing used as a noun.' },
    ],
  },
  'ela-7-vocabulary': {
    id: 'ela-7-vocabulary', subject: 'ela', grade: '7',
    title: 'Vocabulary', description: 'Connotation, academic vocabulary, roots/affixes',
    explanation: 'Word choice affects tone — connotation matters as much as definition.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Denotation is:', options: ['The emotional feeling of a word','The dictionary definition of a word','A word that sounds like another','A word\'s origin'], answer: 'The dictionary definition of a word', hint: 'Denotation = literal meaning.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'The Latin root "port" means:', options: ['To write','To carry','To build','To break'], answer: 'To carry', hint: 'Transport, portable, export all involve carrying.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: '"Slender" and "scrawny" both mean thin, but "scrawny" has a __ connotation.', options: ['Positive','Neutral','Negative','Neither'], answer: 'Negative', hint: 'Scrawny implies unattractively thin.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'The prefix "mis-" means:', options: ['Before','Again','Wrongly','Against'], answer: 'Wrongly', hint: 'Misuse, mistake, misplace — all involve doing something wrongly.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Which word uses the Greek root "graph" (to write)?', options: ['Geography','Autobiography','Photograph','All of the above'], answer: 'All of the above', hint: '-graph and -graphy both relate to writing or recording.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Academic vocabulary words are:', options: ['Only used in science','Words used across many subjects and disciplines','Slang words','Words only in fiction'], answer: 'Words used across many subjects and disciplines', hint: 'Words like "analyze," "evaluate," and "justify" appear in all subjects.' },
    ],
  },
  'ela-7-reading': {
    id: 'ela-7-reading', subject: 'ela', grade: '7',
    title: 'Reading & Literature', description: 'Character development, themes, evaluating arguments',
    explanation: 'Analyzing literature means looking beyond the plot to the deeper meaning.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'A static character is one who:', options: ['Changes a lot during the story','Does not change throughout the story','Is the main character','Is the villain'], answer: 'Does not change throughout the story', hint: 'Static = stays the same; dynamic = changes.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'Theme is best described as:', options: ['The plot of the story','The main character\'s name','A universal message or lesson the story conveys','The setting'], answer: 'A universal message or lesson the story conveys', hint: 'Theme is the "big idea" — often about life, love, or justice.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'When evaluating an argument, you should check for:', options: ['Interesting vocabulary','Logical reasoning and credible evidence','Long sentences','Rhyme and rhythm'], answer: 'Logical reasoning and credible evidence', hint: 'Good arguments are logical and backed by reliable evidence.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'What is a "foil" character?', options: ['The antagonist','A character who contrasts with the protagonist to highlight their traits','A minor background character','The narrator'], answer: 'A character who contrasts with the protagonist to highlight their traits', hint: 'Foil characters illuminate the main character by contrast.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Comparing themes across two texts helps you understand:', options: ['Which book is longer','How different authors approach similar ideas','Only the plot differences','Grammar conventions'], answer: 'How different authors approach similar ideas', hint: 'Cross-text comparison reveals different perspectives on universal ideas.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'A narrator with limited omniscient point of view knows:', options: ['Everything about all characters','The thoughts of only one character','Only what is observed externally','Nothing about any character'], answer: 'The thoughts of only one character', hint: 'Limited omniscient = inside one character\'s head.' },
    ],
  },
  'ela-7-writing': {
    id: 'ela-7-writing', subject: 'ela', grade: '7',
    title: 'Writing', description: 'Claim, evidence, research and citations',
    explanation: 'Strong writing requires clear claims backed by well-cited evidence.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'A claim in an essay is:', options: ['A question','The author\'s main argument or position','A summary','A quotation'], answer: 'The author\'s main argument or position', hint: 'The claim tells readers what you believe and will prove.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Why do we cite sources in essays?', options: ['To make essays longer','To give credit and let readers verify information','To add more vocabulary','To avoid using evidence'], answer: 'To give credit and let readers verify information', hint: 'Citations prevent plagiarism and build credibility.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Which sentence is the strongest claim?', options: ['Some people think phones are good.','Smartphones benefit students by providing instant access to educational resources.','Phones can be bad.','This essay is about phones.'], answer: 'Smartphones benefit students by providing instant access to educational resources.', hint: 'A strong claim is specific and debatable.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'A "works cited" page lists:', options: ['All words you defined','Every source you used in your essay','Your teacher\'s feedback','Your outline'], answer: 'Every source you used in your essay', hint: 'Works cited = bibliography — all sources used.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'What does it mean to "integrate" a quote?', options: ['Copy a long passage word-for-word','Introduce, use, and explain the quote within your own writing','Use only the first sentence of a quote','Replace the quote with your own words'], answer: 'Introduce, use, and explain the quote within your own writing', hint: 'Quotes should be introduced and followed by analysis.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Paraphrasing means:', options: ['Copying text exactly','Restating information in your own words','Summarizing an entire chapter','Adding your opinion to a quote'], answer: 'Restating information in your own words', hint: 'Paraphrase: same meaning, different words.' },
    ],
  },

  'ela-8-grammar': {
    id: 'ela-8-grammar', subject: 'ela', grade: '8',
    title: 'Grammar & Style', description: 'Gerunds, infinitives, voice, style and tone',
    explanation: 'Mastering grammar lets you control the style and impact of your writing.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'An infinitive is:', options: ['A verb ending in -ing','The base form of a verb preceded by "to"','A past-tense verb','A linking verb'], answer: 'The base form of a verb preceded by "to"', hint: 'Examples: to run, to write, to think.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'In "To err is human," "to err" functions as:', options: ['An adverb','The subject of the sentence','An adjective','A direct object'], answer: 'The subject of the sentence', hint: 'The infinitive phrase acts as a noun here.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Active voice is preferred because it:', options: ['Uses more words','Is clearer and more direct','Hides the subject','Is only for fiction'], answer: 'Is clearer and more direct', hint: 'Active: subject acts. Passive: subject is acted upon.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: '"Tone" in writing refers to:', options: ['The volume of the text','The author\'s attitude toward the subject','The speed of reading','The number of paragraphs'], answer: 'The author\'s attitude toward the subject', hint: 'Tone can be formal, humorous, angry, sad, etc.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Which correctly uses a participial phrase?', options: ['Exhausted from the race, the runner collapsed.','The runner, he was exhausted, collapsed.','Collapsing, the runner was exhausted.','Exhausted and the runner collapsed.'], answer: 'Exhausted from the race, the runner collapsed.', hint: 'Participial phrases modify the nearest noun — here, "the runner."' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: '"Style" in writing includes:', options: ['Only grammar rules','Word choice, sentence structure, and voice','The essay\'s topic','The number of sources'], answer: 'Word choice, sentence structure, and voice', hint: 'Style is how you say something, not what you say.' },
    ],
  },
  'ela-8-vocabulary': {
    id: 'ela-8-vocabulary', subject: 'ela', grade: '8',
    title: 'Vocabulary', description: 'Etymology, word origins, nuances in meaning',
    explanation: 'Knowing word origins helps you decode unfamiliar words.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Etymology is the study of:', options: ['Insects','Word origins and history','Sentence structure','Poetry'], answer: 'Word origins and history', hint: 'Etymology traces how words developed over time.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'The Greek root "chron" means:', options: ['Color','Time','Sound','Earth'], answer: 'Time', hint: 'Chronology, chronicle, synchronize — all relate to time.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: '"Notorious" and "famous" both describe being well-known, but "notorious" usually implies:', options: ['Something positive','Something negative or infamous','Something old','Something recent'], answer: 'Something negative or infamous', hint: 'Notorious carries a negative connotation.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'The Latin root "aud" means:', options: ['To hear','To see','To speak','To write'], answer: 'To hear', hint: 'Audio, auditorium, audience — all involve hearing.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Which word has a French origin?', options: ['Kindergarten','Ballet','Safari','Umbrella'], answer: 'Ballet', hint: 'Ballet comes from the French word "balet."' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: '"Guileless" means:', options: ['Full of tricks','Without deceit or cunning','Very angry','Extremely happy'], answer: 'Without deceit or cunning', hint: 'Guile = trickery; guileless = without guile.' },
    ],
  },
  'ela-8-reading': {
    id: 'ela-8-reading', subject: 'ela', grade: '8',
    title: 'Reading & Analysis', description: 'Analyze theme, evaluate reasoning, point of view',
    explanation: 'Skilled readers evaluate how an author builds an argument or tells a story.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'When you "analyze" a text, you:', options: ['Summarize every sentence','Examine the parts to understand the whole','Copy the text','Read it only once'], answer: 'Examine the parts to understand the whole', hint: 'Analysis breaks down how and why, not just what.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'What is "point of view" in literature?', options: ['The setting of the story','The narrator\'s perspective and position','The theme','The conflict'], answer: 'The narrator\'s perspective and position', hint: 'First person (I), third person limited, third person omniscient.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'A logical fallacy is:', options: ['A strong argument','An error in reasoning','A cited statistic','A literary device'], answer: 'An error in reasoning', hint: 'Fallacies make arguments invalid, even if they sound convincing.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: '"Ad hominem" is a fallacy that:', options: ['Uses false statistics','Attacks the person making the argument rather than the argument','Assumes the conclusion','Uses circular reasoning'], answer: 'Attacks the person making the argument rather than the argument', hint: 'Ad hominem = "against the person" in Latin.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Analyzing theme across multiple texts involves:', options: ['Counting how many times a word appears','Comparing how different authors develop the same central message','Only reading one text deeply','Summarizing each text separately'], answer: 'Comparing how different authors develop the same central message', hint: 'Cross-textual analysis reveals how themes are universal yet handled differently.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Which best evaluates the strength of evidence?', options: ['How long it is','How relevant, credible, and sufficient it is','Whether it agrees with you','Whether it comes from a book'], answer: 'How relevant, credible, and sufficient it is', hint: 'Good evidence is accurate, trustworthy, and actually supports the claim.' },
    ],
  },
  'ela-8-writing': {
    id: 'ela-8-writing', subject: 'ela', grade: '8',
    title: 'Writing', description: 'Argumentative essay structure, integrating sources',
    explanation: 'Argumentative essays present a clear position supported by integrated evidence.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'The purpose of a conclusion paragraph is to:', options: ['Introduce new evidence','Restate the thesis and summarize main points','List all sources','Start a new argument'], answer: 'Restate the thesis and summarize main points', hint: 'Conclusions bring the essay full circle.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'Which is the best way to introduce a quote?', options: ['Just paste it in with no context.','As the author states, "..."','Quotation:','Begin quote here:'], answer: 'As the author states, "..."', hint: 'Always introduce quotes with a signal phrase.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'A rebuttal in an argumentative essay:', options: ['Repeats your thesis','Addresses and counters opposing arguments','Lists all your evidence','Introduces the topic'], answer: 'Addresses and counters opposing arguments', hint: 'A rebuttal shows you\'ve considered other views and explains why yours is stronger.' },
      { id: 'q4', type: 'mcq', difficulty: 3, prompt: 'When should you use a block quote?', options: ['Whenever you cite any source','For quotes longer than 4 lines','Only in fiction essays','Never'], answer: 'For quotes longer than 4 lines', hint: 'MLA format: quotes over 4 lines are indented as a block.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'What is plagiarism?', options: ['Using too many quotes','Using someone else\'s work without credit','Writing a long essay','Using formal language'], answer: 'Using someone else\'s work without credit', hint: 'Always cite your sources to avoid plagiarism.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Which organizational structure works best for comparing two topics?', options: ['Narrative structure','Point-by-point or block comparison','Chronological order','Problem-solution'], answer: 'Point-by-point or block comparison', hint: 'Compare/contrast essays use parallel structure to highlight similarities and differences.' },
    ],
  },

  'ela-9-literature': {
    id: 'ela-9-literature', subject: 'ela', grade: '9',
    title: 'Literature', description: 'Fiction elements, plot/conflict, symbolism, imagery',
    explanation: 'Literary analysis examines how authors use craft to create meaning.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'The climax of a story is:', options: ['The introduction','The highest point of tension','The resolution','The falling action'], answer: 'The highest point of tension', hint: 'The climax is the turning point where tension peaks.' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'A symbol in literature is:', options: ['A punctuation mark','An object or idea representing something beyond its literal meaning','The main character','A plot twist'], answer: 'An object or idea representing something beyond its literal meaning', hint: 'A dove can symbolize peace; a storm can symbolize conflict.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Imagery appeals to:', options: ['Only sight','The reader\'s five senses','Only emotions','Only logic'], answer: 'The reader\'s five senses', hint: 'Imagery creates vivid mental pictures using sensory details.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'An external conflict is between:', options: ['A character and their own thoughts','Two aspects of a character\'s personality','A character and an outside force','A character and their past'], answer: 'A character and an outside force', hint: 'External = person vs. person, nature, society, or technology.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Dramatic irony occurs when:', options: ['The reader knows something a character doesn\'t','The author contradicts themselves','A character lies','Two characters disagree'], answer: 'The reader knows something a character doesn\'t', hint: 'Example: The audience knows the villain is behind the door, but the character doesn\'t.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'What is an archetype in literature?', options: ['A specific character','A recurring symbol, theme, or character type found across cultures','A type of rhyme scheme','A narrative structure'], answer: 'A recurring symbol, theme, or character type found across cultures', hint: 'The Hero\'s Journey is an archetypal narrative pattern.' },
    ],
  },
  'ela-9-grammar': {
    id: 'ela-9-grammar', subject: 'ela', grade: '9',
    title: 'Language & Grammar', description: 'Subordination, coordination, standard conventions',
    explanation: 'Complex sentence structures add sophistication to your writing.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Coordinating conjunctions connect:', options: ['Only nouns','Two equal grammatical elements','Dependent and independent clauses','Only verbs'], answer: 'Two equal grammatical elements', hint: 'FANBOYS: For, And, Nor, But, Or, Yet, So.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'Subordination is used to:', options: ['Make two equal clauses','Show that one idea is less important than another','Add humor to writing','Connect two nouns'], answer: 'Show that one idea is less important than another', hint: 'Subordinating conjunctions: although, because, since, while.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Which is a complex sentence?', options: ['I ran.','I ran and she walked.','Although it rained, we played outside.','It was a great day, but it ended.'], answer: 'Although it rained, we played outside.', hint: 'Complex = one independent + one dependent clause.' },
      { id: 'q4', type: 'mcq', difficulty: 3, prompt: 'A run-on sentence is:', options: ['A very long sentence','Two or more independent clauses joined without proper punctuation','A sentence fragment','A sentence with too many adjectives'], answer: 'Two or more independent clauses joined without proper punctuation', hint: 'Fix run-ons with a period, semicolon, or conjunction.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Which correctly punctuates a compound-complex sentence?', options: ['Although she tried hard she failed and gave up.','Although she tried hard, she failed, and she gave up.','Although she tried hard she failed, and gave up.','She tried hard although she failed and, she gave up.'], answer: 'Although she tried hard, she failed, and she gave up.', hint: 'Use a comma after the dependent clause and before the coordinating conjunction.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: '"Standard English conventions" include:', options: ['Slang and casual language','Grammar, punctuation, and usage rules for formal writing','Regional dialects','Internet abbreviations'], answer: 'Grammar, punctuation, and usage rules for formal writing', hint: 'Standard conventions ensure clarity in academic and professional contexts.' },
    ],
  },
  'ela-9-writing': {
    id: 'ela-9-writing', subject: 'ela', grade: '9',
    title: 'Writing', description: 'Literary analysis essays, thesis development, evidence',
    explanation: 'Literary analysis requires a clear argument supported by textual evidence.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'A literary analysis essay focuses on:', options: ['Summarizing the plot','Analyzing how an author uses literary devices to convey meaning','Retelling the story in your own words','Describing the setting'], answer: 'Analyzing how an author uses literary devices to convey meaning', hint: 'Analysis goes beyond summary to explain the "how" and "why."' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'A strong thesis for a literary analysis:', options: ['States a fact everyone agrees with','Makes a debatable claim about a literary text that can be proven with evidence','Summarizes the plot','Asks a question'], answer: 'Makes a debatable claim about a literary text that can be proven with evidence', hint: 'Your thesis should take a stand that others could argue against.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'The C-E-E paragraph structure stands for:', options: ['Claim, Example, Explanation','Compare, Explain, Evaluate','Conclusion, Evidence, Edit','Claim, Evaluate, Expand'], answer: 'Claim, Example, Explanation', hint: 'State your point, give a quote/example, then explain how it proves your point.' },
      { id: 'q4', type: 'mcq', difficulty: 3, prompt: 'Commentary in a literary analysis:', options: ['Is the same as a plot summary','Explains how the evidence proves your claim','Lists all literary devices','Introduces the author'], answer: 'Explains how the evidence proves your claim', hint: 'Commentary is your analysis — it does the work of connecting evidence to your argument.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Which is the best literary analysis thesis?', options: ['The Great Gatsby is about the American Dream.','In The Great Gatsby, Fitzgerald uses Gatsby\'s green light to symbolize the corruption of the American Dream.','I liked The Great Gatsby.','The Great Gatsby is a famous novel.'], answer: 'In The Great Gatsby, Fitzgerald uses Gatsby\'s green light to symbolize the corruption of the American Dream.', hint: 'Specific + debatable + focused on a literary device = strong thesis.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'When you "embed" a quote, you:', options: ['Use only the entire quote as a sentence','Weave the quote naturally into your own sentence','Put the quote in a block format','Use brackets around the entire quote'], answer: 'Weave the quote naturally into your own sentence', hint: 'Embedded quotes fit grammatically within your sentence structure.' },
    ],
  },

  'ela-10-literature': {
    id: 'ela-10-literature', subject: 'ela', grade: '10',
    title: 'World Literature', description: 'Cultural context, universal themes, compare world literary works',
    explanation: 'World literature reveals how different cultures explore universal human experiences.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'A universal theme is one that:', options: ['Only appears in American literature','Is found across different cultures and time periods','Is specific to one author','Only deals with nature'], answer: 'Is found across different cultures and time periods', hint: 'Love, loss, justice, and identity are universal themes.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'Cultural context in literature means:', options: ['The book\'s page count','The historical and social background that shaped the work','The author\'s style','The number of characters'], answer: 'The historical and social background that shaped the work', hint: 'Context helps explain why characters act and think as they do.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Magical realism is a style that:', options: ['Only uses facts','Blends realistic settings with magical or fantastical elements','Is purely science fiction','Has no characters'], answer: 'Blends realistic settings with magical or fantastical elements', hint: 'Gabriel García Márquez is a famous magical realist author.' },
      { id: 'q4', type: 'mcq', difficulty: 3, prompt: 'Post-colonial literature often explores:', options: ['Space exploration','The effects of colonialism on identity and culture','Medieval history','Mathematical problems'], answer: 'The effects of colonialism on identity and culture', hint: 'Authors like Chinua Achebe examine cultural displacement.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'What is an "epic"?', options: ['A short poem','A long narrative poem featuring a hero on a grand journey','A type of play','A modern novel'], answer: 'A long narrative poem featuring a hero on a grand journey', hint: 'The Odyssey and Gilgamesh are classic epics.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Comparing literary works from different cultures helps us understand:', options: ['Which culture is superior','Shared human concerns expressed through different perspectives','Only the differences between cultures','Grammar rules'], answer: 'Shared human concerns expressed through different perspectives', hint: 'Comparison reveals both what unites humanity and what makes each culture unique.' },
    ],
  },
  'ela-10-rhetoric': {
    id: 'ela-10-rhetoric', subject: 'ela', grade: '10',
    title: 'Rhetoric & Argument', description: 'Ethos, pathos, logos, logical fallacies',
    explanation: 'Rhetoric is the art of persuasion — understanding it makes you a critical reader.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Ethos appeals to:', options: ['Emotion','Logic and facts','The speaker\'s credibility and authority','The audience\'s self-interest'], answer: 'The speaker\'s credibility and authority', hint: 'Ethos: "Trust me, I\'m an expert."' },
      { id: 'q2', type: 'mcq', difficulty: 1, prompt: 'Pathos appeals to:', options: ['Logic','Emotion','Credibility','Statistics'], answer: 'Emotion', hint: 'Pathos: "Think of the children!"' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Logos appeals to:', options: ['Emotion','Credibility','Logic, facts, and evidence','Personal stories'], answer: 'Logic, facts, and evidence', hint: 'Logos: "Statistics show that..."' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'A "straw man" fallacy involves:', options: ['Attacking someone personally','Misrepresenting an opponent\'s argument to make it easier to attack','Using too much emotion','Circular reasoning'], answer: 'Misrepresenting an opponent\'s argument to make it easier to attack', hint: 'Building a "straw man" = arguing against a weaker version of the real position.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: '"Everyone is buying this product, so you should too" is an example of:', options: ['Ad hominem','Bandwagon fallacy','False dilemma','Slippery slope'], answer: 'Bandwagon fallacy', hint: 'Popularity doesn\'t make something correct.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'A false dilemma presents:', options: ['Too many options','Only two options when more exist','A logical argument','Strong evidence'], answer: 'Only two options when more exist', hint: 'Example: "You\'re either with us or against us." — ignores middle ground.' },
    ],
  },
  'ela-10-writing': {
    id: 'ela-10-writing', subject: 'ela', grade: '10',
    title: 'Writing', description: 'Analytical essays, synthesizing multiple sources',
    explanation: 'Synthesis writing combines information from multiple sources into a unified argument.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'An analytical essay focuses on:', options: ['Telling a story','Breaking down and interpreting a topic using evidence','Summarizing an article','Describing your personal experience'], answer: 'Breaking down and interpreting a topic using evidence', hint: 'Analysis = how and why, not just what.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'Synthesis writing means:', options: ['Choosing one source and copying it','Combining ideas from multiple sources to support your own argument','Summarizing each source separately','Using only direct quotes'], answer: 'Combining ideas from multiple sources to support your own argument', hint: 'Synthesis blends sources; it doesn\'t just list them.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'When two sources disagree, you should:', options: ['Ignore the one you disagree with','Acknowledge the disagreement and analyze why it exists','Only cite the one that supports you','Say both sources are wrong'], answer: 'Acknowledge the disagreement and analyze why it exists', hint: 'Acknowledging complexity strengthens your analysis.' },
      { id: 'q4', type: 'mcq', difficulty: 3, prompt: 'A "synthesis" is most like:', options: ['A grocery list','A patchwork quilt that uses many pieces to form one design','A copy of one source','A personal narrative'], answer: 'A patchwork quilt that uses many pieces to form one design', hint: 'Synthesis weaves together many sources into your unified argument.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Which is the best way to avoid over-quoting in an essay?', options: ['Use no quotes at all','Paraphrase most evidence and use direct quotes only for powerful, specific language','Use only block quotes','Quote every sentence'], answer: 'Paraphrase most evidence and use direct quotes only for powerful, specific language', hint: 'Your voice should dominate; quotes support, not replace, your analysis.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'What is a "so what" moment in an essay?', options: ['The thesis statement','The moment where you explain the broader significance of your argument','A transition sentence','The introduction'], answer: 'The moment where you explain the broader significance of your argument', hint: '"So what?" asks: why does this argument matter beyond this paper?' },
    ],
  },

  'ela-11-literature': {
    id: 'ela-11-literature', subject: 'ela', grade: '11',
    title: 'American Literature', description: 'Puritanism to Realism, Modernism, social themes',
    explanation: 'American literature reflects the country\'s evolving values and social conflicts.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Puritanism in early American writing emphasized:', options: ['Individual freedom','Religious devotion, sin, and divine judgment','Scientific discovery','Political revolution'], answer: 'Religious devotion, sin, and divine judgment', hint: 'Puritan writers like Jonathan Edwards focused on God\'s power and human sinfulness.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'Realism in 19th-century American literature aimed to:', options: ['Idealize life and nature','Portray everyday life truthfully without romanticism','Focus only on the wealthy','Use only fantasy elements'], answer: 'Portray everyday life truthfully without romanticism', hint: 'Realist authors like Mark Twain depicted authentic American experiences.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'The Harlem Renaissance was a:', options: ['Political movement only','Cultural and artistic movement celebrating African American life and creativity','Scientific revolution','Military event'], answer: 'Cultural and artistic movement celebrating African American life and creativity', hint: 'Writers like Langston Hughes flourished during the Harlem Renaissance.' },
      { id: 'q4', type: 'mcq', difficulty: 3, prompt: 'Modernist literature often features:', options: ['Traditional linear plots','Fragmented narratives, stream of consciousness, and disillusionment','Romantic idealism','Happy endings'], answer: 'Fragmented narratives, stream of consciousness, and disillusionment', hint: 'WWI deeply influenced Modernist writers like F. Scott Fitzgerald and Ernest Hemingway.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'The "Lost Generation" refers to:', options: ['Children who dropped out of school','American writers and artists who came of age during WWI and felt disillusioned','Immigrants who lost their culture','A generation that never wrote books'], answer: 'American writers and artists who came of age during WWI and felt disillusioned', hint: 'Gertrude Stein coined the term; Hemingway popularized it.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Social protest literature aims to:', options: ['Entertain only','Expose and critique social injustice to inspire change','Celebrate current society','Avoid political topics'], answer: 'Expose and critique social injustice to inspire change', hint: 'Works like The Grapes of Wrath critique poverty and injustice.' },
    ],
  },
  'ela-11-writing': {
    id: 'ela-11-writing', subject: 'ela', grade: '11',
    title: 'Advanced Writing', description: 'Research papers, MLA/APA citation, revision strategies',
    explanation: 'Research writing demands careful source evaluation, citation, and revision.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'MLA format is primarily used in:', options: ['Sciences and social sciences','Humanities, especially English and literature','Business writing','Medical writing'], answer: 'Humanities, especially English and literature', hint: 'MLA = Modern Language Association.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'APA format requires:', options: ['Author-page citations','Author-date citations','No in-text citations','Only footnotes'], answer: 'Author-date citations', hint: 'APA in-text: (Smith, 2020)' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'When revising an essay, you should first focus on:', options: ['Fixing spelling errors','Big-picture issues like argument, organization, and evidence','Punctuation','Font and spacing'], answer: 'Big-picture issues like argument, organization, and evidence', hint: 'Revise for content before editing for mechanics.' },
      { id: 'q4', type: 'mcq', difficulty: 2, prompt: 'A peer-reviewed source is:', options: ['Any website','An article evaluated by experts in the field before publication','A newspaper article','A blog post'], answer: 'An article evaluated by experts in the field before publication', hint: 'Peer review = academic experts check the research before it\'s published.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'A research paper\'s annotated bibliography includes:', options: ['Only source titles','Source citations plus a brief evaluation of each source','Only your own opinions','A list of quotes'], answer: 'Source citations plus a brief evaluation of each source', hint: 'An annotation summarizes and evaluates the source\'s usefulness.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Which is NOT a reliable source for academic research?', options: ['A peer-reviewed journal article','A university press book','A random Wikipedia article','A government report'], answer: 'A random Wikipedia article', hint: 'Wikipedia can be edited by anyone — use it to find sources, not as a source itself.' },
    ],
  },

  'ela-12-literature': {
    id: 'ela-12-literature', subject: 'ela', grade: '12',
    title: 'British & World Literature', description: 'Epic poetry, Shakespeare, post-colonial literature',
    explanation: 'Senior literature spans the breadth of Western and world literary traditions.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'Shakespeare\'s plays are generally divided into:', options: ['Stories and poems','Tragedies, comedies, and histories','Fiction and nonfiction','Acts only'], answer: 'Tragedies, comedies, and histories', hint: 'Hamlet = tragedy; A Midsummer Night\'s Dream = comedy; Henry V = history.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'Iambic pentameter is:', options: ['10 syllables per line, alternating unstressed-stressed','Any rhyming pattern','Free verse poetry','A type of metaphor'], answer: '10 syllables per line, alternating unstressed-stressed', hint: 'da-DUM da-DUM da-DUM da-DUM da-DUM — 5 iambic feet per line.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Beowulf is an example of:', options: ['A Renaissance sonnet','An Old English epic poem','A Victorian novel','A modern play'], answer: 'An Old English epic poem', hint: 'Beowulf is one of the oldest surviving works of Old English literature.' },
      { id: 'q4', type: 'mcq', difficulty: 3, prompt: 'Post-colonial literature often examines:', options: ['Space travel','How colonized peoples reclaim identity and voice','Medieval warfare','Mathematical proof'], answer: 'How colonized peoples reclaim identity and voice', hint: 'Authors like Chinua Achebe (Things Fall Apart) explore colonialism\'s human cost.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'A Shakespearean sonnet consists of:', options: ['14 lines: three quatrains and a couplet','14 lines with one octave and one sestet','20 lines of iambic pentameter','Any 14-line poem'], answer: '14 lines: three quatrains and a couplet', hint: 'ABAB CDCD EFEF GG — the final couplet often delivers the "turn."' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'The Canterbury Tales was written by:', options: ['Shakespeare','Geoffrey Chaucer','John Milton','Edmund Spenser'], answer: 'Geoffrey Chaucer', hint: 'Chaucer wrote The Canterbury Tales in Middle English in the 14th century.' },
    ],
  },
  'ela-12-writing': {
    id: 'ela-12-writing', subject: 'ela', grade: '12',
    title: 'College-Ready Writing', description: 'College essays, advanced argumentation, style and voice',
    explanation: 'College-ready writing blends strong arguments with a distinctive personal voice.',
    questions: [
      { id: 'q1', type: 'mcq', difficulty: 1, prompt: 'A college application essay should:', options: ['Be identical to a class essay','Show your unique personality and perspective','List all your accomplishments in bullet points','Be as long as possible'], answer: 'Show your unique personality and perspective', hint: 'Admissions officers want to know who you are, not just what you\'ve done.' },
      { id: 'q2', type: 'mcq', difficulty: 2, prompt: 'Voice in writing refers to:', options: ['The volume of your words','The distinctive personality and style that comes through your writing','Grammar correctness only','The topic you choose'], answer: 'The distinctive personality and style that comes through your writing', hint: 'Voice is what makes your writing sound like you.' },
      { id: 'q3', type: 'mcq', difficulty: 2, prompt: 'Advanced argumentation requires:', options: ['Simple claims and no evidence','Nuanced claims that acknowledge complexity and counterarguments','Only emotional appeals','Long paragraphs with no structure'], answer: 'Nuanced claims that acknowledge complexity and counterarguments', hint: 'Strong arguments recognize the complexity of issues.' },
      { id: 'q4', type: 'mcq', difficulty: 3, prompt: 'Hedging language in academic writing (e.g., "may," "suggests") is used to:', options: ['Show weakness','Indicate uncertainty and intellectual honesty','Avoid making any claims','Confuse the reader'], answer: 'Indicate uncertainty and intellectual honesty', hint: 'Hedging shows you know the limits of your evidence.' },
      { id: 'q5', type: 'mcq', difficulty: 3, prompt: 'Which best describes a "hook" in an essay introduction?', options: ['The thesis statement','An opening that grabs the reader\'s attention','A works cited entry','A transition sentence'], answer: 'An opening that grabs the reader\'s attention', hint: 'Hooks can be anecdotes, surprising facts, bold claims, or questions.' },
      { id: 'q6', type: 'mcq', difficulty: 3, prompt: 'Style in writing can be described as:', options: ['Following grammar rules only','The combination of word choice, sentence length, tone, and structure that reflects the writer','The topic of the essay','The number of words used'], answer: 'The combination of word choice, sentence length, tone, and structure that reflects the writer', hint: 'Style is HOW you write — your writing fingerprint.' },
    ],
  },

};

// Helper: get skills for a given grade + subject
const getSkillsFor = (grade, subject) =>
  Object.values(SKILLS).filter(s => s.grade === grade && s.subject === subject);

// IXL-style skill catalog: assembled from subject-specific JSON data files
const SKILL_CATALOG = {
  ...mathCatalog,
  ...elaCatalog,
  ...scienceCatalog,
  ...socialCatalog,
};

// Adaptive engine: pick next question based on recent performance
const pickAdaptiveQuestion = (questions, history, askedIds) => {
  const remaining = questions.filter(q => !askedIds.includes(q.id));
  if (remaining.length === 0) return null;
  const recent = history.slice(-3);
  const correctRate = recent.length ? recent.filter(Boolean).length / recent.length : 0.5;
  let targetDiff = 2;
  if (correctRate >= 0.75) targetDiff = 3;
  else if (correctRate <= 0.34) targetDiff = 1;
  const exact = remaining.filter(q => q.difficulty === targetDiff);
  if (exact.length) return exact[Math.floor(Math.random() * exact.length)];
  return remaining[Math.floor(Math.random() * remaining.length)];
};

// Mastery calculation: 0–100 score
const calcMastery = (skillProgress) => {
  if (!skillProgress || skillProgress.attempts === 0) return 0;
  const accuracy = skillProgress.correct / skillProgress.attempts;
  const volume = Math.min(skillProgress.attempts / 10, 1); // 10 attempts → full volume credit
  return Math.round(accuracy * 70 + volume * 30);
};

const masteryLabel = (m) => {
  if (m >= 85) return { label: 'Mastery', color: '#059669', icon: Crown };
  if (m >= 60) return { label: 'Proficient', color: '#6D8BC0', icon: Star };
  if (m >= 30) return { label: 'Developing', color: '#6D8BC0', icon: TrendingUp };
  if (m > 0)   return { label: 'Beginner', color: '#64748B', icon: Circle };
  return { label: 'Not Started', color: '#9CA3AF', icon: Circle };
};

// Badge definitions
const BADGES = [
  { id: 'first_steps', name: 'First Steps', icon: '🎯', desc: 'Answer your first question', check: (s) => s.totalAnswered >= 1 },
  { id: 'streak_3',    name: 'On a Roll',    icon: '🔥', desc: '3-day learning streak',   check: (s) => s.streak >= 3 },
  { id: 'streak_7',    name: 'Week Warrior', icon: '⚡', desc: '7-day learning streak',   check: (s) => s.streak >= 7 },
  { id: 'perfect_5',   name: 'Perfect Five', icon: '💎', desc: 'Get 5 in a row correct',   check: (s) => s.bestStreak >= 5 },
  { id: 'points_100',  name: 'Century',      icon: '💯', desc: 'Earn 100 points',         check: (s) => s.points >= 100 },
  { id: 'points_500',  name: 'High Scorer',  icon: '🏆', desc: 'Earn 500 points',         check: (s) => s.points >= 500 },
  { id: 'master_one',  name: 'Skill Master', icon: '👑', desc: 'Master your first skill', check: (s) => s.masteredSkills >= 1 },
  { id: 'master_five', name: 'Quintuple',    icon: '🌟', desc: 'Master 5 skills',         check: (s) => s.masteredSkills >= 5 },
  { id: 'explorer',    name: 'Explorer',     icon: '🗺️', desc: 'Try all 4 subjects',      check: (s) => s.subjectsTried >= 4 },
];

// ---------- URL ROUTING HELPERS ----------
const _gradeToSlug   = (id)   => id === 'k' ? 'kindergarten' : `grade-${id}`;
const _slugToGradeId = (slug) => slug === 'kindergarten' ? 'k' : slug.startsWith('grade-') ? slug.slice(6) : null;
const _toSkillSlug   = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Reverse slug → skill lookup (built once at module load)
const SKILL_BY_SLUG = Object.fromEntries(Object.values(SKILLS).map(s => [_toSkillSlug(s.title), s]));

// Parse any URL pathname into { view, gradeId?, subject?, skillId? }
const parseLearnPath = (pathname) => {
  const exact = {
    '/student': 'dashboard', '/parent': 'parent', '/admin': 'admin',
    '/subscription': 'subscription', '/subscription/success': 'subscription-success',
    '/subscription/cancel': 'subscription',
  };
  if (exact[pathname]) return { view: exact[pathname] };
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean);
  if (parts[0] === 'learn') {
    const subject  = parts[1];
    const gradeId  = parts[2] ? _slugToGradeId(parts[2]) : null;
    const slugStr  = parts[3];
    if (gradeId && subject && slugStr) {
      const skill = SKILL_BY_SLUG[slugStr];
      if (skill) return { view: 'skill', gradeId, subject: skill.subject, skillId: skill.id };
    }
    if (gradeId && subject && SUBJECTS[subject]) return { view: 'subject', gradeId, subject };
    if (gradeId) return { view: 'grade', gradeId };
  }
  return { view: 'home' };
};

// Build the URL path for any view + context combination
const learnPath = (v, grade, subj, skill) => {
  if (v === 'skill'   && grade && subj && skill) return `/learn/${subj}/${_gradeToSlug(grade.id)}/${_toSkillSlug(skill.title)}`;
  if (v === 'subject' && grade && subj)          return `/learn/${subj}/${_gradeToSlug(grade.id)}`;
  if (v === 'grade'   && grade)                  return `/learn/${_gradeToSlug(grade.id)}`;
  const fixed = { dashboard: '/student', parent: '/parent', admin: '/admin', subscription: '/subscription' };
  return fixed[v] || '/';
};

// ---------- MAIN APP ----------
export default function WijsApp() {
  // Persistent app state — initialize view + context from the current URL so deep links work
  const [_init]           = useState(() => parseLearnPath(window.location.pathname));
  const [view, setView]   = useState(() => _init.view || 'home'); // home | learning | practice | reports | dashboard | parent | admin | subscription | grade | subject | skill | badges
  const [user, setUser]   = useState({ name: 'Learner', role: 'student' });
  const [selectedGrade,   setSelectedGrade]   = useState(() => _init.gradeId ? GRADES.find(g => g.id === _init.gradeId) || null : null);
  const [selectedSubject, setSelectedSubject] = useState(() => _init.subject || null);
  const [activeSkill,     setActiveSkill]     = useState(() => _init.skillId ? SKILLS[_init.skillId] || null : null);

  // Progress is keyed by skillId → { attempts, correct, history, asked }
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(emptyStats);
  const [authReady, setAuthReady] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);
  const pushToast = useCallback((msg, kind = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  useEffect(() => {
    loadSavedSession().then(saved => {
      if (saved) {
        setUser(saved.user);
        setProgress(saved.progress || {});
        setStats({ ...emptyStats, ...(saved.stats || {}) });
        pushToast(`Welcome back, ${saved.user.name || saved.user.username}!`, 'success');
      }
      setAuthReady(true);
    });
  }, [pushToast]);

  useEffect(() => {
    if (!authReady || !user?.username) return;
    saveLearningState(user, progress, stats);
  }, [authReady, user, progress, stats]);


  const recordAnswer = (skillId, questionId, correct, difficulty) => {
    // 1. Update skill progress
    setProgress(prev => {
      const sp = prev[skillId] || { attempts: 0, correct: 0, history: [], asked: [] };
      return {
        ...prev,
        [skillId]: {
          attempts: sp.attempts + 1,
          correct: sp.correct + (correct ? 1 : 0),
          history: [...sp.history, correct],
          asked: sp.asked.includes(questionId) ? sp.asked : [...sp.asked, questionId],
          lastPracticed: new Date().toISOString(),
        },
      };
    });

    // 2. Update global stats
    setStats(prev => {
      const newRunStreak = correct ? prev.currentRunStreak + 1 : 0;
      const points = correct ? (5 + difficulty * 3) : 1; // even wrong attempts get 1 point for trying
      return {
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
        points: prev.points + points,
        currentRunStreak: newRunStreak,
        bestStreak: Math.max(prev.bestStreak, newRunStreak),
      };
    });
  };

  // Recalculate mastered skills + subjects tried whenever progress changes
  useEffect(() => {
    const masteredCount = Object.entries(progress)
      .filter(([id, p]) => calcMastery(p) >= 85).length;
    const subjects = new Set(Object.keys(progress).map(id => SKILLS[id]?.subject).filter(Boolean));
    setStats(prev => {
      if (prev.masteredSkills === masteredCount && prev.subjectsTried === subjects.size) return prev;
      return { ...prev, masteredSkills: masteredCount, subjectsTried: subjects.size };
    });
  }, [progress]);

  // Badge awarding
  useEffect(() => {
    const newlyEarned = BADGES.filter(b => b.check(stats) && !stats.earnedBadges.includes(b.id));
    if (newlyEarned.length) {
      setStats(prev => ({ ...prev, earnedBadges: [...prev.earnedBadges, ...newlyEarned.map(b => b.id)] }));
      newlyEarned.forEach(b => pushToast(`🏅 Badge unlocked: ${b.name}!`, 'success'));
    }
  }, [stats, pushToast]);

  // ----- BROWSER HISTORY (back / forward button) -----
  const _histMounted  = useRef(false);
  const _histFromPop  = useRef(false);

  // Restore state when the user hits the browser back/forward button
  useEffect(() => {
    const init = parseLearnPath(window.location.pathname);
    window.history.replaceState(
      { view: init.view, selectedGradeId: init.gradeId || null, selectedSubject: init.subject || null, activeSkillId: init.skillId || null },
      '',
      window.location.pathname
    );
    const onPop = (e) => {
      _histFromPop.current = true;
      const v = e.state?.view || parseLearnPath(window.location.pathname).view;
      setView(v);
      setSelectedGrade(e.state?.selectedGradeId ? GRADES.find(g => g.id === e.state.selectedGradeId) || null : null);
      setSelectedSubject(e.state?.selectedSubject || null);
      setActiveSkill(e.state?.activeSkillId ? SKILLS[e.state.activeSkillId] || null : null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Push a history entry whenever the view (or related state) changes
  useEffect(() => {
    if (!_histMounted.current) { _histMounted.current = true; return; }
    if (_histFromPop.current)  { _histFromPop.current  = false; return; }
    window.history.pushState({
      view,
      selectedGradeId: selectedGrade?.id || null,
      selectedSubject: selectedSubject   || null,
      activeSkillId:   activeSkill?.id   || null,
    }, '', learnPath(view, selectedGrade, selectedSubject, activeSkill));
  }, [view, selectedGrade, selectedSubject, activeSkill]);

  // ----- ROUTING HANDLERS -----
  const goHome = () => { setView('home'); setSelectedGrade(null); setSelectedSubject(null); setActiveSkill(null); };
  const goLearning = () => { setView('learning'); setSelectedGrade(null); setSelectedSubject(null); setActiveSkill(null); };
  const goSignIn = () => { setView('signin'); setSelectedGrade(null); setSelectedSubject(null); setActiveSkill(null); };
  const applyAccountSession = (session, verb = 'Signed in') => {
    setUser(session.user);
    setProgress(session.progress || {});
    setStats({ ...emptyStats, ...(session.stats || {}) });
    setView('dashboard');
    pushToast(`${verb} as ${session.user.name || session.user.username}. Progress is saved.`, 'success');
  };
  const handleSignIn = async (credentials) => {
    const session = await signInAccount(credentials);
    applyAccountSession(session, 'Signed in');
  };
  const handleCreateAccount = async (details) => {
    const session = await createAccount(details);
    applyAccountSession(session, 'Account created');
  };
  const handleRoleChange = (role) => {
    setUser(prev => ({ ...(prev || { name: 'Learner' }), role }));
    const name = user?.name;
    pushToast(`Welcome, ${name || 'Learner'}! 🎉`, 'success');
  };
  const handleLogout = () => {
    clearSavedSession();
    setUser({ name: 'Learner', role: 'student' });
    setProgress({});
    setStats(emptyStats);
    goHome();
  };

  // ----- RENDER -----
  return (
    <div style={styles.app}>
      <StyleInjector />

      <Header
        user={user}
        view={view}
        onHome={goHome}
        onLearning={goLearning}
        onSignIn={goSignIn}
        onRoleChange={handleRoleChange}
        onPractice={() => setView('practice')}
        onDashboard={() => setView('dashboard')}
        onParent={() => setView('parent')}
        onReports={() => setView('reports')}
        onAdmin={() => setView('admin')}
        onBadges={() => setView('badges')}
        onSubscribe={() => setView('subscription')}
        onReset={handleLogout}
        onSelectGrade={(g) => { setSelectedGrade(g); setView('grade'); }}
        onPickSkill={(skill) => {
          setSelectedGrade(GRADES.find(g => g.id === skill.grade));
          setSelectedSubject(skill.subject);
          setActiveSkill(skill);
          setView('skill');
        }}
      />

      <main style={styles.main}>
        {view === 'learning'  && <LearningCatalogScreen
                                    progress={progress}
                                    onGoToSubject={(grade, subject) => {
                                      setSelectedGrade(grade);
                                      setSelectedSubject(subject);
                                      setView('subject');
                                    }}
                                  />}
        {view === 'practice'  && <PracticeHub
                                    progress={progress}
                                    onPickSkill={(skill) => {
                                      setSelectedGrade(GRADES.find(g => g.id === skill.grade));
                                      setSelectedSubject(skill.subject);
                                      setActiveSkill(skill);
                                      setView('skill');
                                    }}
                                  />}
        {view === 'home'      && <HomeScreen
                                    user={user}
                                    stats={stats}
                                    progress={progress}
                                    onSelectGrade={(g) => { setSelectedGrade(g); setView('grade'); }}
                                    onDashboard={() => setView('dashboard')}
                                    onSignIn={goSignIn}
                                    onAbout={() => setView('about')}
                                  />}
        {view === 'grade'     && selectedGrade && <GradeScreen
                                    grade={selectedGrade}
                                    onBack={goHome}
                                    onSelectSubject={(s) => { setSelectedSubject(s); setView('subject'); }}
                                    progress={progress}
                                  />}
        {view === 'subject'   && selectedGrade && selectedSubject && <SubjectScreen
                                    grade={selectedGrade}
                                    subject={selectedSubject}
                                    onBack={() => setView('grade')}
                                    onSelectSkill={(skill) => { setActiveSkill(skill); setView('skill'); }}
                                    onSelectGrade={(g) => { setSelectedGrade(g); setView('grade'); }}
                                    progress={progress}
                                  />}
        {view === 'skill'     && activeSkill && <SkillScreen
                                    skill={activeSkill}
                                    progress={progress[activeSkill.id]}
                                    onBack={() => setView('subject')}
                                    onAnswer={recordAnswer}
                                    onComplete={(msg) => pushToast(msg, 'success')}
                                  />}
        {view === 'dashboard' && <Dashboard
                                    title="Student Dashboard"
                                    user={user}
                                    stats={stats}
                                    progress={progress}
                                    onPickSkill={(skill) => {
                                      setSelectedGrade(GRADES.find(g => g.id === skill.grade));
                                      setSelectedSubject(skill.subject);
                                      setActiveSkill(skill);
                                      setView('skill');
                                    }}
                                  />}
        {view === 'parent'    && <ParentDashboard
                                    stats={stats}
                                    progress={progress}
                                    onReports={() => setView('reports')}
                                    onPractice={() => setView('practice')}
                                  />}
        {view === 'reports'   && <ProgressReports
                                    stats={stats}
                                    progress={progress}
                                    onPractice={() => setView('practice')}
                                  />}
        {view === 'subscription' && <SubscriptionScreen
                                    onBack={goHome}
                                    user={user}
                                    pushToast={pushToast}
                                  />}
        {view === 'subscription-success' && (
          <div style={{ ...styles.container, textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h1 style={{ ...styles.dashHeroTitle, marginBottom: 12 }} className="dash-hero-title">You&apos;re all set!</h1>
            <p style={{ color: '#64748B', marginBottom: 28, fontSize: 16 }}>Your subscription is now active. Happy learning!</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setView('subscription')} style={styles.secondaryAction}>View my plan</button>
              <button onClick={goHome} style={styles.primaryAction}>Start learning</button>
            </div>
          </div>
        )}
        {view === 'admin'     && <AdminContentManagement
                                    onPractice={() => setView('practice')}
                                    onReports={() => setView('reports')}
                                  />}
        {view === 'badges'    && <BadgesScreen stats={stats} onBack={goHome} />}
        {view === 'signin'    && <SignInScreen onSignIn={handleSignIn} onCreateAccount={handleCreateAccount} onJoin={() => setView('subscription')} onBack={goHome} />}
        {view === 'about'     && <AboutScreen onBack={goHome} />}
      </main>

      {/* Toasts */}
      <div style={styles.toastContainer}>
        {toasts.map(t => (
          <div key={t.id} style={{
            ...styles.toast,
            background: t.kind === 'success' ? '#059669' : t.kind === 'error' ? '#DC2626' : '#8FD9FB',
          }}>
            {t.msg}
          </div>
        ))}
      </div>

      <Footer onAbout={() => setView('about')} />
    </div>
  );
}

// ---------- HEADER ----------
function Header({ user, view, onHome, onLearning, onSignIn, onRoleChange, onPractice, onDashboard, onParent, onReports, onAdmin, onBadges, onSubscribe, onReset, onSelectGrade, onPickSkill }) {
  const [menuOpen, setMenuOpen]           = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchOpen, setSearchOpen]       = useState(false);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 769) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const searchRef = useRef(null);
  const [openNav,  setOpenNav]  = useState(null);
  const timerRef = useRef(null);

  const openDrop  = (key) => { clearTimeout(timerRef.current); setOpenNav(key); };
  const closeDrop = ()    => { timerRef.current = setTimeout(() => setOpenNav(null), 160); };
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Build suggestions from SKILLS + SUBJECTS + GRADES
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results = [];
    // Skills
    Object.values(SKILLS).filter(s => s.title.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach(s => results.push({ kind: 'skill', label: s.title, sub: `${SUBJECTS[s.subject]?.label || s.subject} · ${GRADES.find(g => g.id === s.grade)?.label || s.grade}`, data: s }));
    // Subjects
    Object.entries(SUBJECTS).filter(([, v]) => v.label.toLowerCase().includes(q))
      .forEach(([k, v]) => results.push({ kind: 'subject', label: v.label, sub: v.tagline, data: k }));
    // Grades
    GRADES.filter(g => g.label.toLowerCase().includes(q))
      .forEach(g => results.push({ kind: 'grade', label: g.label, sub: 'Browse all skills', data: g }));
    return results.slice(0, 8);
  }, [searchQuery]);

  const isSignedIn = !!user?.username;
  const firstName  = isSignedIn ? (user.name || user.username).split(' ')[0] : null;

  const ACT = () => { onLearning(); setOpenNav(null); };
  const learningMega = [
    {
      col: 'subjects',
      items: [
        { label: 'Math',          icon: <Calculator size={17}/>,   inlineLinks: ['Skills','Lessons','Videos','Games'], extra: { label: 'Fluency Zone', badge: 'New!' }, act: ACT },
        { label: 'Language arts', icon: <BookOpen size={17}/>,     inlineLinks: ['Skills','Videos','Games'],           act: ACT },
        { label: 'Science',                    icon: <FlaskConical size={17}/>, act: ACT },
        { label: 'Social studies',             icon: <Globe2 size={17}/>,       act: ACT },
        { label: 'Computer Science for kids',  icon: <Cpu size={17}/>,          comingSoon: true },
        { label: 'Coding for kids',            icon: <Code2 size={17}/>,        comingSoon: true },
      ],
    },
    {
      col: 'recommendations',
      items: [{ label: 'Recommendations', icon: <Star size={17}/>,    blockLinks: ['Recommendations wall'], act: ACT }],
    },
    {
      col: 'skillplans',
      items: [{ label: 'Skill plans', icon: <BarChart3 size={17}/>,   blockLinks: ['IXL plans','Georgia state standards','Textbooks','Test prep'], act: ACT }],
    },
    {
      col: 'awards',
      items: [{ label: 'Awards', icon: <Trophy size={17}/>,           blockLinks: ['Student awards'], act: ACT }],
    },
  ];

  const navItems = [
    {
      key: 'learning', label: 'Learning', onClick: onLearning,
      active: ['learning', 'grade', 'subject', 'skill'].includes(view),
      hasMega: true,
    },
    { key: 'practice', label: 'Practice', onClick: onPractice,  active: view === 'practice'  },
    ...(isSignedIn && user?.role === 'student' ? [
      { key: 'student', label: 'Student', onClick: onDashboard, active: view === 'dashboard' },
    ] : []),
    ...(isSignedIn && user?.role === 'parent' ? [
      { key: 'parent',  label: 'Parent',  onClick: onParent,    active: view === 'parent'    },
    ] : []),
    { key: 'reports',  label: 'Reports',  onClick: onReports,   active: view === 'reports'   },
    { key: 'takeoff',  label: 'Takeoff',  onClick: onBadges,    active: view === 'badges', icon: <Sparkles size={14} /> },
  ];

  const closeMenu = (fn) => { fn(); setMenuOpen(false); };

  return (
    <header style={hStyles.header}>

      {/* ── Row 1: logo | search | role toggles | actions | hamburger ── */}
      <div style={hStyles.topRow}>

        {/* Logo */}
        <button onClick={onHome} style={hStyles.logo}>
          <img src="/assets/kids/logo_v.png" alt="WIJS" style={{ height: 80, width: 'auto', display: 'block' }} />
        </button>

        {/* Search bar */}
        <div ref={searchRef} style={{ position: 'relative', flex: '1 1 auto', maxWidth: 400, minWidth: 180 }} className="h-search">
          <div
            style={{ ...hStyles.searchBar, flex: 'unset', maxWidth: 'unset', minWidth: 'unset', width: '100%', boxSizing: 'border-box' }}
            className={searchFocused ? 'h-search-focus' : ''}
            onFocus={() => { setSearchFocused(true); setSearchOpen(true); }}
            onBlur={() => setSearchFocused(false)}
          >
            <span style={hStyles.searchIconWrap}><Search size={16} color="#6B7280" /></span>
            <input
              style={hStyles.searchInput}
              placeholder="Search topics, skills, and more"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
            />
            {searchQuery && (
              <button style={hStyles.searchSubmit} onClick={() => { setSearchQuery(''); setSearchOpen(false); }} aria-label="Clear">
                <X size={14} color="#9CA3AF" />
              </button>
            )}
            {!searchQuery && (
              <button style={hStyles.searchSubmit} aria-label="Search">
                <ChevronRight size={18} color="#9CA3AF" />
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {searchOpen && suggestions.length > 0 && (
            <div style={hStyles.suggestPanel}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  style={hStyles.suggestItem}
                  className="h-suggest-item"
                  onMouseDown={e => {
                    e.preventDefault();
                    if (s.kind === 'skill')   { onPickSkill(s.data); }
                    if (s.kind === 'grade')   { onSelectGrade(s.data); }
                    if (s.kind === 'subject') { onLearning(); }
                    setSearchQuery(''); setSearchOpen(false);
                  }}
                >
                  <span style={hStyles.suggestIcon}>
                    {s.kind === 'skill'   && <BookOpen size={13} color="#6B7280" />}
                    {s.kind === 'subject' && <Star size={13} color="#6B7280" />}
                    {s.kind === 'grade'   && <GraduationCap size={13} color="#6B7280" />}
                  </span>
                  <div style={hStyles.suggestText}>
                    <span style={hStyles.suggestLabel}>{s.label}</span>
                    <span style={hStyles.suggestSub}>{s.sub}</span>
                  </div>
                  <span style={hStyles.suggestKind}>{s.kind}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Student / Parent role toggle */}
        <div style={hStyles.roleGroup} className="h-actions">
          {[
            { id: 'student', label: 'Student', icon: GraduationCap, onClick: onDashboard },
            { id: 'parent',  label: 'Parent',  icon: Heart,          onClick: onParent   },
          ].map(role => {
            const Icon  = role.icon;
            const isActive = user?.role === role.id;
            return (
              <button
                key={role.id}
                onClick={() => { onRoleChange(role.id); role.onClick(); }}
                style={{ ...hStyles.roleBtn, ...(isActive ? hStyles.roleBtnActive : {}) }}
              >
                <Icon size={13} />
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sign In */}
        <button onClick={onSignIn} style={hStyles.signInBtn} className="h-actions">
          <UserCircle size={16} />
          <span>{isSignedIn ? firstName : 'Sign In'}</span>
        </button>

        {/* Membership / Sign out */}
        {isSignedIn
          ? <button onClick={onReset} style={{ ...hStyles.membershipBtn, background: '#EF4444' }} className="h-actions">Sign out</button>
          : <button onClick={onSubscribe} style={hStyles.membershipBtn} className="h-actions">Membership</button>
        }

        {/* Hamburger — mobile only */}
        <button
          className="h-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          style={hStyles.hamburger}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Row 2: nav links ── */}
      <nav style={hStyles.navRow} className="h-nav" aria-label="Primary">
        {navItems.map(item => (
          <div
            key={item.key}
            style={{ position: 'relative' }}
            onMouseEnter={() => (item.hasMega || item.hasDropdown) && openDrop(item.key)}
            onMouseLeave={() => (item.hasMega || item.hasDropdown) && closeDrop()}
          >
            <button
              onClick={() => { item.onClick(); setOpenNav(null); }}
              style={{ ...hStyles.navLink, ...(item.active ? hStyles.navActive : {}) }}
            >
              {item.label}
              {(item.hasMega || item.hasDropdown) && <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.6 }}>▾</span>}
              {item.icon && <span style={{ marginLeft: 5, display: 'inline-flex', alignItems: 'center' }}>{item.icon}</span>}
              {item.active && <span style={hStyles.navCaret} />}
            </button>

            {/* Standard small dropdown */}
            {item.hasDropdown && openNav === item.key && (
              <div
                style={hStyles.dropdown}
                onMouseEnter={() => openDrop(item.key)}
                onMouseLeave={closeDrop}
              >
                {item.items.map(d => (
                  <button key={d.label} onClick={d.act} className="h-drop-item" style={hStyles.dropItem}>
                    <span style={hStyles.dropIcon}>{d.icon}</span>
                    <div>
                      <div style={hStyles.dropLabel}>{d.label}</div>
                      <div style={hStyles.dropSub}>{d.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Mega menu for Learning */}
            {item.hasMega && openNav === item.key && (
              <div
                style={hStyles.megaPanel}
                onMouseEnter={() => openDrop(item.key)}
                onMouseLeave={closeDrop}
              >
                {learningMega.map((col, ci) => (
                  <div key={col.col} style={{ ...hStyles.megaCol, ...(ci === 0 ? { minWidth: 220, paddingRight: 40 } : ci === 1 ? { minWidth: 220, paddingLeft: 36, paddingRight: 40, borderLeft: '1px solid #E9ECEF' } : ci === 2 ? { minWidth: 240, paddingLeft: 36, paddingRight: 44, borderLeft: '1px solid #E9ECEF' } : { minWidth: 180, paddingLeft: 36, borderLeft: '1px solid #E9ECEF' }) }}>
                    {col.items.map(entry => (
                      <div key={entry.label} style={hStyles.megaGroup}>
                        {/* Heading row */}
                        {entry.comingSoon ? (
                          <div style={{ ...hStyles.megaHeading, opacity: 0.55, cursor: 'default', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={hStyles.megaHeadingIcon}>{entry.icon}</span>
                            <span>{entry.label}</span>
                            <span style={{ fontSize: 10, fontWeight: 800, background: '#F59E0B', color: '#fff', borderRadius: 4, padding: '1px 5px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Soon</span>
                          </div>
                        ) : (
                        <button onClick={entry.act} style={hStyles.megaHeading} className="mega-heading">
                          <span style={hStyles.megaHeadingIcon}>{entry.icon}</span>
                          <span>{entry.label}</span>
                        </button>
                        )}

                        {/* Inline bullet links (Math, Language arts style) */}
                        {entry.inlineLinks && entry.inlineLinks.length > 0 && (
                          <div style={hStyles.megaInlineLinks}>
                            {entry.inlineLinks.map((lk, li) => (
                              <span key={lk} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                {li > 0 && <span style={hStyles.megaBullet}>•</span>}
                                <button onClick={entry.act} className="mega-link" style={hStyles.megaInlineLink}>{lk}</button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Extra item with badge (Fluency Zone New!) */}
                        {entry.extra && (
                          <div style={{ paddingLeft: 28, marginTop: 2 }}>
                            <button onClick={entry.act} className="mega-link" style={{ ...hStyles.megaInlineLink, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              {entry.extra.label}
                              {entry.extra.badge && <span style={hStyles.megaBadge}>{entry.extra.badge}</span>}
                            </button>
                          </div>
                        )}

                        {/* Block links — one per line (Skill plans, Recommendations, Awards) */}
                        {entry.blockLinks && entry.blockLinks.length > 0 && (
                          <div style={hStyles.megaBlockLinks}>
                            {entry.blockLinks.map(lk => (
                              <button key={lk} onClick={entry.act} className="mega-link" style={hStyles.megaBlockLink}>{lk}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <nav style={hStyles.mobileMenu}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => closeMenu(item.onClick)}
              style={{ ...hStyles.mobileLink, ...(item.active ? hStyles.mobileLinkActive : {}) }}
            >
              {item.label}
              {item.icon && <span style={{ marginLeft: 6, display: 'inline-flex', alignItems: 'center' }}>{item.icon}</span>}
            </button>
          ))}
          <div style={hStyles.mobileDivider} />
          <button onClick={() => closeMenu(onSignIn)}    style={hStyles.mobileLink}>{isSignedIn ? firstName : 'Sign In'}</button>
          <button onClick={() => closeMenu(onSubscribe)} style={{ ...hStyles.mobileLink, fontWeight: 700, color: '#525AFF' }}>Membership</button>
        </nav>
      )}
    </header>
  );
}

// eslint-disable-next-line no-unused-vars
function StatChip({ icon, value, label, color }) {
  return (
    <div style={{ ...styles.statChip, borderColor: color, color }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      <strong style={{ marginLeft: 4 }}>{value}</strong>
      <span style={{ marginLeft: 4, color: '#6B7280', fontSize: 12, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ---------- LOGIN ----------
// eslint-disable-next-line no-unused-vars
function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginCard} className="login-card">
        <div style={styles.loginHero}>
          <div style={styles.loginLogo}>
            <Sparkles size={36} strokeWidth={2.5} />
          </div>
          <h1 style={styles.loginTitle}>WIJS</h1>
          <p style={styles.loginSub}>Where every kid becomes a learning champion</p>
        </div>

        <div style={{ marginTop: 32 }}>
          <label style={styles.fieldLabel}>What's your name?</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Type your first name"
            style={styles.input}
            onKeyDown={e => e.key === 'Enter' && onLogin(name, role)}
          />

          <label style={{ ...styles.fieldLabel, marginTop: 16 }}>I'm a...</label>
          <div style={styles.roleGrid} className="role-grid">
            {[
              { id: 'student', label: 'Student', icon: GraduationCap, color: '#525AFF' },
              { id: 'parent',  label: 'Parent',  icon: Heart, color: '#525AFF' },
              { id: 'teacher', label: 'Teacher', icon: Users, color: '#6D8BC0' },
              { id: 'admin',   label: 'Admin',   icon: Settings, color: '#475569' },
            ].map(r => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    ...styles.roleBtn,
                    borderColor: active ? r.color : '#E5E7EB',
                    background: active ? r.color : 'white',
                    color: active ? 'white' : '#374151',
                  }}
                >
                  <Icon size={20} />
                  <span style={{ marginTop: 6, fontSize: 13, fontWeight: 600 }}>{r.label}</span>
                </button>
              );
            })}
          </div>

          <button onClick={() => onLogin(name, role)} style={styles.primaryBtn}>
            Start Learning <ArrowRight size={18} />
          </button>

          <p style={styles.loginNote}>
            Demo mode — all progress is saved for this session.
          </p>
        </div>
      </div>

      <div style={styles.loginBg}>
        <FloatingShape style={{ top: '10%', left: '8%', background: '#525AFF', size: 80 }} delay={0} />
        <FloatingShape style={{ top: '20%', right: '12%', background: '#8FD9FB', size: 110 }} delay={1.5} />
        <FloatingShape style={{ bottom: '15%', left: '15%', background: '#A78BFA', size: 70 }} delay={0.8} />
        <FloatingShape style={{ bottom: '25%', right: '8%', background: '#6D8BC0', size: 95 }} delay={2.2} />
      </div>
    </div>
  );
}

function FloatingShape({ style, delay }) {
  return (
    <div style={{
      position: 'absolute',
      width: style.size, height: style.size,
      borderRadius: '50%',
      background: style.background,
      opacity: 0.18,
      top: style.top, left: style.left, right: style.right, bottom: style.bottom,
      animation: `float 6s ease-in-out ${delay}s infinite`,
      filter: 'blur(2px)',
    }}/>
  );
}

// ---------- HOME ----------
function HomeScreen({ user, stats, progress, onSelectGrade, onDashboard, onSignIn, onAbout }) {
  const accuracy = stats.totalAnswered > 0
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;
  const useScreenshotRedesign = true;

  if (useScreenshotRedesign) {
    return (
      <RedesignedHomeScreen
        user={user}
        stats={stats}
        progress={progress}
        accuracy={accuracy}
        onSelectGrade={onSelectGrade}
        onDashboard={onDashboard}
        onSignIn={onSignIn}
        onAbout={onAbout}
      />
    );
  }

  return (
    <div style={styles.container} className="resp-container">
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.heroBadge}>
            <Sparkles size={14} /> <span>Welcome back!</span>
          </div>
          <h1 style={styles.heroTitle}>
            Hi <span style={styles.heroName}>{user?.name}</span> —<br />
            ready to <span style={styles.heroEmphasis}>level up</span>?
          </h1>
          <p style={styles.heroDesc}>
            Pick your grade, choose a subject, and start practicing. Earn points, unlock badges,
            and track your mastery on every skill.
          </p>
          <div style={styles.heroStats}>
            <HeroStat value={stats.points} label="Total Points" color="#525AFF" />
            <HeroStat value={`${accuracy}%`} label="Accuracy" color="#059669" />
            <HeroStat value={stats.streak} label="Day Streak" color="#6D8BC0" />
          </div>
        </div>
        <div style={styles.heroRight}>
          <DashboardPreview stats={stats} progress={progress} onClick={onDashboard} />
        </div>
      </section>

      {/* Grade selector */}
      <section style={{ marginTop: 56 }}>
        <SectionHeader title="Choose your grade" subtitle="From Kindergarten through Grade 12" />
        <div style={styles.gradeGrid}>
          {GRADES.map(g => {
            const skillCount = Object.values(SKILLS).filter(s => s.grade === g.id).length;
            const completedCount = Object.values(SKILLS)
              .filter(s => s.grade === g.id)
              .filter(s => calcMastery(progress[s.id]) > 0).length;
            return (
              <button
                key={g.id}
                onClick={() => onSelectGrade(g)}
                style={{ ...styles.gradeCard, '--grade-color': g.color }}
                className="grade-card"
              >
                <div style={{ ...styles.gradeEmoji, background: `${g.color}22` }}>{g.emoji}</div>
                <div style={styles.gradeLabel}>{g.label}</div>
                <div style={styles.gradeMeta}>
                  {skillCount > 0 ? `${completedCount}/${skillCount} started` : 'Coming soon'}
                </div>
                <div style={{ ...styles.gradeAccent, background: g.color }} />
              </button>
            );
          })}
        </div>
      </section>

      {/* Subject overview */}
      <section style={{ marginTop: 56 }}>
        <SectionHeader title="Subjects we offer" subtitle="Comprehensive curriculum across all four core areas" />
        <div style={styles.subjectGrid}>
          {Object.entries(SUBJECTS).map(([key, sub]) => {
            const Icon = sub.icon;
            return (
              <div key={key} style={{ ...styles.subjectCard, background: sub.bg }}>
                <div style={{ ...styles.subjectIcon, background: sub.color }}>
                  <Icon size={28} color="white" strokeWidth={2.2} />
                </div>
                <h3 style={styles.subjectTitle}>{sub.label}</h3>
                <p style={styles.subjectTag}>{sub.tagline}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Motivational strip */}
      <section style={styles.motivStrip}>
        <div style={styles.motivItem}>
          <Trophy size={28} color="#525AFF" />
          <div>
            <div style={styles.motivLabel}>{BADGES.length} Badges to Earn</div>
            <div style={styles.motivSub}>Unlock by hitting milestones</div>
          </div>
        </div>
        <div style={styles.motivItem}>
          <Flame size={28} color="#6D8BC0" />
          <div>
            <div style={styles.motivLabel}>Daily Streaks</div>
            <div style={styles.motivSub}>Practice every day to keep it growing</div>
          </div>
        </div>
        <div style={styles.motivItem}>
          <Crown size={28} color="#525AFF" />
          <div>
            <div style={styles.motivLabel}>Skill Mastery</div>
            <div style={styles.motivSub}>Reach 85%+ to fully master a skill</div>
          </div>
        </div>
        <div style={styles.motivItem}>
          <Brain size={28} color="#8FD9FB" />
          <div>
            <div style={styles.motivLabel}>Adaptive Practice</div>
            <div style={styles.motivSub}>Questions adjust to your skill level</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function WelcomePopup({ onSignIn, onClose }) {
  const floaters = [
    { emoji: '📚', top: '10%', left: '8%',  delay: '0s',   dur: '3.2s' },
    { emoji: '✏️', top: '18%', right: '9%', delay: '0.4s', dur: '2.8s' },
    { emoji: '🌟', top: '70%', left: '6%',  delay: '0.8s', dur: '3.6s' },
    { emoji: '🎯', top: '65%', right: '7%', delay: '0.2s', dur: '3.0s' },
    { emoji: '🏆', top: '40%', left: '4%',  delay: '1.0s', dur: '2.6s' },
    { emoji: '🎨', top: '35%', right: '5%', delay: '0.6s', dur: '3.4s' },
    { emoji: '🔬', top: '80%', left: '20%', delay: '1.2s', dur: '2.9s' },
    { emoji: '🌈', top: '12%', left: '45%', delay: '0.3s', dur: '3.1s' },
  ];

  const features = [
    { emoji: '🎓', label: 'Expert Curriculum', sub: 'Grades K – 5' },
    { emoji: '🕹️', label: 'Interactive Practice', sub: '50+ skills' },
    { emoji: '📊', label: 'Progress Tracking', sub: 'Real-time reports' },
    { emoji: '🏅', label: 'Badges & Rewards', sub: 'Stay motivated' },
  ];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,20,40,0.62)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'popupFadeIn 0.35s ease both',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* floating decorations */}
      {floaters.map((f, i) => (
        <span
          key={i}
          style={{
            position: 'fixed', fontSize: 28, userSelect: 'none', pointerEvents: 'none',
            top: f.top, left: f.left, right: f.right,
            animation: `floatEmoji ${f.dur} ${f.delay} ease-in-out infinite`,
            opacity: 0.55,
          }}
        >{f.emoji}</span>
      ))}

      {/* card */}
      <div style={{
        background: 'linear-gradient(160deg, #ffffff 0%, #f0fdf4 60%, #eff6ff 100%)',
        borderRadius: 28, maxWidth: 580, width: '100%',
        padding: '44px 40px 36px', position: 'relative', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
        animation: 'popupSlideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        {/* decorative top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'linear-gradient(90deg, #525AFF, #6D8BC0, #A78BFA)' }} />

        {/* close button */}
        <button
          onClick={onClose}
          className="popup-close"
          style={{
            position: 'absolute', top: 16, right: 16,
            background: '#f3f4f6', border: 'none', borderRadius: '50%',
            width: 36, height: 36, cursor: 'pointer', fontSize: 18, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6B7280', transition: 'all 0.18s ease',
          }}
          aria-label="Close"
        >✕</button>

        {/* mascot + headline */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontSize: 72, lineHeight: 1, marginBottom: 12,
            animation: 'mascotBounce 2s ease-in-out infinite',
            display: 'inline-block',
          }}>🦉</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#dcfce7', color: '#166534', borderRadius: 999,
            padding: '4px 14px', fontSize: 12, fontWeight: 800, letterSpacing: 0.8,
            textTransform: 'uppercase', marginBottom: 14,
          }}>✨ Free for Kids</div>
          <h2 style={{
            fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, margin: '0 0 10px',
            color: '#1a1a2e', lineHeight: 1.15,
          }}>
            Learn at Your Own Pace.<br />
            <span style={{ color: '#525AFF', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              Practice Until You Master It.
            </span>
          </h2>
          <p style={{ fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
            The fun, adaptive learning platform built for K–12 students. Pick a grade, choose a skill, and watch your confidence grow — one question at a time.
          </p>
        </div>

        {/* feature pills */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
          {features.map(f => (
            <div
              key={f.label}
              className="popup-feature"
              style={{
                background: 'white', borderRadius: 14, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                cursor: 'default',
              }}
            >
              <span style={{ fontSize: 24 }}>{f.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a2e' }}>{f.label}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onSignIn}
          className="popup-trial-btn"
          style={{
            width: '100%', background: 'linear-gradient(135deg, #525AFF, #6D8BC0)',
            color: 'white', border: 'none', borderRadius: 999,
            padding: '16px 24px', fontSize: 17, fontWeight: 900, cursor: 'pointer',
            animation: 'pulseGlow 2.4s ease-in-out infinite, trailBounce 3s ease-in-out infinite',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            marginBottom: 12, letterSpacing: 0.3,
          }}
        >🚀 Join Free Trial — Start Learning Today!</button>

        <button
          onClick={onClose}
          className="popup-later"
          style={{
            display: 'block', width: '100%', background: 'none', border: 'none',
            color: '#9CA3AF', fontSize: 13, cursor: 'pointer', textAlign: 'center',
            transition: 'color 0.15s ease', padding: '4px 0',
          }}
        >Maybe later</button>
      </div>
    </div>
  );
}

function RedesignedHomeScreen({ user, stats, progress, accuracy, onSelectGrade, onDashboard, onSignIn, onAbout }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [faqExpanded, setFaqExpanded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('wijs.popup.shown')) return;
    const t = setTimeout(() => setShowPopup(true), 900);
    return () => clearTimeout(t);
  }, []);

  const closePopup = () => { setShowPopup(false); sessionStorage.setItem('wijs.popup.shown', '1'); };
  const handleTrial = () => { closePopup(); if (onSignIn) onSignIn(); };

  const artS = {
    page: { background: '#F5FBFF', color: '#1C1215', width: '100%', overflowX: 'hidden' },
    hero: { background: '#E0F6FE', padding: '72px 0 80px', width: '100%', display: 'flex', justifyContent: 'center' },
    heroInner: { maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, flexWrap: 'wrap', boxSizing: 'border-box' },
    heroLeft: { maxWidth: 560, flex: '0 1 480px', minWidth: 280 },
    welcomePill: { display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E0F4FF', color: '#3A41CC', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 700, marginBottom: 20 },
    h1: { fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 8px', color: '#1C1215' },
    h1em: { fontStyle: 'italic', fontFamily: 'Georgia, serif', color: '#525AFF' },
    heroPara: { fontSize: 17, color: '#6B5E55', margin: '16px 0 28px', lineHeight: 1.6 },
    heroBtn: { background: '#525AFF', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 32px', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(82,90,255,0.32)' },
    tagsRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 },
    tag: { borderRadius: 999, padding: '5px 14px', fontSize: 13, fontWeight: 700 },
    heroVisual: { position: 'relative', flex: '0 1 580px', maxWidth: 620, minWidth: 280, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    subjectStack: { width: 300, position: 'relative', userSelect: 'none', zIndex: 2 },
    avatarRing: { width: 220, height: 220, borderRadius: '50%', background: '#E0F4FF', border: '5px solid #525AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, position: 'relative', boxShadow: '0 12px 40px rgba(82,90,255,0.18)', flexShrink: 0 },
    badgePill: { position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', background: '#F0FAFF', color: '#3A41CC', borderRadius: 999, padding: '6px 18px', fontSize: 12, fontWeight: 900, letterSpacing: 1, whiteSpace: 'nowrap' },
    programSec: { background: '#F5FBFF', padding: '64px 24px' },
    secWrap: { maxWidth: 1100, margin: '0 auto' },
    secLabel: { fontSize: 12, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', color: '#525AFF', marginBottom: 8 },
    secTitle: { fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, margin: '0 0 8px', color: '#1C1215' },
    secEm: { fontStyle: 'italic', fontFamily: 'Georgia, serif', color: '#525AFF' },
    secDesc: { fontSize: 16, color: '#6B5E55', margin: '0 0 40px', maxWidth: 560 },
    cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
    card: { borderRadius: 20, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden', cursor: 'pointer', border: 'none', textAlign: 'left', minHeight: 240 },
    cardGradeTag: { display: 'inline-block', background: 'rgba(255,255,255,0.55)', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700, alignSelf: 'flex-start' },
    cardTitle: { fontSize: 22, fontWeight: 900, margin: 0, color: '#1C1215' },
    cardSub: { fontSize: 14, color: '#6B5E55', margin: 0, fontStyle: 'italic', fontFamily: 'Georgia, serif' },
    cardArrow: { width: 36, height: 36, borderRadius: '50%', background: '#1C1215', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, alignSelf: 'flex-start', marginTop: 'auto', pointerEvents: 'none' },
    cardEmoji: { position: 'absolute', right: 20, bottom: 16, fontSize: 56, opacity: 0.28, pointerEvents: 'none' },
    gradesSec: { background: '#fff', padding: '56px 24px' },
    gradesRow: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 },
    gradeChip: { borderRadius: 999, padding: '8px 20px', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' },
    whySec: { background: '#F5FBFF', padding: '64px 24px' },
    whyGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 40 },
    whyCard: { background: '#fff', borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid #F0E6D6' },
    whyIcon: { width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
    whyTitle: { fontSize: 18, fontWeight: 800, margin: 0, color: '#1C1215' },
    whyText: { fontSize: 14, color: '#6B5E55', margin: 0, lineHeight: 1.6 },
    startSec: { background: '#fff', padding: '64px 24px' },
    startInner: { maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' },
    statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 28 },
    statCard: { background: '#F0FAFF', borderRadius: 14, padding: '20px 18px', border: '1px solid #E0F4FF' },
    statVal: { fontSize: 28, fontWeight: 900, color: '#525AFF', margin: 0 },
    statLabel: { fontSize: 13, color: '#6B5E55', margin: '4px 0 0' },
    readCard: { background: 'linear-gradient(135deg, #E0F4FF 0%, #F0FAFF 100%)', borderRadius: 20, padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid #B8E4FB' },
    readTitle: { fontSize: 26, fontWeight: 900, margin: 0, color: '#1C1215' },
    readSub: { fontSize: 14, color: '#6B5E55', margin: 0, lineHeight: 1.6 },
    readBtn: { alignSelf: 'flex-start', background: '#1C1215', color: '#fff', border: 'none', borderRadius: 999, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    ctaSec: { background: '#F5FBFF', padding: '64px 24px' },
    ctaCard: { maxWidth: 680, margin: '0 auto', background: 'linear-gradient(135deg, #F0FAFF 0%, #FFF7ED 100%)', borderRadius: 24, padding: '52px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, border: '1px solid #E8D5C4' },
    ctaTitle: { fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, margin: 0, color: '#1C1215' },
    ctaSub: { fontSize: 15, color: '#6B5E55', margin: 0 },
    ctaBtn: { background: '#525AFF', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 32px', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(82,90,255,0.32)' },
    contactSec: { background: '#fff', padding: '64px 24px', textAlign: 'center' },
    avatarsRow: { fontSize: 36, display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 },
    contactTitle: { fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 900, margin: '0 0 8px', color: '#1C1215' },
    contactSub: { fontSize: 15, color: '#6B5E55', margin: '0 0 28px' },
    contactBtns: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
    contactBtn: { borderRadius: 999, padding: '12px 28px', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' },
    faqSec: { background: '#F5FBFF', padding: '64px 24px 80px' },
    faqInner: { maxWidth: 720, margin: '40px auto 0' },
    faqItem: { background: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', border: '1px solid #F0E6D6' },
    faqQ: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 15, color: '#1C1215', background: 'none', border: 'none', width: '100%', textAlign: 'left', gap: 12 },
    faqA: { padding: '0 20px 16px', fontSize: 14, color: '#6B5E55', lineHeight: 1.7, margin: 0 },
    photosSec: { background: '#fff', padding: '72px 24px' },
    photosGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginTop: 36 },
    photoCard: { position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3', background: '#E5E7EB', boxShadow: '0 8px 28px rgba(0,0,0,0.10)' },
    photoImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' },
    photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)' },
    photoCaption: { color: '#fff', fontWeight: 800, fontSize: 16, margin: 0, lineHeight: 1.3 },
    photoTag: { display: 'inline-block', background: '#525AFF', color: '#fff', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 800, letterSpacing: 0.5, marginBottom: 6 },
  };

  const gradeColors = ['#FDE8BB','#FEF3C7','#D1FAE5','#CFFAFE','#E0F4FF','#FCE7F3','#FFE4E6','#FDE8BB','#FEF3C7','#D1FAE5','#E0F4FF','#FCE7F3','#FDE8BB','#CFFAFE'];


  return (
    <div style={artS.page}>
      {showPopup && <WelcomePopup onSignIn={handleTrial} onClose={closePopup} />}

      {/* ── Hero ── */}
      <section style={artS.hero} className="art-hero">
        <div style={artS.heroInner} className="art-hero-inner">
        <div style={artS.heroLeft} className="art-hero-left">
          <div style={artS.welcomePill}>✳ Welcome to WIJS Academy</div>
          <h1 style={artS.h1}>
            Learn<br /><em style={artS.h1em}>With WIJS</em>
          </h1>
          <p style={artS.heroPara}>
            A personalized K–12 learning platform with thousands of practice skills across Math, Language Arts, Science, and Social Studies — from Kindergarten all the way to Grade 12.
          </p>
          <button onClick={() => onSelectGrade(GRADES[0])} style={artS.heroBtn}>
            Start learning ↗
          </button>

          {/* About me punchline quotation */}
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'flex-start', gap: 12, maxWidth: 480 }}>
            <span style={{ fontSize: 72, lineHeight: 0.8, color: '#4AB5B5', flexShrink: 0, fontFamily: 'Georgia, serif', fontWeight: 900, marginTop: 6 }}>"</span>
            <p style={{ margin: 0, fontSize: 17, color: '#3D3580', lineHeight: 1.7, fontStyle: 'italic', fontWeight: 600 }}>
              When learning feels like play, kids absorb more and develop a lasting love for discovery.{' '}
              <button onClick={onAbout} style={{ background: 'none', border: 'none', padding: 0, color: '#525AFF', fontWeight: 700, fontSize: 17, cursor: 'pointer', textDecoration: 'underline', fontStyle: 'normal' }}>Read our story →</button>
            </p>
          </div>

          {/* App store download badges */}
          <div className="app-badges-row" style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            {/* App Store */}
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#000', color: '#fff', borderRadius: 10, padding: '9px 18px', textDecoration: 'none', minWidth: 148, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.19 1.28-2.17 3.82.03 3.02 2.65 4.03 2.68 4.04l-.06.26zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 9, fontWeight: 500, opacity: 0.85, letterSpacing: 0.3 }}>Download on the</div>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.2 }}>App Store</div>
              </div>
            </a>
            {/* Google Play */}
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#000', color: '#fff', borderRadius: 10, padding: '9px 18px', textDecoration: 'none', minWidth: 162, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.18 23.76c.3.16.64.2.97.11l11.64-11.64L12.17 8.6 3.18 23.76z" fill="#EA4335"/>
                <path d="M20.48 10.56l-2.73-1.57-3.34 3.34 3.34 3.34 2.76-1.59c.79-.45.79-1.97-.03-3.52z" fill="#FBBC04"/>
                <path d="M3.18.24C2.85.07 2.48.07 2.16.27L15.79 12.23l3.62-3.62L3.18.24z" fill="#4285F4"/>
                <path d="M2.16 23.73c.32.2.69.2 1.02.03l13.23-7.58-3.24-3.24L2.16 23.73z" fill="#34A853"/>
              </svg>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 9, fontWeight: 500, opacity: 0.85, letterSpacing: 0.3 }}>Get it on</div>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.2 }}>Google Play</div>
              </div>
            </a>
          </div>

          <div style={artS.tagsRow} className="art-tags-row">
            {[['#Math','#E0F4FF'],['#Science','#F0FAFF'],['#ELA','#F0FAFF'],['#History','#F1F5F9']].map(([tag, bg]) => (
              <span key={tag} style={{ ...artS.tag, background: bg }}>{tag}</span>
            ))}
          </div>
        </div>
        {/* ── Hero visual: illustrated kids scene + subject cards ── */}
        <div style={artS.heroVisual} className="art-hero-right">

          <img
            src="/assets/kids/wijs_1.png"
            alt="WIJS learning app preview"
            style={{ width: '100%', maxWidth: 480, borderRadius: 24, display: 'block', objectFit: 'contain' }}
          />

        </div>
        </div>{/* end heroInner */}
      </section>

      {/* ── Program cards ── */}
      <section style={artS.programSec} className="art-section">
        <div style={artS.secWrap} className="art-section-wrap">
          <div style={artS.secLabel}>Our Programs</div>
          <h2 style={artS.secTitle}>Browse subjects &amp; <em style={artS.secEm}>grade levels</em></h2>
          <p style={artS.secDesc}>Every skill is aligned to standards and built to help students master core concepts at their own pace.</p>
          <div style={artS.cardsGrid} className="art-cards-grid">
            {[
              { bg: '#E0F4FF', grade: 'Grades K – 3', title: 'Math', sub: 'Numbers, geometry & problem solving', emoji: '🔢' },
              { bg: '#F0FAFF', grade: 'Grades 4 – 8', title: 'Language Arts', sub: 'Reading, writing & comprehension', emoji: '📖' },
              { bg: '#F0FAFF', grade: 'Grades K – 5', title: 'Science', sub: 'Life, earth, chemistry & physics', emoji: '🔬' },
            ].map((card) => (
              <button key={card.title} style={{ ...artS.card, background: card.bg }} onClick={() => onSelectGrade(GRADES[0])}>
                <span style={artS.cardGradeTag}>{card.grade}</span>
                <div>
                  <p style={artS.cardTitle}>{card.title}</p>
                  <p style={artS.cardSub}>{card.sub}</p>
                </div>
                <div style={artS.cardArrow}>↗</div>
                <span style={artS.cardEmoji}>{card.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── All Grades ── */}
      <section style={artS.gradesSec} className="art-section">
        <div style={artS.secWrap} className="art-section-wrap">
          <div style={artS.secLabel}>All Grade Levels</div>
          <h2 style={artS.secTitle}>From Kindergarten to <em style={artS.secEm}>Grade 12</em></h2>
          <div style={artS.gradesRow} className="art-grades-row">
            {GRADES.map((g, i) => (
              <button key={g.id} style={{ ...artS.gradeChip, background: gradeColors[i] || '#E5E7EB', color: '#1a1a2e' }} onClick={() => onSelectGrade(g)}>
                {g.name}
              </button>
            ))}
            <span style={{ ...artS.gradeChip, background: '#E0F2FE', color: '#075985', cursor: 'default' }}>
              💻 Computer Science for kids — coming soon
            </span>
            <span style={{ ...artS.gradeChip, background: '#F0FDF4', color: '#166534', cursor: 'default' }}>
              🖥️ Coding for kids — coming soon
            </span>
          </div>
        </div>
      </section>

      {/* ── Why Choose ── */}
      <section style={artS.whySec} className="art-section">
        <div style={artS.secWrap} className="art-section-wrap">
          <div style={artS.secLabel}>Why WIJS</div>
          <h2 style={artS.secTitle}>Built for every <em style={artS.secEm}>learner</em></h2>
          <div style={artS.whyGrid} className="art-why-grid">
            {[
              { icon: '📚', bg: '#E0F4FF', title: 'Full K–12 Curriculum', text: 'Every subject, every grade. Math, Language Arts, Science, and Social Studies with thousands of practice questions.' },
              { icon: '🎯', bg: '#F0FAFF', title: 'Adaptive Learning', text: 'WIJS adjusts question difficulty in real time based on student responses for maximum growth.' },
              { icon: '⭐', bg: '#F0F9FF', title: 'Expert Content', text: 'All questions are built and reviewed by certified educators and aligned to Common Core and state standards.' },
            ].map((item) => (
              <div key={item.title} style={artS.whyCard}>
                <div style={{ ...artS.whyIcon, background: item.bg }}>{item.icon}</div>
                <h3 style={artS.whyTitle}>{item.title}</h3>
                <p style={artS.whyText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Photo Gallery ── */}
      <section style={artS.photosSec} className="art-section art-photos-sec">
        <div style={artS.secWrap} className="art-section-wrap">
          <div style={artS.secLabel}>Learning in Action</div>
          <h2 style={artS.secTitle}>Real students, <em style={artS.secEm}>real results</em></h2>
          <p style={artS.secDesc}>Thousands of students K–12 are building skills, boosting confidence, and loving learning every day.</p>
          <div style={artS.photosGrid} className="art-photos-grid">
            {[
              { src: '/assets/kids/kid.jpg',   tag: 'Math',           caption: 'Making numbers exciting for every student'    },
              { src: '/assets/kids/kid_1.png', tag: 'Early Learning', caption: 'Interactive lessons for our youngest learners' },
            ].map(({ src, tag, caption }) => (
              <div key={src} style={artS.photoCard} className="art-photo-card">
                <img
                  src={src}
                  alt={caption}
                  style={artS.photoImg}
                  loading="lazy"
                  onError={e => { e.currentTarget.style.opacity = '0.3'; }}
                />
                <div style={artS.photoOverlay}>
                  <span style={artS.photoTag}>{tag}</span>
                  <p style={artS.photoCaption}>{caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Start Now + Stats ── */}
      <section style={artS.startSec} className="art-section">
        <div style={artS.startInner} className="art-start-inner">
          <div>
            <div style={artS.secLabel}>Get Started</div>
            <h2 style={artS.secTitle}>Start practicing <em style={artS.secEm}>today</em></h2>
            <p style={{ ...artS.secDesc, marginBottom: 0 }}>Thousands of skills available across all grades. Track progress, earn badges, and build mastery.</p>
            <div style={artS.statsGrid} className="art-stats-row">
              {[
                { val: '500+', label: 'Skills available' },
                { val: '13',  label: 'Grade levels (K–12)' },
                { val: stats.points || 0,        label: 'Your points' },
                { val: stats.totalAnswered || 0, label: 'Questions answered' },
              ].map((s) => (
                <div key={s.label} style={artS.statCard}>
                  <p style={artS.statVal}>{s.val}</p>
                  <p style={artS.statLabel}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={artS.readCard}>
            <div style={{ fontSize: 40 }}>🎓</div>
            <h3 style={artS.readTitle}>Ready to <em style={{ fontStyle: 'italic', fontFamily: 'Georgia,serif', color: '#525AFF' }}>explore</em> skills?</h3>
            <p style={artS.readSub}>Pick a grade level to see all available practice skills and begin your learning journey.</p>
            <button onClick={() => onSelectGrade(GRADES[0])} style={artS.readBtn}>Browse all grades ↗</button>
          </div>
        </div>
      </section>

      {/* ── Sign Up CTA + Contact (same row) ── */}
      <section style={{ background: '#F5FBFF', padding: '64px 24px' }} className="art-section">
        <div className="art-cta-contact-row" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 24, alignItems: 'stretch' }}>

          {/* CTA card */}
          <div style={{ ...artS.ctaCard, flex: 1, margin: 0 }} className="art-cta-card">
            <div style={{ fontSize: 52 }}>👧</div>
            <h2 style={artS.ctaTitle}>Sign up for <em style={{ fontStyle: 'italic', fontFamily: 'Georgia,serif', color: '#525AFF' }}>Free Practice</em></h2>
            <p style={artS.ctaSub}>Join thousands of students already learning with WIJS.</p>
            <button onClick={onDashboard} style={artS.ctaBtn}>Get started ↗</button>
          </div>

          {/* Contact card */}
          <div style={{ flex: 1, background: '#fff', borderRadius: 24, padding: '52px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, border: '1px solid #E8D5C4' }}>
            <div style={artS.avatarsRow}><span>👩‍🏫</span><span>👦</span><span>👧</span></div>
            <h2 style={artS.contactTitle}>We are open <em style={{ fontStyle: 'italic', fontFamily: 'Georgia,serif', color: '#525AFF' }}>to talking</em></h2>
            <p style={artS.contactSub}>Have questions about WIJS? Reach out — we're here to help.</p>
            <div style={artS.contactBtns}>
              <button onClick={onDashboard} style={{ ...artS.contactBtn, background: '#525AFF', color: '#fff' }}>Contact us</button>
              <button onClick={onDashboard} style={{ ...artS.contactBtn, background: '#F0FAFF', color: '#3A41CC' }}>Call us</button>
              <button onClick={onDashboard} style={{ ...artS.contactBtn, background: '#F0FAFF', color: '#525AFF' }}>Video chat</button>
            </div>
          </div>

        </div>
      </section>

      {/* ── About Us punchline ── */}
      <section style={{ background: '#F0FAFF', padding: '64px 24px', textAlign: 'center' }} className="art-section">
        <div style={artS.secWrap}>
          <div style={artS.secLabel}>Our Story</div>
          <h2 style={artS.secTitle}>Built by a <em style={artS.secEm}>parent</em>, for every child</h2>
          <p style={{ fontSize: 16, color: '#6B5E55', maxWidth: 600, margin: '16px auto 28px', lineHeight: 1.7 }}>
            "When learning feels like play, kids absorb more and develop a lasting love for discovery." — A WIJS parent
          </p>
          <button onClick={onAbout} style={{ background: 'none', border: '2px solid #525AFF', color: '#525AFF', borderRadius: 999, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Read →
          </button>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={artS.faqSec} className="art-section">
        <div style={{ ...artS.secWrap, textAlign: 'center' }}>
          <div style={artS.secLabel}>FAQ</div>
          <h2 style={artS.secTitle}>Common <em style={artS.secEm}>questions</em></h2>
        </div>
        <div style={artS.faqInner}>
          {(faqExpanded ? faqs : faqs.slice(0, 3)).map((faq, i) => (
            <div key={i} style={artS.faqItem}>
              <button style={artS.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <ChevronRight size={20} style={{ flexShrink: 0, color: openFaq === i ? '#525AFF' : '#9CA3AF', transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease, color 0.2s ease' }} />
              </button>
              {openFaq === i && <p style={artS.faqA}>{faq.a}</p>}
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={() => { setFaqExpanded(e => !e); setOpenFaq(null); }}
              style={{ background: 'none', border: '1.5px solid #525AFF', color: '#525AFF', borderRadius: 999, padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {faqExpanded ? 'Show less' : `Show ${faqs.length - 3} more questions`}
                <ChevronDown size={16} style={{ transform: faqExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
              </span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

// ---------- ABOUT US ----------
function AboutScreen({ onBack }) {
  return (
    <div style={{ background: '#F5FBFF', minHeight: '100vh', padding: '0 0 80px' }}>
      {/* Hero banner */}
      <div style={{ background: 'linear-gradient(135deg, #525AFF 0%, #4AB5B5 100%)', padding: '64px 24px 72px', textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8, marginBottom: 12 }}>Our Story</div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.1 }}>About <em style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>WIJS</em></h1>
        <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 520, margin: '0 auto' }}>A platform born from a parent's belief that every child deserves to love learning.</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 0' }}>
        {/* Quote block */}
        <div style={{ background: '#E0F4FF', borderLeft: '4px solid #525AFF', borderRadius: '0 12px 12px 0', padding: '20px 24px', marginBottom: 40 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#1C1215', margin: 0, fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>
            "When learning feels like play, kids absorb more and develop a lasting love for discovery."
          </p>
        </div>

        {/* Story paragraphs */}
        {[
          'As a parent, I\'m always looking for tools that help my child truly grow. Since starting an online learning app, the difference has been remarkable — my kid\'s confidence, curiosity, and skills have grown week after week, especially in Math, ELA, and Science. Concepts that once felt overwhelming now click with ease, and best of all, my child actually looks forward to learning time.',
          'My goal is simple: help kids learn new skills in a fun, joyful way. Learning should never feel stressful or forced. Kids are naturally curious, and we should capitalize on that curiosity to guide them. When learning feels like play, kids absorb more and develop a lasting love for discovery.',
          'That\'s why I want to share my experience with other parents — to help your kids strengthen their skills in Math, ELA, and Science while building confidence and a genuine love for learning. The right app can turn screen time into growth time. Let\'s nurture our kids\' curiosity together and help them thrive.',
        ].map((para, i) => (
          <p key={i} style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.8, marginBottom: 24 }}>{para}</p>
        ))}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '40px 0', justifyContent: 'center' }}>
          {[['500+', 'Skills available'], ['13', 'Grade levels'], ['4', 'Core subjects'], ['K–12', 'Coverage']].map(([val, label]) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #B8E4FB', borderRadius: 16, padding: '24px 32px', textAlign: 'center', flex: '1 1 130px', minWidth: 120 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#525AFF' }}>{val}</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button onClick={onBack} style={{ background: '#525AFF', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 36px', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(82,90,255,0.32)' }}>
            Start learning ↗
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- SIGN IN ----------
function SignInScreen({ onSignIn, onCreateAccount, onJoin, onBack }) {
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submitAccount = async () => {
    setError('');
    setBusy(true);
    try {
      if (mode === 'create') {
        await onCreateAccount({ username, password, name, role });
      } else {
        await onSignIn({ username, password });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const features = [
    { icon: '🌐', color: '#525AFF', title: 'Comprehensive K-12 Curriculum',
      text: 'More than 17,000 adaptive skills designed to support and challenge every learner' },
    { icon: '📊', color: '#8FD9FB', title: 'Real-Time Diagnostic',
      text: "Up-to-date, accurate assessment of students' knowledge levels in math and language arts" },
    { icon: '🎯', color: '#525AFF', title: 'Personalized Guidance',
      text: 'Targeted skill recommendations help address learning gaps and accelerate growth' },
    { icon: '📈', color: '#6D8BC0', title: 'Actionable Analytics',
      text: 'Easy-to-use reports provide real-time insight into student progress' },
  ];

  const footerLinks = ['About us','Company','Membership','Blog','Help center','Tell us what you think','Testimonials','Careers','Contact us','Terms of service','Privacy policy'];

  return (
    <div>
      {/* ── Hero with illustrated landscape ── */}
      <div style={styles.siHero}>
        {/* Left decorations */}
        <span style={{ ...styles.siDeco, left: '7%',  top: '18%', fontSize: 52 }}>🌍</span>
        <span style={{ ...styles.siDeco, left: '16%', top: '4%',  fontSize: 42 }}>🎈</span>
        <span style={{ ...styles.siDeco, left: '4%',  bottom: '22%', fontSize: 48 }}>🎡</span>
        <span style={{ ...styles.siDeco, left: '24%', bottom: '14%', fontSize: 36 }}>🌲</span>
        <span style={{ ...styles.siDeco, left: '12%', bottom: '10%', fontSize: 32 }}>🏙️</span>
        {/* Right decorations */}
        <span style={{ ...styles.siDeco, right: '14%', top: '6%',   fontSize: 42 }}>✈️</span>
        <span style={{ ...styles.siDeco, right: '6%',  top: '28%',  fontSize: 38 }}>📖</span>
        <span style={{ ...styles.siDeco, right: '22%', top: '16%',  fontSize: 32 }}>🧬</span>
        <span style={{ ...styles.siDeco, right: '18%', bottom: '14%', fontSize: 38 }}>🏠</span>
        <span style={{ ...styles.siDeco, right: '5%',  bottom: '18%', fontSize: 42 }}>🔬</span>
        <span style={{ ...styles.siDeco, right: '10%', bottom: '10%', fontSize: 36 }}>🔭</span>

        {/* Sign-in card */}
        <div style={styles.siCard}>
          <h2 style={styles.siCardTitle}>{mode === 'create' ? 'Create your account' : 'Sign in'}</h2>
          <p style={{ margin: '-8px 0 18px', color: '#64748B', fontSize: 14 }}>
            {mode === 'create'
              ? 'Choose a username and password to save your WIJS progress.'
              : 'Log in to keep practicing where you left off.'}
          </p>

          {mode === 'create' && (
            <>
              <div style={styles.siField}>
                <label style={styles.siLabel}>Display name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={styles.siInput}
                  autoComplete="name"
                  placeholder="Your name"
                />
              </div>
              <div style={styles.siField}>
                <label style={styles.siLabel}>Account type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {['student', 'parent', 'admin'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRole(option)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 10,
                        border: role === option ? '2px solid #525AFF' : '1px solid #D1D5DB',
                        background: role === option ? '#F0FAFF' : 'white',
                        color: role === option ? '#525AFF' : '#334155',
                        fontWeight: 800,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={styles.siField}>
            <div style={styles.siFieldRow}>
              <label style={styles.siLabel}>Username</label>
              {mode === 'signin' && <span style={styles.siForgot}>Forgot username?</span>}
            </div>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={styles.siInput}
              autoComplete="username"
              placeholder="Choose a username"
            />
          </div>

          <div style={styles.siField}>
            <div style={styles.siFieldRow}>
              <label style={styles.siLabel}>Password</label>
              <span style={styles.siForgot}>Forgot password?</span>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitAccount()}
              style={styles.siInput}
              autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
              placeholder={mode === 'create' ? 'At least 6 characters' : ''}
            />
          </div>

          {error && (
            <div style={{ padding: 10, borderRadius: 10, background: '#FEF2F2', color: '#B91C1C', fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div style={styles.siBtnRow}>
            <button onClick={submitAccount} disabled={busy} style={{ ...styles.siBtn, opacity: busy ? 0.65 : 1 }}>
              {busy ? 'Please wait...' : mode === 'create' ? 'Create account' : 'Sign in'}
            </button>
            <label style={styles.siRemember}>
              <input type="checkbox" style={{ marginRight: 5 }} />
              Remember
            </label>
          </div>

          <div style={styles.siLaunchCard}>
            {mode === 'create' ? 'Already have an account?' : 'New to WIJS?'}{' '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'create' ? 'signin' : 'create'); setError(''); }}
              style={{ border: 0, background: 'transparent', color: '#0076C0', fontWeight: 800, cursor: 'pointer' }}
            >
              {mode === 'create' ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </div>

        {/* Green hills at base */}
        <div style={styles.siHills} />
      </div>

      {/* ── Not a member yet? ── */}
      <div style={styles.siMemberSection}>
        <h2 style={styles.siNotMemberTitle}>Not a member yet?</h2>
        <p style={styles.siNotMemberSub}>Experience personalized learning with WIJS!</p>

        <div style={styles.siFeatureList}>
          {features.map(f => (
            <div key={f.title} style={styles.siFeatureRow}>
              <div style={{ ...styles.siFeatureIcon, background: f.color + '18', border: `2px solid ${f.color}33` }}>
                <span style={{ fontSize: 26 }}>{f.icon}</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ ...styles.siFeatureTitle, color: f.color }}>{f.title}</div>
                <div style={styles.siFeatureText}>{f.text}</div>
              </div>
            </div>
          ))}
        </div>

        <p style={styles.siCelebrate}>
          Plus, celebrate success with <strong>fun awards</strong>, and much more!
        </p>
        <button onClick={onJoin} style={styles.siJoinBtn}>Join WIJS today</button>
      </div>

      {/* ── Sign-in footer ── */}
      <div style={styles.siFooter}>
        <div style={styles.siFooterLinks}>
          {footerLinks.map((link, i) => (
            <span key={link}>
              {i > 0 && <span style={{ color: '#D1D5DB', margin: '0 5px' }}>|</span>}
              <span style={styles.siFooterLink}>{link}</span>
            </span>
          ))}
        </div>
        <div style={styles.siFooterCopy}>
          🎓 &nbsp;WIJS &nbsp;·&nbsp; © {new Date().getFullYear()} WIJS, LLC. All rights reserved.
        </div>
      </div>
    </div>
  );
}

// ---------- LEARNING CATALOG (IXL-style) ----------
function LearningCatalogScreen({ progress, onGoToSubject }) {
  const [activeSubject, setActiveSubject] = useState('math');
  const [activeView, setActiveView] = useState('Grades');
  const tabBarRef = useRef(null);

  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const GRADE_DISPLAY = {
    k:    { name: 'Kindergarten', badge: 'K'  },
    '1':  { name: 'First grade',  badge: '1'  },
    '2':  { name: 'Second grade', badge: '2'  },
    '3':  { name: 'Third grade',  badge: '3'  },
    '4':  { name: 'Fourth grade', badge: '4'  },
    '5':  { name: 'Fifth grade',  badge: '5'  },
  };

  const subjectTabs = [
    { id: 'math',            label: 'Math',                    short: 'Math',    icon: Calculator },
    { id: 'ela',             label: 'Language arts',           short: 'ELA',     icon: BookOpen },
    { id: 'science',         label: 'Science',                 short: 'Science', icon: FlaskConical },
    { id: 'social',          label: 'Social studies',          short: 'Social',  icon: Globe2 },
    { id: 'cs',              label: 'Computer Science',        short: 'CS',      icon: Cpu,      disabled: true, comingSoon: true },
    { id: 'coding',          label: 'Coding for kids',         short: 'Coding',  icon: Code2,    disabled: true, comingSoon: true },
    { id: 'recommendations', label: 'Recommendations',         short: 'Recs',    icon: Star,     special: true },
    { id: 'skillplans',      label: 'Skill plans',             short: 'Plans',   icon: BarChart3,special: true },
    { id: 'awards',          label: 'Awards',                  short: 'Awards',  icon: Trophy,   special: true },
  ];

  const viewTabs = ['Grades', 'Topics', 'Week by week', 'Skill plans'];

  const heroConfigs = {
    math: {
      title: 'WIJS Math',
      desc: 'Gain fluency and confidence in math! WIJS helps students master essential skills at their own pace through fun and interactive questions, built-in support, and motivating awards.',
      bg: 'linear-gradient(160deg, #C8EEFF 0%, #E0F8FF 50%, #B8F0E0 100%)',
      accent: '#1A8FD1',
      decoLeft: '🏰',
      decoRight: ['⛵', '📐', '🐟'],
      hillColor: '#5CBF72',
    },
    ela: {
      title: 'WIJS Language Arts',
      desc: 'Build strong reading, writing, and communication skills! Explore phonics, grammar, comprehension, and more through engaging interactive practice.',
      bg: 'linear-gradient(160deg, #FFE0EF 0%, #FFD0EC 50%, #FFE8F5 100%)',
      accent: '#C2147A',
      decoLeft: '📚',
      decoRight: ['✍️', '🖊️', '🦋'],
      hillColor: '#E84D9F',
    },
    science: {
      title: 'WIJS Science',
      desc: 'Explore the natural world! Discover living things, earth science, physics, and chemistry through hands-on practice questions.',
      bg: 'linear-gradient(160deg, #C8F0D0 0%, #D8F5DC 50%, #B8EBC8 100%)',
      accent: '#2A8C2E',
      decoLeft: '🔬',
      decoRight: ['⚗️', '🌿', '🧬'],
      hillColor: '#4CAF50',
    },
    social: {
      title: 'WIJS Social Studies',
      desc: 'Understand the world and its history! Geography, civics, economics, and history — all the knowledge you need to be an informed citizen.',
      bg: 'linear-gradient(160deg, #FFF0C0 0%, #FFF5CC 50%, #FFE8A0 100%)',
      accent: '#A06800',
      decoLeft: '🌍',
      decoRight: ['🏛️', '🗺️', '📜'],
      hillColor: '#DBA32A',
    },
  };

  const hero = heroConfigs[activeSubject] || heroConfigs.math;
  const subjectColor = SUBJECTS[activeSubject]?.color || '#525AFF';

  const getGradeSkills = (gradeId) =>
    Object.values(SKILLS).filter(s => s.grade === gradeId && s.subject === activeSubject);

  return (
    <div>
      {/* Subject Tabs */}
      <div className="lc-tab-bar-wrap">
      <div ref={tabBarRef} style={styles.lcSubjectBar} className="lc-tab-bar">
        <div style={{ ...styles.lcBarInner, alignItems: 'stretch', flexWrap: 'nowrap' }}>
          {subjectTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = tab.id === activeSubject;
            return (
              <button
                key={tab.id}
                className="lc-tab"
                onClick={() => !tab.disabled && setActiveSubject(tab.id)}
                disabled={tab.disabled}
                style={{
                  ...styles.lcSubjectTab,
                  ...(isActive ? { borderBottomColor: subjectColor, color: subjectColor, fontWeight: 700 } : {}),
                  ...(tab.disabled ? styles.lcSubjectTabDisabled : {}),
                }}
              >
                {Icon && <Icon size={18} strokeWidth={isActive ? 2.2 : 1.7} />}
                <span className="lc-tab-label" style={{ fontSize: 12, marginTop: 2 }}>{tab.label}</span>
                <span className="lc-tab-label-short" style={{ fontSize: 11, marginTop: 2 }}>{tab.short}</span>
                {tab.comingSoon && <span className="lc-soon-badge" style={{ fontSize: 9, fontWeight: 800, background: '#F59E0B', color: '#fff', borderRadius: 3, padding: '1px 4px', textTransform: 'uppercase', lineHeight: 1.2 }}>Soon</span>}
              </button>
            );
          })}
        </div>
      </div>
      </div>

      {/* View By Bar */}
      <div style={styles.lcViewBar}>
        <div style={{ ...styles.lcBarInner, gap: 2, padding: '6px 24px' }}>
          <span style={styles.lcViewLabel}>View by:</span>
          {viewTabs.map(v => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              style={{
                ...styles.lcViewTab,
                ...(activeView === v ? styles.lcViewTabActive : {}),
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{ ...styles.lcHero, background: hero.bg }}>
        {/* Sky clouds */}
        <div style={styles.lcCloud1} />
        <div style={styles.lcCloud2} />
        <div style={styles.lcCloud3} />
        {/* Left decoration */}
        <div style={styles.lcHeroDecoLeft}>
          <span style={{ fontSize: 72, lineHeight: 1, filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.10))' }}>{hero.decoLeft}</span>
        </div>
        {/* Center text */}
        <div style={styles.lcHeroCenter}>
          <h1 style={{ ...styles.lcHeroTitle, color: hero.accent }}>{hero.title}</h1>
          <p style={styles.lcHeroDesc}>{hero.desc}</p>
        </div>
        {/* Right decorations */}
        <div style={styles.lcHeroDecoRight}>
          {hero.decoRight.map((d, i) => (
            <span key={i} style={{ ...styles.lcDecoItem, fontSize: 36, animationDelay: `${i * 0.7}s` }}>{d}</span>
          ))}
        </div>
        {/* Landscape hills */}
        <div style={{ ...styles.lcHeroHillBack,  background: hero.hillColor, opacity: 0.18 }} />
        <div style={{ ...styles.lcHeroHillFront, background: hero.hillColor, opacity: 0.30 }} />
      </div>

      {/* Grade List */}
      <div style={styles.lcGradeList}>
        {GRADES.map(grade => {
          const display = GRADE_DISPLAY[grade.id];
          if (!display) return null;
          const skills = getGradeSkills(grade.id);
          return (
            <GradeSkillRow
              key={grade.id}
              grade={grade}
              display={display}
              skills={skills}
              onSelect={() => onGoToSubject(grade, activeSubject)}
            />
          );
        })}
      </div>
    </div>
  );
}

function GradeSkillRow({ grade, display, skills, onSelect }) {
  const sampleTitles = skills.slice(0, 6).map(s => s.title);
  return (
    <div style={styles.lcGradeRow} className="lc-grade-row">
      <div style={styles.lcGradeLeft}>
        <div style={{ ...styles.lcGradeBadge, background: grade.color }}>{display.badge}</div>
        <div style={styles.lcGradeInfo}>
          <div style={styles.lcGradeName}>{display.name}</div>
          <div style={styles.lcGradeSkills}>
            {sampleTitles.length > 0 ? (
              <>
                <span style={styles.lcIncludesLabel}>Includes: </span>
                {sampleTitles.map((title, i) => (
                  <span key={i}>
                    {i > 0 && <span style={styles.lcSkillSep}> | </span>}
                    <span style={styles.lcSkillLink}>{title}</span>
                  </span>
                ))}
              </>
            ) : (
              <span style={{ color: '#9CA3AF' }}>New skills coming soon</span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={onSelect}
        disabled={skills.length === 0}
        style={{ ...styles.lcSeeAllBtn, background: skills.length ? grade.color : '#E5E7EB', color: skills.length ? 'white' : '#9CA3AF' }}
      >
        See all {skills.length} skills &rsaquo;
      </button>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function LearningCloud({ title, color, lines }) {
  return (
    <div style={{ ...styles.learningCloud, borderColor: color }}>
      <strong style={{ color }}>{title}</strong>
      <span>{lines.join(' • ')}</span>
      <ChevronRight size={28} color={color} style={{ transform: 'rotate(90deg)', marginTop: 4 }} />
    </div>
  );
}


// eslint-disable-next-line no-unused-vars
function SkillTile({ skill, index }) {
  const subject = SUBJECTS[skill.subject];
  const Icon = subject.icon;
  return (
    <div style={styles.skillTile}>
      <div style={{ ...styles.skillTileIcon, background: subject.color }}>
        <Icon size={22} color="white" />
      </div>
      <strong>{skill.title}</strong>
      <span>{GRADES.find(g => g.id === skill.grade)?.label || 'Skill'} {index + 1}</span>
    </div>
  );
}


// eslint-disable-next-line no-unused-vars
function ImpactCard({ card }) {
  return (
    <div style={styles.impactCard}>
      <div style={styles.impactAvatar}><Users size={28} /></div>
      <h3>{card.title}</h3>
      <p>{card.text}</p>
      <button style={styles.impactButton}>Read more</button>
    </div>
  );
}

function HeroStat({ value, label, color }) {
  return (
    <div style={styles.heroStatCard}>
      <div style={{ ...styles.heroStatValue, color }}>{value}</div>
      <div style={styles.heroStatLabel}>{label}</div>
    </div>
  );
}

function DashboardPreview({ stats, progress, onClick }) {
  const skillCount = Object.keys(progress).length;
  const totalSkills = Object.keys(SKILLS).length;
  const accuracy = stats.totalAnswered > 0
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;

  return (
    <button onClick={onClick} style={styles.dashPreview}>
      <div style={styles.dashPreviewHead}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#374151' }}>Your Progress</span>
        <BarChart3 size={16} color="#6B7280" />
      </div>
      <div style={styles.dashRing}>
        <ProgressRing percentage={accuracy} size={130} />
        <div style={styles.dashRingLabel}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1F2937' }}>{accuracy}%</div>
          <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Accuracy</div>
        </div>
      </div>
      <div style={styles.dashStats}>
        <div style={styles.dashStatRow}>
          <span style={{ color: '#6B7280', fontSize: 13 }}>Skills explored</span>
          <strong>{skillCount}/{totalSkills}</strong>
        </div>
        <div style={styles.dashStatRow}>
          <span style={{ color: '#6B7280', fontSize: 13 }}>Mastered</span>
          <strong style={{ color: '#059669' }}>{stats.masteredSkills}</strong>
        </div>
        <div style={styles.dashStatRow}>
          <span style={{ color: '#6B7280', fontSize: 13 }}>Best run</span>
          <strong style={{ color: '#525AFF' }}>{stats.bestStreak} in a row</strong>
        </div>
      </div>
      <div style={styles.dashCTA}>View full dashboard <ChevronRight size={14} /></div>
    </button>
  );
}

function ProgressRing({ percentage, size = 80, stroke = 10, color = '#059669' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percentage / 100) * c;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#F3F4F6" strokeWidth={stroke} fill="none" />
      <circle
        cx={size/2} cy={size/2} r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

// ---------- GRADE SCREEN ----------
function GradeScreen({ grade, onBack, onSelectSubject, progress }) {
  return (
    <div style={styles.container} className="resp-container">
      <BackBtn onClick={onBack} label="Back to grades" />
      <div style={{ ...styles.gradeHeader, background: `linear-gradient(135deg, ${grade.color} 0%, ${grade.color}cc 100%)` }} className="grade-header">
        <div style={styles.gradeHeaderEmoji}>{grade.emoji}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, letterSpacing: 1 }}>YOU'RE EXPLORING</div>
          <h1 style={styles.gradeHeaderTitle} className="dash-hero-title">{grade.label}</h1>
          <p style={styles.gradeHeaderSub}>Choose a subject to dive into.</p>
        </div>
      </div>

      <div style={styles.subjectGrid}>
        {Object.entries(SUBJECTS).map(([key, sub]) => {
          const skills = getSkillsFor(grade.id, key);
          const Icon = sub.icon;
          const completed = skills.filter(s => calcMastery(progress[s.id]) >= 85).length;
          return (
            <button
              key={key}
              onClick={() => skills.length > 0 && onSelectSubject(key)}
              disabled={skills.length === 0}
              style={{
                ...styles.bigSubjectCard,
                background: skills.length === 0 ? '#F3F4F6' : sub.bg,
                cursor: skills.length === 0 ? 'not-allowed' : 'pointer',
                opacity: skills.length === 0 ? 0.6 : 1,
              }}
            >
              <div style={{ ...styles.subjectIcon, background: sub.color, width: 56, height: 56 }}>
                <Icon size={28} color="white" strokeWidth={2.2} />
              </div>
              <h3 style={styles.subjectTitle}>{sub.label}</h3>
              <p style={styles.subjectTag}>{sub.tagline}</p>
              {skills.length > 0 ? (
                <>
                  <div style={styles.subjectStats}>
                    <span><strong>{skills.length}</strong> skills</span>
                    <span><strong style={{ color: '#059669' }}>{completed}</strong> mastered</span>
                  </div>
                  <div style={styles.miniProgressBar}>
                    <div style={{
                      width: skills.length ? `${(completed / skills.length) * 100}%` : '0%',
                      background: sub.color,
                      ...styles.miniProgressFill,
                    }}/>
                  </div>
                  <span style={{ ...styles.subjectCTA, color: sub.color }}>
                    Start practicing <ArrowRight size={14} />
                  </span>
                </>
              ) : (
                <div style={{ ...styles.subjectStats, color: '#9CA3AF', fontStyle: 'italic' }}>Coming soon!</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- SUBJECT SCREEN ----------
function GradeSidebarItem({ g, isActive, label, fullLabel, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  const expanded = hovered;
  return (
    <button
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={fullLabel}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: 36,
        border: 'none',
        cursor: 'pointer',
        background: 'none',
        padding: 0,
        zIndex: expanded ? 10 : 1,
      }}
    >
      {/* Expanding pill behind circle */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: 36,
        borderRadius: 18,
        background: isActive ? '#2D1B69' : hovered ? g.color : 'transparent',
        width: expanded ? 'calc(100% + 0px)' : 36,
        minWidth: expanded ? 130 : 36,
        transition: 'min-width 0.18s ease, background 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        paddingRight: expanded ? 14 : 0,
      }}>
        {/* Circle dot */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: g.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 13, color: 'white',
          boxShadow: isActive ? `0 2px 10px ${g.color}80` : 'none',
          position: 'relative', zIndex: 1,
        }}>
          {label}
        </div>
        {/* Grade name text */}
        <span style={{
          fontSize: 13, fontWeight: 700, color: 'white',
          paddingLeft: 8, opacity: expanded ? 1 : 0,
          transition: 'opacity 0.12s ease 0.05s',
          pointerEvents: 'none',
        }}>
          {fullLabel}
        </span>
      </div>
      {/* Invisible spacer so button has correct width */}
      <div style={{ width: 36, height: 36, flexShrink: 0 }} />
    </button>
  );
}

function SubjectScreen({ grade, subject, onBack, onSelectSkill, progress, onSelectGrade }) {
  const sub = SUBJECTS[subject];
  const [viewBy, setViewBy] = useState('grades');
  const catalog = SKILL_CATALOG[`${subject}-${grade.id}`] || [];
  const totalSkills = catalog.reduce((n, sec) => n + sec.skills.length, 0);
  const totalVideos = Math.max(1, Math.floor(totalSkills * 0.9));
  const totalGames  = Math.max(1, Math.floor(totalSkills * 0.22));

  const handleSkillClick = (skillId) => {
    const skill = SKILLS[skillId];
    if (skill) { onSelectSkill(skill); } else {
      const fallback = getSkillsFor(grade.id, subject)[0];
      if (fallback) onSelectSkill(fallback);
    }
  };

  const gradeShort = { k: 'K', '1':'1', '2':'2', '3':'3', '4':'4', '5':'5' };
  const gradeFull  = { k: 'Kindergarten', '1':'First grade', '2':'Second grade', '3':'Third grade', '4':'Fourth grade', '5':'Fifth grade', '6':'Sixth grade', '7':'Seventh grade', '8':'Eighth grade', '9':'Ninth grade', '10':'Tenth grade', '11':'Eleventh grade', '12':'Twelfth grade' };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'inherit' }}>

      {/* ── Top nav bar ── */}
      <div style={{ borderBottom: '3px solid #E5E7EB', padding: '0 24px' }}>
        <div className="subject-nav-tabs" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24, paddingTop: 8 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6D8BC0', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            ← {grade.label}
          </button>
          <span style={{ color: '#D1D5DB', fontSize: 18 }}>|</span>
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>View by:</span>
          {['Grades', 'Topics', 'Week by week', 'Skill plans'].map(v => (
            <button key={v} onClick={() => setViewBy(v.toLowerCase())} style={{
              background: 'none', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '8px 4px',
              color: viewBy === v.toLowerCase() ? '#525AFF' : '#6D8BC0',
              borderBottom: viewBy === v.toLowerCase() ? '3px solid #525AFF' : '3px solid transparent',
              marginBottom: -3,
            }}>{v}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 0 }}>

        {/* ── Left grade sidebar ── */}
        <div className="subject-sidebar" style={{ width: 44, flexShrink: 0, paddingTop: 28, display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
          {GRADES.map(g => {
            const isActive = g.id === grade.id;
            return (
              <GradeSidebarItem
                key={g.id}
                g={g}
                isActive={isActive}
                label={gradeShort[g.id]}
                fullLabel={gradeFull[g.id]}
                onNavigate={() => onSelectGrade ? onSelectGrade(g) : onBack()}
              />
            );
          })}
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, paddingTop: 28, paddingLeft: 16 }}>

          {/* Page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, color: sub.color, margin: 0, lineHeight: 1.1 }}>
                {grade.label} {sub.label.toLowerCase()}
              </h1>
              <p style={{ fontSize: 14, color: '#6B7280', margin: '8px 0 0', maxWidth: 680, lineHeight: 1.5 }}>
                WIJS offers {grade.label} {sub.label.toLowerCase()} skills to explore and learn.
                Pick a skill to start practicing — your SmartScore will grow with every correct answer!
              </p>
            </div>
            {/* Stat bubbles */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { icon: '💎', label: `${totalSkills} skills` },
                { icon: '🎬', label: `${totalVideos} videos` },
                { icon: '🎮', label: `${totalGames} games` },
                { icon: '⚡', label: 'Fluency Zone', badge: 'NEW!' },
              ].map(item => (
                <button key={item.label} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  border: `2px solid ${sub.color}`, borderRadius: 999, padding: '8px 16px',
                  background: 'white', cursor: 'pointer', position: 'relative', minWidth: 80,
                }}>
                  {item.badge && (
                    <span style={{ position: 'absolute', top: -8, right: -4, background: '#059669', color: 'white', fontSize: 9, fontWeight: 900, borderRadius: 4, padding: '1px 5px' }}>
                      {item.badge}
                    </span>
                  )}
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: sub.color, whiteSpace: 'nowrap' }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Skill sections in 3-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '24px 32px', paddingBottom: 48, minWidth: 0 }}>
            {catalog.map((sec) => {
              return (
                <div key={sec.section}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: sub.color, margin: '0 0 6px', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontWeight: 900 }}>{sec.section}.</span> {sec.title}
                  </h2>
                  <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {sec.skills.map((sk, i) => {
                      const sp = progress[sk.skillId];
                      const mastery = calcMastery(sp);
                      const practiced = mastery > 0;
                      return (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, color: '#9CA3AF', width: 18, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                          <button onClick={() => handleSkillClick(sk.skillId)} style={{
                            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '3px 0',
                            fontSize: 14, color: sub.color, fontWeight: practiced ? 700 : 500,
                            lineHeight: 1.35, flex: 1,
                            textDecoration: 'underline', textDecorationColor: 'transparent',
                          }}
                          onMouseEnter={e => e.currentTarget.style.textDecorationColor = sub.color}
                          onMouseLeave={e => e.currentTarget.style.textDecorationColor = 'transparent'}
                          >
                            {practiced && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: mastery >= 85 ? '#059669' : sub.color, marginRight: 5, verticalAlign: 'middle' }} />}
                            {sk.title}
                          </button>
                          {practiced && (
                            <span style={{ fontSize: 11, color: mastery >= 85 ? '#059669' : sub.color, fontWeight: 700, flexShrink: 0 }}>{mastery}%</span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
            {catalog.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 48, color: '#9CA3AF' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
                <p style={{ fontSize: 16, fontWeight: 600 }}>Skills coming soon for {grade.label} {sub.label}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- SKILL PRACTICE SCREEN ----------
// ── Sound effects via Web Audio API (no external files needed) ─────────────
function useSoundEffect(muted) {
  return useCallback((type) => {
    if (muted) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const tone = (freq, start, dur, wave = 'sine', vol = 0.26) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = wave; osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.01);
      };
      if (type === 'correct')   { tone(523,0,0.12); tone(659,0.11,0.13); tone(784,0.22,0.25); }
      if (type === 'incorrect') { tone(330,0,0.08,'sawtooth',0.17); tone(220,0.1,0.25,'sawtooth',0.12); }
      if (type === 'complete')  { [523,659,784,1047].forEach((f,i) => tone(f,i*0.14,0.28,'sine',0.28)); }
      if (type === 'click')     { tone(880,0,0.04,'sine',0.07); }
      if (type === 'start')     { tone(440,0,0.09); tone(660,0.11,0.18); }
    } catch(_) {}
  }, [muted]);
}

// ── Confetti particles ──────────────────────────────────────────────────────
function Confetti({ active }) {
  if (!active) return null;
  const COLORS = ['#FF6B9D','#FFB627','#3DB2FF','#7DCE82','#9B5DE5','#FF8C42','#FFE44D','#00F5D4'];
  const pieces = Array.from({ length: 52 }, (_, i) => ({
    id: i,
    left: (4 + Math.random() * 92).toFixed(1),
    color: COLORS[i % COLORS.length],
    delay: (Math.random() * 0.95).toFixed(2),
    dur:   (1.5 + Math.random() * 1.1).toFixed(2),
    size:  Math.round(7 + Math.random() * 9),
    rot:   Math.round(Math.random() * 360),
    shape: i % 3,
  }));
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9999, overflow:'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:`${p.left}%`, top:-22,
          width:p.size, height:p.size,
          background:p.color,
          borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? 3 : 0,
          transform:`rotate(${p.rot}deg)`,
          animation:`confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}

// ── Stars that burst upward on correct answers ──────────────────────────────
function StarBurst({ trigger }) {
  const [items, setItems] = useState([]);
  const prev = useRef(0);
  useEffect(() => {
    if (!trigger || trigger === prev.current) return;
    prev.current = trigger;
    setItems([
      { id: trigger*10+1, x:-44, e:'⭐' },
      { id: trigger*10+2, x: 44, e:'🌟' },
      { id: trigger*10+3, x:  0, e:'✨' },
      { id: trigger*10+4, x:-62, e:'💫' },
      { id: trigger*10+5, x: 62, e:'⭐' },
    ]);
    const t = setTimeout(() => setItems([]), 800);
    return () => clearTimeout(t);
  }, [trigger]);
  return (
    <>
      {items.map((item, i) => (
        <div key={item.id} style={{
          position:'fixed', top:'42%',
          left:`calc(50% + ${item.x}px)`,
          fontSize:22, pointerEvents:'none', zIndex:500,
          animation:'starFloat 0.72s ease-out forwards',
          animationDelay:`${i * 0.055}s`,
        }}>{item.e}</div>
      ))}
    </>
  );
}

// ── Pip the Owl — mascot guide character ────────────────────────────────────
const PIP = {
  idle:        { face:'🦉', msg:"Ready when you are! 💪" },
  thinking:    { face:'🦉', msg:'Think it through...' },
  correct:     { face:'🎉', msg:'Amazing answer! ⭐' },
  incorrect:   { face:'😅', msg:"That's okay — keep going!" },
  celebrating: { face:'🏆', msg:"YOU DID IT! Incredible!" },
  encouraging: { face:'🦉', msg:'Almost there! You\'ve got this! 🌟' },
};

function Mascot({ state, visible }) {
  const [bubbleKey, setBubbleKey] = useState(0);
  const pip = PIP[state] || PIP.idle;

  useEffect(() => { setBubbleKey(k => k + 1); }, [state]);

  const faceAnim =
    state === 'correct' || state === 'celebrating' ? 'mascotBounce 0.5s ease 3' :
    state === 'incorrect' ? 'shake 0.42s ease' :
    'float 3s ease-in-out infinite';

  if (!visible) return null;
  return (
    <div style={{
      position:'fixed', bottom:20, right:14,
      display:'flex', flexDirection:'column', alignItems:'center',
      gap:6, zIndex:200, maxWidth:150,
      animation:'slideUp 0.4s ease',
      pointerEvents:'none',
    }}>
      <div key={bubbleKey} style={{
        background:'white', borderRadius:12, padding:'7px 11px',
        fontSize:12, fontWeight:700, color:'#374151',
        boxShadow:'0 4px 16px rgba(0,0,0,0.1)',
        textAlign:'center', lineHeight:1.4,
        border:'2px solid #F3F4F6',
        animation:'slideUp 0.25s ease',
      }}>
        {pip.msg}
      </div>
      <div style={{
        width:54, height:54, background:'white',
        borderRadius:'50%',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:30,
        boxShadow:'0 4px 18px rgba(0,0,0,0.13)',
        border:'3px solid #525AFF',
        animation: faceAnim,
      }}>
        {pip.face}
      </div>
    </div>
  );
}

// ── Mute button ─────────────────────────────────────────────────────────────
function MuteBtn({ muted, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={muted ? 'Unmute sounds' : 'Mute sounds'}
      style={{
        background:'none', border:'1.5px solid #E5E7EB',
        borderRadius:8, padding:'5px 9px',
        cursor:'pointer', fontSize:17, color:'#6B7280',
        transition:'border-color 0.15s',
      }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────────
function SkillScreen({ skill, progress, onBack, onAnswer, onComplete }) {
  const [phase, setPhase] = useState('intro'); // intro | practice | result
  const [currentQ, setCurrentQ] = useState(null);
  const [askedIds, setAskedIds] = useState([]);
  const [history, setHistory] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [questionsToAnswer] = useState(5);
  const [elapsed, setElapsed] = useState(0);
  const [smartScore, setSmartScore] = useState(() => Math.round(progress?.mastery || 0));
  const [scoreDelta, setScoreDelta] = useState(null);

  // Animation & sound state
  const [mascotState, setMascotState] = useState('idle');
  const [showConfetti, setShowConfetti] = useState(false);
  const [qKey, setQKey] = useState(0);
  const [starTrigger, setStarTrigger] = useState(0);
  const [muted, setMuted] = useState(() => localStorage.getItem('wijsMuted') === 'true');

  const playSound = useSoundEffect(muted);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem('wijsMuted', String(next));
  };

  useEffect(() => {
    if (phase !== 'practice') return;
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const fmtElapsed = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0'));
  };

  const getMedal = (score) => {
    if (score >= 90) return { emoji: '🏆', label: 'Trophy' };
    if (score >= 80) return { emoji: '🥇', label: 'Gold' };
    if (score >= 60) return { emoji: '🥈', label: 'Silver' };
    if (score >= 40) return { emoji: '🥉', label: 'Bronze' };
    return null;
  };

  const startPractice = () => {
    playSound('start');
    setPhase('practice');
    setMascotState('thinking');
    nextQuestion([]);
  };

  const nextQuestion = (currentHistory = history, currentAsked = askedIds) => {
    const q = pickAdaptiveQuestion(skill.questions, currentHistory, currentAsked);
    if (!q || sessionStats.total >= questionsToAnswer) {
      setPhase('result');
      onComplete?.(`Practice complete! ${sessionStats.correct}/${sessionStats.total} correct`);
      return;
    }
    setCurrentQ(q);
    setUserAnswer('');
    setFeedback(null);
    setShowHint(false);
    setMascotState('thinking');
    setQKey(k => k + 1);
  };

  const submit = () => {
    if (!userAnswer && userAnswer !== '0') return;
    const normUser    = String(userAnswer).trim().toLowerCase();
    const normCorrect = String(currentQ.answer).trim().toLowerCase();
    const correct = normUser === normCorrect;

    setFeedback({ correct, message: correct ? randomCheer() : 'Not quite!', hint: currentQ.hint });
    onAnswer(skill.id, currentQ.id, correct, currentQ.difficulty);

    const newHistory = [...history, correct];
    const newAsked   = askedIds.includes(currentQ.id) ? askedIds : [...askedIds, currentQ.id];
    setHistory(newHistory);
    setAskedIds(newAsked);
    const newStats = { correct: sessionStats.correct + (correct ? 1 : 0), total: sessionStats.total + 1 };
    setSessionStats(newStats);

    const gain = correct
      ? Math.round(8 + currentQ.difficulty * 4)
      : -Math.round(6 + currentQ.difficulty * 2);
    setScoreDelta(gain);
    setSmartScore(prev => Math.max(0, Math.min(100, prev + gain)));
    setTimeout(() => setScoreDelta(null), 1200);

    if (correct) {
      playSound('correct');
      setMascotState('correct');
      setStarTrigger(t => t + 1);
      // Perfect score: fire confetti + celebration
      if (newStats.total >= questionsToAnswer && newStats.correct === questionsToAnswer) {
        setTimeout(() => { setShowConfetti(true); playSound('complete'); setMascotState('celebrating'); }, 350);
        setTimeout(() => setShowConfetti(false), 3800);
      }
    } else {
      playSound('incorrect');
      setMascotState('incorrect');
      // Switch to encouraging after a beat if struggling
      if (newStats.total >= 3 && newStats.correct < newStats.total * 0.5) {
        setTimeout(() => setMascotState('encouraging'), 1300);
      }
    }
  };

  const handleNext = () => {
    const isLast = sessionStats.total >= questionsToAnswer;
    if (isLast) {
      const pct = sessionStats.correct / questionsToAnswer;
      if (pct >= 0.8 && sessionStats.correct < questionsToAnswer) {
        setShowConfetti(true);
        playSound('complete');
        setTimeout(() => setShowConfetti(false), 3200);
      }
      setPhase('result');
      onComplete?.(`Great session — ${sessionStats.correct}/${sessionStats.total} correct!`);
    } else {
      nextQuestion(history, askedIds);
    }
  };

  const restart = () => {
    setPhase('intro');
    setHistory([]);
    setAskedIds([]);
    setSessionStats({ correct: 0, total: 0 });
    setCurrentQ(null);
    setFeedback(null);
    setMascotState('idle');
    setShowConfetti(false);
    setElapsed(0);
    setSmartScore(Math.round(progress?.mastery || 0));
    setScoreDelta(null);
  };

  const sub = SUBJECTS[skill.subject];

  return (
    <div style={styles.container} className="resp-container">
      <Confetti active={showConfetti} />
      <StarBurst trigger={starTrigger} />
      <Mascot state={mascotState} visible={phase === 'practice'} />

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 4 }}>
        <BackBtn onClick={onBack} label="Exit practice" />
        {phase === 'practice' && <MuteBtn muted={muted} onToggle={toggleMute} />}
      </div>

      {/* ── INTRO ── */}
      {phase === 'intro' && (
        <div style={{ ...styles.skillIntro, animation:'slideUp 0.4s ease' }}>
          {/* Pip welcome */}
          <div style={{ textAlign:'center', marginBottom:10 }}>
            <div style={{ fontSize:56, display:'inline-block', animation:'float 2.8s ease-in-out infinite' }}>🦉</div>
            <div style={{ fontSize:13, color:'#6B7280', fontWeight:600, marginTop:4 }}>Pip the Wise Owl is ready to help!</div>
          </div>

          <div style={{ ...styles.skillIntroIcon, background:sub.color, animation:'pipPop 0.5s ease' }}>
            <BookOpen size={36} color="white" />
          </div>
          <h1 style={styles.skillIntroTitle}>{skill.title}</h1>
          <p style={styles.skillIntroDesc}>{skill.description}</p>

          <div style={{ ...styles.explainBox, animation:'slideUp 0.4s ease 0.15s both' }}>
            <div style={styles.explainHead}>
              <Lightbulb size={18} color="#6D8BC0" /> <strong>How it works</strong>
            </div>
            <p style={styles.explainText}>{skill.explanation}</p>
          </div>

          <div style={{ ...styles.skillMetaRow, animation:'slideUp 0.4s ease 0.25s both' }}>
            <div style={styles.skillMetaItem}><Target size={16} color="#6D8BC0" /> <span>{questionsToAnswer} questions</span></div>
            <div style={styles.skillMetaItem}><Brain size={16} color="#8FD9FB" /> <span>Adaptive difficulty</span></div>
            <div style={styles.skillMetaItem}><Lightbulb size={16} color="#6D8BC0" /> <span>Hints available</span></div>
          </div>

          <button
            onClick={startPractice}
            className="practice-start-btn"
            style={{ ...styles.primaryBtn, background:sub.color, animation:'slideUp 0.4s ease 0.35s both' }}
          >
            <Play size={18} fill="white" /> Start Practice
          </button>
        </div>
      )}

      {/* ── PRACTICE ── */}
      {phase === 'practice' && currentQ && (
        <div className="skill-practice-layout" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

          {/* Right sidebar */}
          <div className="skill-practice-sidebar" style={{
            width: 152, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8,
            order: 2,
          }}>
            {/* Questions answered */}
            <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ background: '#059669', color: 'white', fontSize: 11, fontWeight: 800, textAlign: 'center', padding: '6px 8px', letterSpacing: 0.3 }}>
                Questions<br />answered
              </div>
              <div style={{ background: 'white', textAlign: 'center', padding: '10px 4px', fontSize: 34, fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                {sessionStats.total}
              </div>
            </div>

            {/* Time elapsed */}
            <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ background: '#6D8BC0', color: 'white', fontSize: 11, fontWeight: 800, textAlign: 'center', padding: '6px 8px', letterSpacing: 0.3 }}>
                Time<br />elapsed
              </div>
              <div style={{ background: 'white', padding: '10px 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {(() => { const [h,m,s] = fmtElapsed(elapsed); return (
                    <>
                      {[['HR',h],['MIN',m],['SEC',s]].map(([unit, val]) => (
                        <div key={unit} style={{ textAlign: 'center', minWidth: 32 }}>
                          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, color: '#0F172A' }}>{val}</div>
                          <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, letterSpacing: 0.5 }}>{unit}</div>
                        </div>
                      ))}
                    </>
                  ); })()}
                </div>
              </div>
            </div>

            {/* SmartScore */}
            <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ background: '#D97706', color: 'white', fontSize: 11, fontWeight: 800, textAlign: 'center', padding: '6px 8px', letterSpacing: 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <span>SmartScore</span>
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', fontSize: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }} title="SmartScore increases when you answer correctly and decreases for wrong answers">?</span>
              </div>
              <div style={{ background: 'white', fontSize: 9, color: '#94A3B8', fontWeight: 700, textAlign: 'center', paddingTop: 4, letterSpacing: 0.3 }}>out of 100</div>
              <div style={{ background: 'white', textAlign: 'center', padding: '4px 4px 8px', position: 'relative' }}>
                <div style={{ fontSize: 42, fontWeight: 900, color: '#0F172A', lineHeight: 1, transition: 'all 0.3s ease' }}>
                  {smartScore}
                </div>
                {scoreDelta !== null && (
                  <div style={{
                    position: 'absolute', top: 0, right: 8,
                    fontSize: 13, fontWeight: 900,
                    color: scoreDelta > 0 ? '#059669' : '#DC2626',
                    animation: 'slideUp 0.4s ease forwards',
                  }}>
                    {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                  </div>
                )}
                {/* Medal */}
                {getMedal(smartScore) && (
                  <div style={{ fontSize: 28, lineHeight: 1, marginTop: 4 }} title={getMedal(smartScore).label}>
                    {getMedal(smartScore).emoji}
                  </div>
                )}
                {/* Score bar */}
                <div style={{ margin: '6px 8px 0', height: 5, borderRadius: 999, background: '#E2E8F0', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    background: smartScore >= 80 ? '#059669' : smartScore >= 60 ? '#6D8BC0' : '#D97706',
                    width: `${smartScore}%`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Main practice area ── */}
          <div style={{ ...styles.practiceWrap, flex: 1, order: 1 }}>
          {/* Animated progress dots */}
          <div style={styles.practiceHeader}>
            <div style={styles.practiceProgressBar}>
              {Array.from({ length: questionsToAnswer }).map((_, i) => {
                const isCurrent = i === sessionStats.total;
                const isDone    = i < sessionStats.total;
                return (
                  <div key={i} style={{
                    ...styles.progressDot,
                    background: isDone
                      ? (history[i] ? '#059669' : '#DC2626')
                      : isCurrent ? sub.color : '#E5E7EB',
                    transform: isCurrent ? 'scale(1.38)' : isDone ? 'scale(1)' : 'scale(0.88)',
                    transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
                    boxShadow: isCurrent ? `0 0 0 4px ${sub.color}30` : 'none',
                  }} />
                );
              })}
            </div>
            <div style={styles.practiceCounter}>
              Question {sessionStats.total + 1} of {questionsToAnswer}
            </div>
          </div>

          {/* Question card slides in on each new question */}
          <div
            key={qKey}
            style={{ ...styles.questionCard, animation:'questionSlide 0.36s cubic-bezier(0.22,1,0.36,1)', position:'relative' }}
          >
            <div style={styles.questionMeta}>
              <span style={{ ...styles.diffBadge, background:difficultyColor(currentQ.difficulty) }}>
                {difficultyLabel(currentQ.difficulty)}
              </span>
              <span style={styles.questionType}>
                {currentQ.type === 'mcq' ? 'Multiple choice' : 'Type your answer'}
              </span>
            </div>

            <h2 style={styles.questionPrompt}>{currentQ.prompt}</h2>

            {/* MCQ options */}
            {currentQ.type === 'mcq' && (
              <div style={styles.mcqGrid}>
                {currentQ.options.map((opt, idx) => {
                  const isSelected = userAnswer === opt;
                  const isCorrect  = feedback && opt === currentQ.answer;
                  const isWrong    = feedback && isSelected && !feedback.correct;
                  return (
                    <button
                      key={opt}
                      disabled={!!feedback}
                      onClick={() => { playSound('click'); setUserAnswer(opt); }}
                      className={`mcq-btn-wrap${isCorrect ? ' correct-flash' : ''}${isWrong ? ' wrong-shake' : ''}`}
                      style={{
                        ...styles.mcqBtn,
                        borderColor: isCorrect ? '#059669' : isWrong ? '#DC2626' : isSelected ? sub.color : '#E5E7EB',
                        background:  isCorrect ? '#F0FDF4' : isWrong ? '#FEF2F2' : isSelected ? `${sub.color}18` : 'white',
                        color:       isCorrect ? '#065F46' : isWrong ? '#991B1B' : '#1F2937',
                        animationDelay: `${idx * 0.055}s`,
                      }}
                    >
                      <span style={{ flex:1, textAlign:'left' }}>{opt}</span>
                      {isCorrect && <Check size={20} color="#059669" />}
                      {isWrong   && <X    size={20} color="#DC2626" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Fill-in answer */}
            {currentQ.type === 'fill' && (
              <div style={{ animation: feedback && !feedback.correct ? 'shake 0.4s ease' : 'none' }}>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  disabled={!!feedback}
                  placeholder="Type your answer..."
                  style={{
                    ...styles.fillInput,
                    borderColor: feedback ? (feedback.correct ? '#059669' : '#DC2626') : '#E5E7EB',
                    background:  feedback ? (feedback.correct ? '#F0FDF4' : '#FEF2F2') : 'white',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onKeyDown={e => e.key === 'Enter' && !feedback && submit()}
                  autoFocus
                />
              </div>
            )}

            {/* Hint */}
            {showHint && !feedback && (
              <div style={{ ...styles.hintBox, animation:'slideUp 0.3s ease' }}>
                <Lightbulb size={16} color="#6D8BC0" /> <span>{currentQ.hint}</span>
              </div>
            )}

            {/* Feedback banner */}
            {feedback && (
              <div style={{
                ...styles.feedback,
                background:   feedback.correct ? '#F0FDF4' : '#FEF2F2',
                borderColor:  feedback.correct ? '#059669' : '#DC2626',
                animation: 'bounceIn 0.38s cubic-bezier(0.175,0.885,0.32,1.275)',
              }}>
                <div style={styles.feedbackTop}>
                  <div style={{
                    ...styles.feedbackIcon,
                    background: feedback.correct ? '#059669' : '#DC2626',
                    animation:  feedback.correct ? 'pop 0.4s ease' : 'shake 0.3s ease',
                  }}>
                    {feedback.correct ? <Check size={20} color="white" /> : <X size={20} color="white" />}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:16, color: feedback.correct ? '#15803D' : '#B91C1C' }}>
                      {feedback.message}
                    </div>
                    <div style={{ fontSize:14, color:'#374151', marginTop:4 }}>
                      {feedback.correct
                        ? <span style={{ animation:'slideUp 0.3s ease 0.1s both', display:'block' }}>
                            +{5 + currentQ.difficulty * 3} points! 🎯
                          </span>
                        : <>The correct answer is <strong>{currentQ.answer}</strong>.</>}
                    </div>
                  </div>
                </div>
                {!feedback.correct && (
                  <div style={{ ...styles.solutionBox, animation:'slideUp 0.3s ease 0.1s both' }}>
                    <strong style={{ fontSize:13 }}>💡 Step-by-step:</strong>
                    <p style={{ marginTop:4, fontSize:14, color:'#374151' }}>{feedback.hint}</p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div style={styles.questionActions}>
              {!feedback && !showHint && (
                <button onClick={() => setShowHint(true)} className="hint-btn-anim" style={styles.hintBtn}>
                  <Lightbulb size={16} /> Need a hint?
                </button>
              )}
              {!feedback ? (
                <button
                  onClick={submit}
                  disabled={!userAnswer && userAnswer !== '0'}
                  className="next-btn"
                  style={{
                    ...styles.primaryBtn,
                    background: sub.color,
                    opacity: (!userAnswer && userAnswer !== '0') ? 0.5 : 1,
                    marginLeft: 'auto',
                  }}
                >
                  Check Answer
                </button>
              ) : (
                <button onClick={handleNext} className="next-btn" style={{ ...styles.primaryBtn, background:sub.color, marginLeft:'auto' }}>
                  {sessionStats.total >= questionsToAnswer ? 'See Results 🎯' : 'Next Question'} <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {phase === 'result' && (
        <ResultsScreen
          stats={sessionStats}
          skill={skill}
          color={sub.color}
          onRestart={restart}
          onBack={onBack}
        />
      )}
    </div>
  );
}

function ResultsScreen({ stats, skill, color, onRestart, onBack }) {
  const accuracy = Math.round((stats.correct / stats.total) * 100);
  const [confettiOn, setConfettiOn] = useState(false);

  useEffect(() => {
    if (accuracy >= 80) {
      const t1 = setTimeout(() => setConfettiOn(true), 200);
      const t2 = setTimeout(() => setConfettiOn(false), 3800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, []); // eslint-disable-line

  const msg =
    accuracy === 100 ? { title:'Perfect score! 🎉', sub:'You absolutely crushed this!',   pip:'🏆', pipMsg:'WOW! A perfect 5 out of 5! Pip is SO proud! 🌟' } :
    accuracy >= 80   ? { title:'Excellent work! 🌟', sub:"You're getting really good!",    pip:'🦉', pipMsg:"Great job! Pip sees you working hard. Keep it up!" } :
    accuracy >= 60   ? { title:'Nice effort! 👏',    sub:'Keep practicing — mastery is close.', pip:'💪', pipMsg:"Pip believes in you! Every practice makes you smarter! 💡" } :
                       { title:'Good try! 💪',       sub:'Practice makes perfect. Try again!',  pip:'😊', pipMsg:"It's okay to make mistakes — that's how we learn! 🌱" };

  return (
    <div style={{ ...styles.resultWrap, animation:'slideUp 0.5s ease' }}>
      <Confetti active={confettiOn} />

      {/* Trophy / mascot */}
      <div style={{
        fontSize:72, textAlign:'center', display:'block',
        animation: accuracy >= 80 ? 'mascotBounce 0.6s ease 3' : 'pop 0.5s ease',
      }}>
        {msg.pip}
      </div>

      <h1 style={styles.resultTitle}>{msg.title}</h1>
      <p  style={styles.resultSub}>{msg.sub}</p>

      {/* Pip speech bubble */}
      <div style={{
        background:'linear-gradient(135deg,#F0FAFF,#F0F9FF)',
        border:'2px solid #B8E4FB', borderRadius:16,
        padding:'12px 18px',
        display:'flex', alignItems:'center', gap:12,
        marginBottom:22, fontSize:14, color:'#374151',
        animation:'slideUp 0.4s ease 0.2s both',
      }}>
        <span style={{ fontSize:26, flexShrink:0 }}>🦉</span>
        <span>{msg.pipMsg}</span>
      </div>

      {/* Stat cards */}
      <div style={styles.resultStats}>
        <div style={{ ...styles.resultStat, animation:'pop 0.4s ease 0.1s both' }}>
          <div style={{ ...styles.resultStatValue, color }}>{stats.correct}</div>
          <div style={styles.resultStatLabel}>Correct</div>
        </div>
        <div style={styles.resultDivider} />
        <div style={{ ...styles.resultStat, animation:'pop 0.4s ease 0.2s both' }}>
          <div style={{ ...styles.resultStatValue, color:'#1F2937' }}>{stats.total}</div>
          <div style={styles.resultStatLabel}>Questions</div>
        </div>
        <div style={styles.resultDivider} />
        <div style={{ ...styles.resultStat, animation:'pop 0.4s ease 0.3s both' }}>
          <div style={{ ...styles.resultStatValue, color:'#059669' }}>{accuracy}%</div>
          <div style={styles.resultStatLabel}>Accuracy</div>
        </div>
      </div>

      {/* Animated accuracy bar */}
      <div style={{ margin:'12px 0 24px', background:'#F3F4F6', borderRadius:999, height:10, overflow:'hidden' }}>
        <div style={{
          height:'100%', borderRadius:999,
          background: accuracy === 100 ? '#059669' : accuracy >= 80 ? '#525AFF' : accuracy >= 60 ? '#6D8BC0' : '#DC2626',
          width:`${accuracy}%`,
          animation:'growBar 1s cubic-bezier(0.22,1,0.36,1) 0.35s both',
        }} />
      </div>

      <div style={styles.resultActions}>
        <button onClick={onRestart} className="next-btn" style={styles.secondaryBtn}>
          <RotateCcw size={16} /> Practice Again
        </button>
        <button onClick={onBack} className="next-btn" style={{ ...styles.primaryBtn, background:color }}>
          Back to Skills <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ---------- PRACTICE HUB ----------
function PracticeHub({ progress, onPickSkill }) {
  const featured = Object.values(SKILLS).slice(0, 12);
  const started = Object.entries(progress)
    .map(([id, p]) => ({ skill: SKILLS[id], progress: p }))
    .filter(x => x.skill)
    .slice(-4)
    .reverse();

  return (
    <div style={styles.container} className="resp-container">
      <div style={styles.productHero}>
        <div>
          <div style={styles.eyebrow}>QUIZ PRACTICE</div>
          <h1 style={styles.dashHeroTitle} className="dash-hero-title">Practice skills by grade and subject</h1>
          <p style={styles.dashHeroSub}>Start a short adaptive quiz, review hints, and earn points as you go.</p>
        </div>
        <div style={styles.heroMiniPanel}>
          <strong>5-question sessions</strong>
          <span>Adaptive difficulty, instant feedback, and step-by-step support.</span>
        </div>
      </div>

      {started.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <SectionHeader title="Continue practicing" subtitle="Pick up from recent skills" />
          <div style={styles.responsiveGrid} className="responsive-grid">
            {started.map(({ skill, progress: p }) => (
              <SkillActionCard key={skill.id} skill={skill} meta={`${calcMastery(p)}% mastery`} action="Resume quiz" onClick={() => onPickSkill(skill)} />
            ))}
          </div>
        </section>
      )}

      <section style={{ marginTop: 36 }}>
        <SectionHeader title="Quiz library" subtitle="A curated set of skills ready for practice" />
        <div style={styles.responsiveGrid} className="responsive-grid">
          {featured.map(skill => (
            <SkillActionCard
              key={skill.id}
              skill={skill}
              meta={`${GRADES.find(g => g.id === skill.grade)?.label} · ${SUBJECTS[skill.subject].label}`}
              action="Start quiz"
              onClick={() => onPickSkill(skill)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function SkillActionCard({ skill, meta, action, onClick }) {
  const subject = SUBJECTS[skill.subject];
  const Icon = subject.icon;
  return (
    <button onClick={onClick} style={styles.actionCard}>
      <div style={{ ...styles.actionIcon, background: subject.color }}>
        <Icon size={22} color="white" />
      </div>
      <div style={{ textAlign: 'left', flex: 1 }}>
        <h3 style={styles.actionTitle}>{skill.title}</h3>
        <p style={styles.actionText}>{skill.description}</p>
        <div style={styles.actionMeta}>{meta}</div>
      </div>
      <span style={styles.actionCta}>{action} <ChevronRight size={15} /></span>
    </button>
  );
}

// ---------- PARENT DASHBOARD ----------
function ParentDashboard({ stats, progress, onReports, onPractice }) {
  const accuracy = stats.totalAnswered ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
  const activeSkills = Object.keys(progress).length;
  const weeklyRows = [
    ['Mon', 12, '#F97316'],
    ['Tue', 18, '#525AFF'],
    ['Wed', 8,  '#4AB5B5'],
    ['Thu', 24, '#D97706'],
    ['Fri', 15, '#EC4899'],
  ];

  return (
    <div style={styles.container} className="resp-container">
      <div style={styles.productHero}>
        <div>
          <div style={styles.eyebrow}>PARENT DASHBOARD</div>
          <h1 style={styles.dashHeroTitle} className="dash-hero-title">Family progress overview</h1>
          <p style={styles.dashHeroSub}>See what your learner is practicing, where they are growing, and what to try next.</p>
        </div>
        <div style={styles.parentSummary}>
          <div style={styles.parentAvatar}>L</div>
          <div>
            <strong>Learner</strong>
            <span>Grade path: mixed · Plan: Family</span>
          </div>
        </div>
      </div>

      <div style={styles.dashHeroStats}>
        <BigStat icon={<Target size={22}/>} value={stats.totalAnswered} label="Questions answered" color="#525AFF" />
        <BigStat icon={<TrendingUp size={22}/>} value={`${accuracy}%`} label="Accuracy" color="#059669" />
        <BigStat icon={<BookOpen size={22}/>} value={activeSkills} label="Skills practiced" color="#8FD9FB" />
        <BigStat icon={<Crown size={22}/>} value={stats.masteredSkills} label="Mastered" color="#525AFF" />
      </div>

      <section style={{ marginTop: 36 }}>
        <SectionHeader title="Weekly activity" subtitle="Practice volume by day" />
        <div style={styles.reportPanel}>
          {weeklyRows.map(([day, value, color]) => (
          <div key={day} style={styles.activityRow} className="activity-row">
              <span>{day}</span>
              <div style={styles.activityTrack}>
                <div style={{ ...styles.activityFill, width: `${value * 3}%`, background: color }} />
              </div>
              <strong>{value} min</strong>
            </div>
          ))}
        </div>
      </section>

      <div style={styles.quickActions}>
        <button onClick={onReports} style={styles.primaryAction}>Open progress reports</button>
        <button onClick={onPractice} style={styles.secondaryAction}>Assign practice</button>
      </div>
    </div>
  );
}

// ---------- PROGRESS REPORTS ----------
function ProgressReports({ stats, progress, onPractice }) {
  const subjectRows = Object.entries(SUBJECTS).map(([key, subject]) => {
    const skills = Object.values(SKILLS).filter(s => s.subject === key);
    const attempted = skills.filter(s => progress[s.id]?.attempts > 0);
    const mastered = attempted.filter(s => calcMastery(progress[s.id]) >= 85);
    const attempts = attempted.reduce((sum, s) => sum + (progress[s.id]?.attempts || 0), 0);
    return { key, subject, attempted: attempted.length, mastered: mastered.length, total: skills.length, attempts };
  });

  return (
    <div style={styles.container} className="resp-container">
      <div style={styles.productHero}>
        <div>
          <div style={styles.eyebrow}>PROGRESS REPORTS</div>
          <h1 style={styles.dashHeroTitle} className="dash-hero-title">Progress reports</h1>
          <p style={styles.dashHeroSub}>Printable-style summaries for mastery, activity, and subject coverage.</p>
        </div>
        <button onClick={onPractice} style={styles.primaryAction}>Practice recommended skills</button>
      </div>

      <div style={styles.reportPanel}>
        <div style={styles.reportHeader}>
          <strong>Overall summary</strong>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div style={styles.dashHeroStats}>
          <BigStat icon={<Target size={22}/>} value={stats.totalAnswered} label="Answered" color="#525AFF" />
          <BigStat icon={<CheckCircle2 size={22}/>} value={stats.totalCorrect} label="Correct" color="#059669" />
          <BigStat icon={<Flame size={22}/>} value={stats.bestStreak} label="Best streak" color="#6D8BC0" />
          <BigStat icon={<AwardIcon />} value={stats.earnedBadges.length} label="Badges" color="#525AFF" />
        </div>
      </div>

      <section style={{ marginTop: 32 }}>
        <SectionHeader title="Subject report" subtitle="Coverage and mastery by curriculum area" />
        <div style={styles.reportTable}>
          <div style={{ ...styles.reportRow, ...styles.reportRowHead }} className="report-row">
            <span>Subject</span><span>Started</span><span>Mastered</span><span>Attempts</span><span>Coverage</span>
          </div>
          {subjectRows.map(row => (
            <div key={row.key} style={styles.reportRow} className="report-row">
              <span style={{ fontWeight: 800, color: row.subject.color }}>{row.subject.label}</span>
              <span>{row.attempted}</span>
              <span>{row.mastered}</span>
              <span>{row.attempts}</span>
              <span>{row.total ? Math.round((row.attempted / row.total) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AwardIcon() {
  return <Trophy size={22} />;
}

// ---------- SUBSCRIPTION / PAYMENT ----------
const FALLBACK_PLANS = [
  { id: 'learner', name: 'Learner', priceCents: 900,  interval: 'month', features: ['Adaptive quizzes', 'Progress tracking', 'Badges & streaks'] },
  { id: 'family',  name: 'Family',  priceCents: 1900, interval: 'month', features: ['Up to 3 learners', 'Parent dashboard', 'Progress reports'], featured: true },
  { id: 'school',  name: 'School',  priceCents: 4900, interval: 'month', features: ['Admin panel', 'Class analytics', 'Curriculum tools'] },
];

const SUB_STATUS_COLORS = {
  ACTIVE:     { background: '#DCFCE7', color: '#166534' },
  TRIALING:   { background: '#E0F4FF', color: '#3A41CC' },
  PAST_DUE:   { background: '#FEF9C3', color: '#854D0E' },
  CANCELED:   { background: '#F3F4F6', color: '#6B7280' },
  INCOMPLETE: { background: '#FEE2E2', color: '#991B1B' },
};

function SubscriptionScreen({ onBack, user, pushToast }) {
  const isSignedIn = !!user?.username;
  const [plans,     setPlans]     = useState([]);
  const [subStatus, setSubStatus] = useState(null);
  const [invoices,  setInvoices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [busy,      setBusy]      = useState(false);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const plansData = await getPlans();
        if (!dead) setPlans(plansData);
      } catch { /* API unavailable — fallback plans rendered below */ }

      if (isSignedIn) {
        try {
          const [s, inv] = await Promise.all([getSubStatus(), getInvoices()]);
          if (!dead) { setSubStatus(s); setInvoices(inv); }
        } catch { /* not fatal */ }
      }
      if (!dead) setLoading(false);
    })();
    return () => { dead = true; };
  }, [isSignedIn]);

  const activeSub   = subStatus?.subscription;
  const isActive    = subStatus?.active;
  const isCanceling = !!activeSub?.cancelAtPeriodEnd;

  const handleSubscribe = async (planId) => {
    if (!isSignedIn) { pushToast?.('Sign in to subscribe.', 'info'); return; }
    setBusy(true);
    try {
      const { checkoutUrl } = await createCheckout(planId);
      window.location.href = checkoutUrl;
    } catch (err) { pushToast?.(err.message, 'error'); setBusy(false); }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      const { subscription } = await cancelSub();
      setSubStatus(s => ({ ...s, subscription }));
      pushToast?.('Subscription will cancel at period end.', 'success');
    } catch (err) { pushToast?.(err.message, 'error'); }
    setBusy(false);
  };

  const handleReactivate = async () => {
    setBusy(true);
    try {
      const { subscription } = await reactivateSub();
      setSubStatus(s => ({ ...s, active: true, subscription }));
      pushToast?.('Subscription reactivated!', 'success');
    } catch (err) { pushToast?.(err.message, 'error'); }
    setBusy(false);
  };

  const handleChangePlan = async (planId) => {
    setBusy(true);
    try {
      const { subscription } = await changePlanAPI(planId);
      setSubStatus(s => ({ ...s, subscription }));
      pushToast?.('Plan updated!', 'success');
    } catch (err) { pushToast?.(err.message, 'error'); }
    setBusy(false);
  };

  const handlePortal = async () => {
    setBusy(true);
    try {
      const { portalUrl } = await getBillingPortal();
      window.location.href = portalUrl;
    } catch (err) { pushToast?.(err.message, 'error'); setBusy(false); }
  };

  const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtCents = (c) => `$${(c / 100).toFixed(c % 100 === 0 ? 0 : 2)}`;

  const displayPlans = plans.length ? plans : FALLBACK_PLANS;

  return (
    <div style={styles.container} className="resp-container">
      <BackBtn onClick={onBack} label="Back home" />

      <div style={styles.productHero}>
        <div>
          <div style={styles.eyebrow}>BILLING & PLANS</div>
          <h1 style={styles.dashHeroTitle} className="dash-hero-title">Choose your WIJS plan</h1>
          <p style={styles.dashHeroSub}>Unlock adaptive learning for your students. Cancel any time.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748B', fontSize: 15 }}>Loading plans…</div>
      ) : (
        <>
          {/* ── Active subscription management ── */}
          {isSignedIn && activeSub && (
            <div style={{
              background: 'white',
              border: '1.5px solid #F0E6D6',
              borderRadius: 18,
              padding: '20px 24px',
              marginBottom: 24,
              boxShadow: '0 4px 16px rgba(12,92,168,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: '#525AFF', fontWeight: 900 }}>
                    {activeSub.plan?.name ?? 'Subscription'}
                  </span>
                  <span style={{
                    ...(SUB_STATUS_COLORS[activeSub.status] || SUB_STATUS_COLORS.CANCELED),
                    borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 700,
                  }}>
                    {isCanceling ? 'Canceling' : (activeSub.status ?? 'Active')}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  {isCanceling
                    ? `Access until ${fmtDate(activeSub.currentPeriodEnd)}`
                    : `Renews ${fmtDate(activeSub.currentPeriodEnd)}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {isCanceling ? (
                  <button onClick={handleReactivate} disabled={busy}
                    style={{ ...styles.primaryAction, opacity: busy ? 0.6 : 1 }}>
                    Reactivate
                  </button>
                ) : (
                  <button onClick={handleCancel} disabled={busy}
                    style={{ ...styles.secondaryAction, color: '#DC2626', borderColor: '#FECACA', opacity: busy ? 0.6 : 1 }}>
                    Cancel plan
                  </button>
                )}
                <button onClick={handlePortal} disabled={busy}
                  style={{ ...styles.secondaryAction, opacity: busy ? 0.6 : 1 }}>
                  Manage billing
                </button>
              </div>
            </div>
          )}

          {/* ── Plans grid ── */}
          <SectionHeader title="Plans" subtitle="All plans include a 7-day free trial" />
          <div style={styles.pricingGrid} className="responsive-grid pricing-grid">
            {displayPlans.map(plan => {
              const isCurrent  = activeSub?.planId === plan.id;
              const canSwitch  = isActive && !isCurrent;
              const featureList = Array.isArray(plan.features) ? plan.features : [];
              return (
                <div key={plan.id} style={{ ...styles.planCard, ...(plan.featured ? styles.planFeatured : {}), position: 'relative' }}>
                  {plan.featured && <div style={styles.planBadge}>Best value</div>}
                  {isCurrent && !isCanceling && (
                    <div style={{ ...styles.planBadge, background: '#525AFF', right: 'auto', left: 14 }}>Current</div>
                  )}
                  <h2 style={styles.planName}>{plan.name}</h2>
                  <div style={styles.planPrice}>
                    {fmtCents(plan.priceCents)}
                    <span style={{ fontSize: 16, color: '#64748B', fontWeight: 500 }}>/{plan.interval ?? 'mo'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {featureList.map((f, i) => (
                      <div key={i} style={styles.planFeature}><Check size={15} color="#059669" /> {f}</div>
                    ))}
                  </div>
                  {isCurrent && !isCanceling ? (
                    <button disabled style={{ ...styles.secondaryAction, background: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0', cursor: 'default' }}>
                      Current plan
                    </button>
                  ) : canSwitch ? (
                    <button onClick={() => handleChangePlan(plan.id)} disabled={busy}
                      style={{ ...styles.secondaryAction, opacity: busy ? 0.6 : 1 }}>
                      Switch to {plan.name}
                    </button>
                  ) : (
                    <button onClick={() => handleSubscribe(plan.id)} disabled={busy}
                      style={{ ...(plan.featured ? styles.primaryAction : styles.secondaryAction), opacity: busy ? 0.6 : 1 }}>
                      {isSignedIn ? 'Get started' : 'Sign in to subscribe'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Invoice history ── */}
          {isSignedIn && invoices.length > 0 && (
            <section style={{ marginTop: 36 }}>
              <SectionHeader title="Billing history" subtitle="Your recent payments" />
              <div style={styles.reportTable}>
                <div style={{ ...styles.reportRow, ...styles.reportRowHead }} className="report-row">
                  <span>Date</span><span>Plan</span><span>Amount</span><span>Status</span><span>PDF</span>
                </div>
                {invoices.map(inv => (
                  <div key={inv.id} style={styles.reportRow} className="report-row">
                    <span>{fmtDate(inv.paidAt || inv.createdAt)}</span>
                    <span>{inv.subscription?.plan?.name ?? '—'}</span>
                    <span style={{ fontWeight: 700 }}>{fmtCents(inv.amountCents)}</span>
                    <span>
                      <span style={{
                        ...(inv.status === 'paid' ? { background: '#DCFCE7', color: '#166534' } : { background: '#FEE2E2', color: '#991B1B' }),
                        borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 700,
                      }}>
                        {inv.status}
                      </span>
                    </span>
                    <span>
                      {inv.pdfUrl
                        ? <a href={inv.pdfUrl} target="_blank" rel="noreferrer" style={{ color: '#525AFF', fontWeight: 700, fontSize: 13 }}>Download</a>
                        : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!isSignedIn && (
            <p style={{ textAlign: 'center', color: '#64748B', marginTop: 20, fontSize: 14 }}>
              Sign in or create an account to subscribe.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ---------- ADMIN CONTENT MANAGEMENT ----------
function AdminContentManagement({ onPractice, onReports }) {
  const catalogStats = [
    ['Grades', GRADES.length],
    ['Subjects', Object.keys(SUBJECTS).length],
    ['Skills', Object.keys(SKILLS).length],
    ['Questions', Object.values(SKILLS).reduce((sum, skill) => sum + skill.questions.length, 0)],
  ];
  const sampleSkills = Object.values(SKILLS).slice(0, 6);

  return (
    <div style={styles.container} className="resp-container">
      <div style={styles.productHero}>
        <div>
          <div style={styles.eyebrow}>ADMIN CONTENT MANAGEMENT</div>
          <h1 style={styles.dashHeroTitle} className="dash-hero-title">Curriculum control center</h1>
          <p style={styles.dashHeroSub}>Review content coverage, manage skill status, and prepare quizzes for learners.</p>
        </div>
        <div style={styles.quickActions}>
          <button onClick={onPractice} style={styles.primaryAction}>Preview practice</button>
          <button onClick={onReports} style={styles.secondaryAction}>View reports</button>
        </div>
      </div>

      <div style={styles.dashHeroStats}>
        {catalogStats.map(([label, value], idx) => (
          <BigStat
            key={label}
            icon={[<GraduationCap size={22}/>, <BookOpen size={22}/>, <Target size={22}/>, <CheckCircle2 size={22}/>][idx]}
            value={value}
            label={label}
            color={['#525AFF', '#8FD9FB', '#525AFF', '#6D8BC0'][idx]}
          />
        ))}
      </div>

      <section style={{ marginTop: 36 }}>
        <SectionHeader title="Content queue" subtitle="Sample administrative skill table" />
        <div style={styles.reportTable}>
          <div style={{ ...styles.reportRow, ...styles.reportRowHead }} className="report-row">
            <span>Skill</span><span>Grade</span><span>Subject</span><span>Questions</span><span>Status</span>
          </div>
          {sampleSkills.map(skill => (
            <div key={skill.id} style={styles.reportRow} className="report-row">
              <span style={{ fontWeight: 800 }}>{skill.title}</span>
              <span>{GRADES.find(g => g.id === skill.grade)?.label}</span>
              <span>{SUBJECTS[skill.subject].label}</span>
              <span>{skill.questions.length}</span>
              <span style={styles.statusPill}>Published</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 34 }}>
        <SectionHeader title="Create content" subtitle="Fast editor controls for future API integration" />
        <div style={styles.adminForm} className="admin-form">
          <label>Skill title<input placeholder="Add a new skill title" /></label>
          <label>Grade<select><option>Kindergarten</option><option>Grade 1</option><option>Grade 2</option><option>Grade 3</option><option>Grade 4</option><option>Grade 5</option><option>Grade 6</option><option>Grade 7</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></label>
          <label>Subject<select><option>Math</option><option>Language arts</option><option>Science</option><option>Social studies</option></select></label>
          <label>Question prompt<textarea placeholder="Write a quiz prompt..." /></label>
          <button style={styles.primaryAction}>Save draft</button>
        </div>
      </section>
    </div>
  );
}

// ---------- DASHBOARD ----------
function Dashboard({ title = 'Dashboard', user, stats, progress, onPickSkill }) {
  const accuracy = stats.totalAnswered > 0
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;

  const firstName = user?.name ? user.name.split(' ')[0] : null;

  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  };

  // All practiced skills sorted by most recently practiced
  const allActivity = useMemo(() => (
    Object.entries(progress)
      .map(([id, p]) => ({ skill: SKILLS[id], p, mastery: calcMastery(p) }))
      .filter(x => x.skill && x.p.attempts > 0)
      .sort((a, b) => (b.p.lastPracticed || '').localeCompare(a.p.lastPracticed || ''))
  ), [progress]);

  const completed  = useMemo(() => allActivity.filter(x => x.mastery >= 85),            [allActivity]);
  const inProgress = useMemo(() => allActivity.filter(x => x.mastery > 0 && x.mastery < 85), [allActivity]);

  // Per-subject breakdown
  const bySubject = useMemo(() => {
    const out = {};
    Object.keys(SUBJECTS).forEach(key => {
      const subjectSkills = Object.values(SKILLS).filter(s => s.subject === key);
      const explored = subjectSkills.filter(s => progress[s.id]?.attempts > 0).length;
      const mastered = subjectSkills.filter(s => calcMastery(progress[s.id]) >= 85).length;
      out[key] = { explored, mastered, total: subjectSkills.length };
    });
    return out;
  }, [progress]);

  // Recommendations: skills with attempts but not yet mastered (weak areas first)
  const recommendations = useMemo(() => {
    const weak = Object.entries(progress)
      .map(([id, p]) => ({ skill: SKILLS[id], mastery: calcMastery(p), p }))
      .filter(x => x.skill && x.mastery > 0 && x.mastery < 85)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 3);
    if (weak.length >= 3) return weak.map(x => x.skill);
    // Fill with not-yet-tried skills
    const untried = Object.values(SKILLS).filter(s => !progress[s.id]).slice(0, 3 - weak.length);
    return [...weak.map(x => x.skill), ...untried];
  }, [progress]);

  // Recent skills
  const recent = Object.entries(progress)
    .map(([id, p]) => ({ skill: SKILLS[id], p }))
    .filter(x => x.skill)
    .slice(-3)
    .reverse();

  return (
    <div style={styles.container} className="resp-container">
      <div style={styles.dashHero}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#525AFF', letterSpacing: 1 }}>YOUR LEARNING JOURNEY</div>
          <h1 style={styles.dashHeroTitle} className="dash-hero-title">
            {firstName ? `Welcome back, ${firstName}!` : title}
          </h1>
          <p style={styles.dashHeroSub}>
            {firstName
              ? `Here's ${firstName}'s progress — quizzes, completed work, and what's in progress.`
              : 'Track your progress and find what to learn next.'}
          </p>
        </div>
        <div style={styles.dashHeroStats}>
          <BigStat icon={<Target size={22}/>} value={stats.totalAnswered} label="Questions answered" color="#6D8BC0" />
          <BigStat icon={<TrendingUp size={22}/>} value={`${accuracy}%`} label="Overall accuracy" color="#059669" />
          <BigStat icon={<Crown size={22}/>} value={stats.masteredSkills} label="Skills mastered" color="#525AFF" />
          <BigStat icon={<Flame size={22}/>} value={stats.bestStreak} label="Best streak" color="#6D8BC0" />
        </div>
      </div>

      {/* Subject breakdown */}
      <section style={{ marginTop: 40 }}>
        <SectionHeader title="Performance by subject" subtitle="See how you're doing in each area" />
        <div style={styles.subjectAnalytics}>
          {Object.entries(SUBJECTS).map(([key, sub]) => {
            const data = bySubject[key];
            const Icon = sub.icon;
            const pct = data.total ? (data.mastered / data.total) * 100 : 0;
            return (
              <div key={key} style={styles.subjectAnalyticCard}>
                <div style={styles.analyticHead}>
                  <div style={{ ...styles.analyticIcon, background: sub.color }}>
                    <Icon size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{sub.label}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{data.mastered} mastered · {data.explored} started</div>
                  </div>
                </div>
                <div style={styles.analyticBar}>
                  <div style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${sub.color}, ${sub.color}dd)`,
                    ...styles.analyticBarFill,
                  }}/>
                </div>
                <div style={styles.analyticPct}>{Math.round(pct)}% mastered</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommendations */}
      <section style={{ marginTop: 40 }}>
        <SectionHeader
          title="Recommended for you"
          subtitle="Based on your weak areas and unexplored skills"
          icon={<Brain size={20} color="#8FD9FB" />}
        />
        <div style={styles.recList}>
          {recommendations.length === 0 ? (
            <div style={styles.emptyState}>Start practicing to get recommendations!</div>
          ) : (
            recommendations.map(skill => {
              const sub = SUBJECTS[skill.subject];
              const mastery = calcMastery(progress[skill.id]);
              const reason = mastery > 0 ? 'Improve weak area' : 'New skill to try';
              return (
                <button key={skill.id} onClick={() => onPickSkill(skill)} style={styles.recCard}>
                  <div style={{ ...styles.recIcon, background: sub.color }}>
                    {React.createElement(sub.icon, { size: 20, color: 'white' })}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={styles.recReason}>{reason}</div>
                    <div style={styles.recTitle}>{skill.title}</div>
                    <div style={styles.recMeta}>
                      {GRADES.find(g => g.id === skill.grade)?.label} · {sub.label}
                      {mastery > 0 && ` · ${mastery}% mastery`}
                    </div>
                  </div>
                  <ArrowRight size={20} color="#6B7280" />
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Recent activity */}
      {recent.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <SectionHeader title="Recent activity" subtitle="Skills you've been working on" />
          <div style={styles.recentGrid}>
            {recent.map(({ skill, p }) => {
              const sub = SUBJECTS[skill.subject];
              const mastery = calcMastery(p);
              const ml = masteryLabel(mastery);
              return (
                <button key={skill.id} onClick={() => onPickSkill(skill)} style={styles.recentCard}>
                  <div style={{ ...styles.recentIcon, background: sub.bg, color: sub.color }}>
                    {React.createElement(sub.icon, { size: 18 })}
                  </div>
                  <h4 style={styles.recentTitle}>{skill.title}</h4>
                  <div style={styles.recentBar}>
                    <div style={{ width: `${mastery}%`, background: ml.color, height: '100%', borderRadius: 4 }}/>
                  </div>
                  <div style={styles.recentMeta}>
                    <span style={{ color: ml.color, fontWeight: 700 }}>{ml.label}</span>
                    <span style={{ color: '#6B7280' }}>{p.attempts} attempts</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Work Completed */}
      {completed.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <SectionHeader
            title={`Work Completed (${completed.length})`}
            subtitle="Skills you've mastered — 85% accuracy or better"
            icon={<CheckCircle2 size={20} color="#059669" />}
          />
          <div style={styles.activityTable}>
            {completed.map(({ skill, p, mastery }) => {
              const sub = SUBJECTS[skill.subject];
              const acc = p.attempts > 0 ? Math.round((p.correct / p.attempts) * 100) : 0;
              return (
                <button key={skill.id} onClick={() => onPickSkill(skill)} style={styles.activityRow}>
                  <div style={{ ...styles.activityIcon, background: sub.color }}>
                    {React.createElement(sub.icon, { size: 16, color: 'white' })}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={styles.activityTitle}>{skill.title}</div>
                    <div style={styles.activityMeta}>
                      {GRADES.find(g => g.id === skill.grade)?.label} · {sub.label}
                    </div>
                  </div>
                  <div style={styles.activityStats}>
                    <span style={{ ...styles.statusBadge, background: '#D1FAE5', color: '#059669' }}>✓ Mastered</span>
                    <span style={styles.activityStat}>{acc}% accuracy</span>
                    <span style={styles.activityStat}>{p.attempts} questions</span>
                    <span style={styles.activityDate}>{fmtDate(p.lastPracticed)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Work In Progress */}
      {inProgress.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <SectionHeader
            title={`Work In Progress (${inProgress.length})`}
            subtitle="Skills you've started — keep going to reach mastery"
            icon={<Play size={20} color="#6D8BC0" />}
          />
          <div style={styles.activityTable}>
            {inProgress.map(({ skill, p, mastery }) => {
              const sub = SUBJECTS[skill.subject];
              const acc = p.attempts > 0 ? Math.round((p.correct / p.attempts) * 100) : 0;
              return (
                <button key={skill.id} onClick={() => onPickSkill(skill)} style={styles.activityRow}>
                  <div style={{ ...styles.activityIcon, background: sub.color }}>
                    {React.createElement(sub.icon, { size: 16, color: 'white' })}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={styles.activityTitle}>{skill.title}</div>
                    <div style={styles.activityMeta}>
                      {GRADES.find(g => g.id === skill.grade)?.label} · {sub.label}
                    </div>
                    <div style={styles.activityProgressBar}>
                      <div style={{ width: `${mastery}%`, background: sub.color, height: '100%', borderRadius: 2 }} />
                    </div>
                  </div>
                  <div style={styles.activityStats}>
                    <span style={{ ...styles.statusBadge, background: '#F0FAFF', color: '#6D8BC0' }}>{mastery}% mastery</span>
                    <span style={styles.activityStat}>{acc}% accuracy</span>
                    <span style={styles.activityStat}>{p.attempts} questions</span>
                    <span style={styles.activityDate}>{fmtDate(p.lastPracticed)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* All Quiz Records */}
      {allActivity.length > 0 && (
        <section style={{ marginTop: 40, marginBottom: 40 }}>
          <SectionHeader
            title={`All Quiz Records (${allActivity.length})`}
            subtitle="Every skill you've ever practiced, sorted by most recent"
            icon={<BarChart3 size={20} color="#525AFF" />}
          />
          <div style={styles.activityTable}>
            {allActivity.map(({ skill, p, mastery }) => {
              const sub = SUBJECTS[skill.subject];
              const acc = p.attempts > 0 ? Math.round((p.correct / p.attempts) * 100) : 0;
              const ml = masteryLabel(mastery);
              return (
                <button key={skill.id} onClick={() => onPickSkill(skill)} style={styles.activityRow}>
                  <div style={{ ...styles.activityIcon, background: sub.color }}>
                    {React.createElement(sub.icon, { size: 16, color: 'white' })}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={styles.activityTitle}>{skill.title}</div>
                    <div style={styles.activityMeta}>
                      {GRADES.find(g => g.id === skill.grade)?.label} · {sub.label}
                    </div>
                  </div>
                  <div style={styles.activityStats}>
                    <span style={{ ...styles.statusBadge, background: `${ml.color}22`, color: ml.color }}>{ml.label}</span>
                    <span style={styles.activityStat}>{acc}% acc.</span>
                    <span style={styles.activityStat}>{p.correct}/{p.attempts} correct</span>
                    <span style={styles.activityDate}>{fmtDate(p.lastPracticed)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {allActivity.length === 0 && (
        <div style={{ ...styles.emptyState, marginTop: 40 }}>
          No quiz records yet — start practicing to see your history here!
        </div>
      )}
    </div>
  );
}

function BigStat({ icon, value, label, color }) {
  return (
    <div style={styles.bigStat}>
      <div style={{ ...styles.bigStatIcon, color, background: `${color}15` }}>{icon}</div>
      <div>
        <div style={styles.bigStatValue}>{value}</div>
        <div style={styles.bigStatLabel}>{label}</div>
      </div>
    </div>
  );
}

// ---------- BADGES ----------
function BadgesScreen({ stats, onBack }) {
  return (
    <div style={styles.container} className="resp-container">
      <BackBtn onClick={onBack} label="Back home" />
      <div style={styles.badgesHero} className="badges-hero">
        <Trophy size={48} color="#525AFF" />
        <div>
          <h1 style={styles.dashHeroTitle} className="dash-hero-title">Badges & Achievements</h1>
          <p style={styles.dashHeroSub}>
            You've earned {stats.earnedBadges.length} of {BADGES.length} badges so far!
          </p>
        </div>
      </div>

      <div style={styles.badgeGrid}>
        {BADGES.map(b => {
          const earned = stats.earnedBadges.includes(b.id);
          return (
            <div key={b.id} style={{
              ...styles.badgeCard,
              background: earned ? 'linear-gradient(135deg, #FFF8E1, #FFE082)' : '#F9FAFB',
              borderColor: earned ? '#525AFF' : '#E5E7EB',
            }}>
              <div style={{
                ...styles.badgeEmoji,
                filter: earned ? 'none' : 'grayscale(1)',
                opacity: earned ? 1 : 0.4,
              }}>
                {b.icon}
              </div>
              <h3 style={{ ...styles.badgeName, color: earned ? '#1F2937' : '#6B7280' }}>{b.name}</h3>
              <p style={styles.badgeDesc}>{b.desc}</p>
              {earned ? (
                <div style={styles.badgeEarned}><CheckCircle2 size={14} /> Earned</div>
              ) : (
                <div style={styles.badgeLocked}><Lock size={12} /> Locked</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- SHARED COMPONENTS ----------
function SectionHeader({ title, subtitle, icon }) {
  return (
    <div style={styles.sectionHeader}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon}
        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>
      <p style={styles.sectionSub}>{subtitle}</p>
    </div>
  );
}

function BackBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={styles.backBtn}>
      <ChevronLeft size={18} /> {label}
    </button>
  );
}

function Footer({ onAbout }) {
  const cols = [
    {
      heading: 'What we offer',
      links: ['For schools', 'For teachers', 'For students', 'For parents', 'For high schools', 'For homeschools', 'WIJS Analytics', 'WIJS ELA'],
    },
    {
      heading: 'Resources',
      links: ['Skill plans', 'Awards', 'Diagnostic', 'Real-Time Diagnostic', 'State standards', 'Common Core', 'Site map'],
    },
    {
      heading: 'About',
      links: ['About us', 'Blog', 'Careers', 'Contact us', 'Privacy policy'],
    },
    {
      heading: 'International',
      links: ['Australia', 'Canada', 'India', 'New Zealand', 'Singapore', 'South Africa', 'United Kingdom'],
    },
  ];
  return (
    <footer style={styles.footer}>
      <div style={styles.footerInner}>
        <div style={styles.footerTop} className="footer-top">
          <div style={styles.footerBrand}>
            <span style={styles.footerLogo}>
              <span style={styles.logoCapSection}>🎓</span>
              <span style={styles.logoWordmark}>WIJS</span>
            </span>
            <p style={styles.footerTagline}>
              Personalized learning for Kindergarten through Grade 5.
            </p>
            <button style={styles.footerJoinBtn}>Join now</button>
          </div>
          <div style={styles.footerCols} className="footer-cols">
            {cols.map(col => (
              <div key={col.heading} style={styles.footerCol}>
                <h4 style={styles.footerColHead}>{col.heading}</h4>
                {col.links.map(link => (
                  <div key={link} style={{ ...styles.footerLink, cursor: link === 'About us' ? 'pointer' : 'default' }}
                    onClick={link === 'About us' && onAbout ? onAbout : undefined}
                  >{link}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={styles.footerBottom}>
          <span>© {new Date().getFullYear()} WIJS, LLC. All rights reserved.</span>
          <span style={{ color: '#9CA3AF', marginLeft: 16 }}>Privacy policy · Terms of service</span>
        </div>
      </div>
    </footer>
  );
}

// ---------- HELPERS ----------
function difficultyLabel(d) { return d === 1 ? 'Easy' : d === 2 ? 'Medium' : 'Hard'; }
function difficultyColor(d) { return d === 1 ? '#059669' : d === 2 ? '#6D8BC0' : '#DC2626'; }
function randomCheer() {
  const cheers = ['Great job! 🎉', 'Awesome! ⭐', 'You got it! 🌟', 'Excellent! 💯', 'Nailed it! 🚀', 'Brilliant! ✨'];
  return cheers[Math.floor(Math.random() * cheers.length)];
}

// ---------- CSS INJECTION ----------
function StyleInjector() {
  return (
    <style>{`
      @font-face {
        font-family: 'Mona Sans';
        src: url('https://github.githubassets.com/assets/mona-sans.woff2') format('woff2-variations');
        font-weight: 200 900;
        font-stretch: 75% 125%;
        font-display: swap;
      }

      html { overflow-x: hidden; width: 100%; }
      body { margin: 0; padding: 0; overflow-x: hidden; -webkit-text-size-adjust: 100%; width: 100%; }
      #root { width: 100%; }
      *, *::before, *::after { box-sizing: border-box; }
      img, video, iframe, svg { max-width: 100%; height: auto; }

      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0); }
        50% { transform: translateY(-20px) rotate(8deg); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pop {
        0% { transform: scale(0.8); opacity: 0; }
        80% { transform: scale(1.05); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%      { transform: translateX(-10px); }
        40%      { transform: translateX(10px); }
        60%      { transform: translateX(-6px); }
        80%      { transform: translateX(6px); }
      }
      @keyframes bounceIn {
        0%   { transform: scale(0.5); opacity: 0; }
        60%  { transform: scale(1.09); }
        100% { transform: scale(1);   opacity: 1; }
      }
      @keyframes confettiFall {
        0%   { transform: translateY(0)    rotate(0deg);   opacity: 1; }
        85%  { opacity: 0.9; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
      @keyframes floatSpark {
        0%   { transform: translateY(0px) scale(1) rotate(0deg);   opacity: 0.85; }
        100% { transform: translateY(-10px) scale(1.15) rotate(18deg); opacity: 1; }
      }
      @keyframes mascotBounce {
        0%, 100% { transform: translateY(0)   scale(1);    }
        30%      { transform: translateY(-18px) scale(1.2); }
        60%      { transform: translateY(-8px)  scale(1.08); }
      }
      @keyframes questionSlide {
        from { opacity: 0; transform: translateX(32px) scale(0.98); }
        to   { opacity: 1; transform: translateX(0)    scale(1);    }
      }
      @keyframes correctPulse {
        0%   { box-shadow: 0 0 0 0   rgba(5,150,105,0.5); }
        70%  { box-shadow: 0 0 0 14px rgba(5,150,105,0);  }
        100% { box-shadow: 0 0 0 0   rgba(5,150,105,0);   }
      }
      @keyframes starFloat {
        from { opacity: 1; transform: translateY(0)    scale(0.8); }
        to   { opacity: 0; transform: translateY(-90px) scale(1.4); }
      }
      @keyframes growBar {
        from { width: 0 !important; }
      }
      @keyframes wiggle {
        0%, 100% { transform: rotate(0);    }
        25%      { transform: rotate(-8deg); }
        75%      { transform: rotate(8deg);  }
      }
      @keyframes pipPop {
        0%   { transform: scale(0.6); opacity: 0; }
        70%  { transform: scale(1.12); }
        100% { transform: scale(1);   opacity: 1; }
      }
      @keyframes popupFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes popupSlideUp {
        from { opacity: 0; transform: translateY(40px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0)    scale(1); }
      }
      @keyframes floatEmoji {
        0%,100% { transform: translateY(0)    rotate(0deg); }
        33%     { transform: translateY(-14px) rotate(6deg); }
        66%     { transform: translateY(-7px)  rotate(-4deg); }
      }
      @keyframes pulseGlow {
        0%,100% { box-shadow: 0 0 0 0 rgba(61,175,82,0.45); }
        50%     { box-shadow: 0 0 0 12px rgba(61,175,82,0); }
      }
      @keyframes trailBounce {
        0%,100% { transform: translateY(0) scale(1); }
        40%     { transform: translateY(-6px) scale(1.06); }
      }

      @keyframes dropdownSlide {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      @keyframes searchFocusRing {
        0%   { border-color: #EA4C89; box-shadow: 0 0 0 3px rgba(234,76,137,0.18); }
        25%  { border-color: #525AFF; box-shadow: 0 0 0 3px rgba(82,90,255,0.18); }
        50%  { border-color: #0EA5E9; box-shadow: 0 0 0 3px rgba(14,165,233,0.18); }
        75%  { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16,185,129,0.18); }
        100% { border-color: #EA4C89; box-shadow: 0 0 0 3px rgba(234,76,137,0.18); }
      }
      .h-search-focus {
        animation: searchFocusRing 3s linear infinite !important;
        background: #ffffff !important;
        transition: background 0.2s ease;
      }
      .mega-link { display: block; width: 100%; text-align: left; background: none; border: none; cursor: pointer; padding: 6px 10px; border-radius: 8px; font-size: 13.5px; color: #374151; font-weight: 500; transition: background 0.15s, color 0.15s; }
      .mega-link:hover { background: #f0fdf4; color: #166534; }
      .mega-sub-link { display: block; width: 100%; text-align: left; background: none; border: none; cursor: pointer; padding: 3px 10px; border-radius: 6px; font-size: 12.5px; color: #6B7280; font-weight: 500; transition: background 0.15s, color 0.15s; }
      .mega-sub-link:hover { background: #F0FAFF; color: #525AFF; }
      .nav-learning-wrap { position: relative; }

      .popup-close:hover { background: #fee2e2 !important; color: #dc2626 !important; transform: scale(1.12); }
      .popup-trial-btn:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 8px 28px rgba(61,175,82,0.45) !important; }
      .popup-later:hover { text-decoration: underline; color: #374151 !important; }
      .popup-feature:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,0.10) !important; }

      .mcq-btn-wrap { transition: transform 0.13s ease, box-shadow 0.13s ease; }
      .mcq-btn-wrap:not([disabled]):hover {
        transform: scale(1.025) translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(0,0,0,0.11) !important;
        z-index: 1;
      }
      .correct-flash { animation: correctPulse 0.55s ease; }
      .wrong-shake   { animation: shake 0.42s ease; }
      .practice-start-btn { transition: transform 0.14s ease, filter 0.14s ease, box-shadow 0.14s ease; }
      .practice-start-btn:hover { transform: scale(1.05) !important; filter: brightness(1.06) !important; box-shadow: 0 8px 28px rgba(0,0,0,0.16) !important; }
      .hint-btn-anim { animation: wiggle 1.5s ease-in-out 1.8s 2; }
      .next-btn { transition: transform 0.13s ease, box-shadow 0.13s ease; }
      .next-btn:hover { transform: scale(1.04) !important; box-shadow: 0 6px 18px rgba(0,0,0,0.13) !important; }
      .subject-card-anim:hover { transform: translateY(-4px) scale(1.01) !important; box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important; }
      .badge-card-anim:hover { transform: scale(1.06) !important; }

      .art-photo-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
      .art-photo-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.18) !important; }
      .art-photo-card:hover img { transform: scale(1.04); }
      .grade-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
      .skill-card:hover { transform: translateX(4px); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
      .lc-grade-row:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }

      input:focus, button:focus-visible { outline: 3px solid #525AFF44; outline-offset: 2px; }
      .h-search input:focus { outline: none; }
      button { font-family: inherit; }
      input, select, textarea { max-width: 100%; }

      /* ── HEADER RESPONSIVE ── */
      .h-hamburger { display: flex !important; }
      .h-search    { display: none !important; }
      .h-nav       { display: none !important; }
      .h-actions   { display: none !important; }

      @media (min-width: 769px) {
        .h-hamburger { display: none !important; }
        .h-search    { display: flex !important; }
        .h-nav       { display: flex !important; }
        .h-actions   { display: flex !important; }
      }

      .h-drop-item:hover { background: #F9FAFB !important; }
      .h-drop-item:hover .h-drop-label { color: #111827 !important; }
      .h-suggest-item:hover { background: #F5F7FF !important; }
      .mega-heading:hover { color: #065F7A !important; }
      .mega-link:hover { color: #065F7A !important; text-decoration: underline; }

      /* ── TABLET (≤900px) ── */
      @media (max-width: 900px) {
        .art-hero { padding: 52px 0 60px !important; }
        .art-hero-inner { gap: 40px !important; padding: 0 20px !important; }
        .art-hero-right { flex-basis: 520px !important; width: min(100%, 580px) !important; }
        .art-cards-grid, .art-why-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .art-photos-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 16px !important; }
        .hero-clouds, .grade-catalog-grid, .grade8-skill-columns,
        .support-grid, .impact-grid, .home-stats, .promo-cards, .responsive-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
        .pricing-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      }

      /* ── MOBILE (≤768px) — iPad portrait + large phones ── */
      @media (max-width: 768px) {
        /* containers */
        .resp-container { padding: 20px 16px !important; }

        /* home hero */
        .art-hero { padding: 40px 0 48px !important; }
        .art-hero-inner {
          flex-direction: column !important;
          padding: 0 16px !important;
          gap: 28px !important;
          text-align: center !important;
          align-items: center !important;
        }
        .art-hero-left { max-width: 100% !important; flex-basis: 100% !important; }
        .art-hero-right {
          display: flex !important;
          width: min(100%, 430px) !important;
          min-height: 328px !important;
          justify-content: center !important;
          flex-basis: 430px !important;
        }
        .art-hero-photo-stage {
          position: relative !important;
          left: auto !important; top: auto !important; bottom: auto !important;
          width: min(100%, 390px) !important;
          height: 320px !important;
        }
        .art-subject-stack { display: none !important; }
        .art-hero-photo-card:nth-child(1) { left: 8px !important; top: 38px !important; width: 220px !important; height: 248px !important; }
        .art-hero-photo-card:nth-child(2) { left: 205px !important; top: 0 !important; width: 150px !important; height: 150px !important; }
        .art-hero-photo-card:nth-child(3) { left: 156px !important; bottom: 0 !important; width: 168px !important; height: 142px !important; }
        .art-hero-photo-card:nth-child(4) { left: 292px !important; top: 142px !important; width: 92px !important; height: 142px !important; }
        .art-tags-row { justify-content: center !important; }
        .app-badges-row { justify-content: center !important; }

        /* home sections */
        .art-section { padding: 40px 16px !important; }
        .art-section-wrap { padding-left: 16px !important; padding-right: 16px !important; }
        .art-cards-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
        .art-why-grid   { grid-template-columns: 1fr 1fr !important; gap: 14px !important; }
        .art-start-inner { grid-template-columns: 1fr !important; gap: 20px !important; }
        .art-cta-card { padding: 36px 20px !important; }
        .art-cta-contact-row { flex-direction: column !important; }

        /* grade screen header */
        .grade-header {
          flex-direction: column !important;
          text-align: center !important;
          padding: 24px 16px !important;
          gap: 10px !important;
        }

        /* typography */
        .dash-hero-title { font-size: clamp(24px, 6vw, 36px) !important; }

        /* subject screen */
        .subject-sidebar { display: none !important; }
        .subject-nav-tabs {
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          gap: 12px !important;
          padding-bottom: 4px !important;
          scrollbar-width: none !important;
        }
        .subject-nav-tabs::-webkit-scrollbar { display: none; }

        /* pricing plans */
        .pricing-grid { grid-template-columns: 1fr !important; }

        /* badges */
        .badges-hero {
          flex-direction: column !important;
          text-align: center !important;
          align-items: center !important;
        }

        /* login role picker */
        .role-grid { grid-template-columns: repeat(2, 1fr) !important; }

        /* footer */
        .footer-top { display: flex !important; flex-direction: column !important; gap: 28px !important; }
        .footer-cols { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }

        .grade-card { min-width: 0 !important; }
        input { min-width: 0; }
      }

      /* ── SMALL TABLET / LARGE PHONE (≤640px) ── */
      @media (max-width: 640px) {
        .art-why-grid { grid-template-columns: 1fr !important; }
        .art-stats-row { grid-template-columns: 1fr 1fr !important; }
        .hero-clouds, .grade-catalog-grid, .grade8-skill-columns,
        .support-grid, .impact-grid, .home-stats, .promo-cards, .responsive-grid,
        .art-photos-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
        .art-photos-sec { padding: 48px 16px !important; }
        .art-cards-grid, .art-why-grid, .art-start-inner {
          grid-template-columns: 1fr !important;
        }
        .payment-form, .admin-form { grid-template-columns: 1fr !important; }
        .report-row { display: flex !important; flex-direction: column !important; gap: 4px !important; }
        .activity-row { grid-template-columns: 40px 1fr !important; }
      }

      /* ── PHONE (≤480px) — iPhone SE, small Androids ── */
      @media (max-width: 480px) {
        .resp-container { padding: 16px 12px !important; }
        .art-cta-card { padding: 28px 14px !important; }
        .art-cta-contact-row { gap: 16px !important; }
        .footer-cols { grid-template-columns: 1fr !important; }
        .art-grades-row button,
        .art-grades-row span { padding: 6px 10px !important; font-size: 12px !important; }
        .art-hero-right { min-height: 284px !important; flex-basis: 330px !important; }
        .art-hero-photo-stage { height: 280px !important; width: min(100%, 330px) !important; }
        .art-hero-photo-card { border-width: 5px !important; }
        .art-hero-photo-card:nth-child(1) { width: 190px !important; height: 218px !important; left: 0 !important; top: 34px !important; }
        .art-hero-photo-card:nth-child(2) { width: 126px !important; height: 126px !important; left: 184px !important; }
        .art-hero-photo-card:nth-child(3) { width: 150px !important; height: 118px !important; left: 138px !important; }
        .art-hero-photo-card:nth-child(4) { width: 78px !important; height: 118px !important; left: 254px !important; top: 136px !important; }

        /* typography */
        .dash-hero-title { font-size: clamp(20px, 7vw, 28px) !important; }

        /* login card */
        .login-card { padding: 28px 18px !important; border-radius: 16px !important; }

        /* grade header */
        .grade-header { padding: 18px 14px !important; }
        .subject-nav-tabs { gap: 8px !important; }
      }

      /* -- ILLUSTRATED HERO BG -- */
      .art-illustrated-bg { width: 430px; }
      @media (max-width: 768px) {
        .art-illustrated-bg { width: min(100%, 430px) !important; left: 50% !important; transform: translateX(-50%); }
      }
      @media (max-width: 480px) {
        .art-illustrated-bg { width: min(100%, 340px) !important; }
      }

      /* -- SKILL PRACTICE LAYOUT -- */
      @media (max-width: 640px) {
        .skill-practice-layout { flex-direction: column !important; }
        .skill-practice-sidebar {
          width: 100% !important;
          flex-direction: row !important;
          flex-wrap: wrap !important;
          order: 0 !important;
          gap: 8px !important;
        }
        .skill-practice-sidebar > div { flex: 1 1 120px; min-width: 100px; }
      }

      /* -- TAB BAR SCROLLING -- */
      .lc-tab-bar { scrollbar-width: none !important; }
      .lc-tab-bar::-webkit-scrollbar { display: none; }
      .lc-tab-bar { overflow-x: auto !important; }

      /* fade hint on right edge for mobile */
      .lc-tab-bar-wrap { position: relative; }
      .lc-tab-bar-wrap::after {
        content: '';
        position: absolute; top: 0; right: 0; bottom: 0;
        width: 40px;
        background: linear-gradient(to right, transparent, white);
        pointer-events: none;
        z-index: 2;
      }

      @media (max-width: 768px) {
        .lc-tab-bar { -webkit-overflow-scrolling: touch !important; scroll-snap-type: x mandatory !important; }
        .lc-tab-bar > div { padding: 0 8px !important; gap: 0 !important; flex-wrap: nowrap !important; }
        .lc-tab { padding: 8px 14px 6px !important; min-width: 72px !important; flex-shrink: 0 !important; font-size: 11px !important; scroll-snap-align: start; }
        .lc-tab svg { width: 16px !important; height: 16px !important; }
        .lc-tab .lc-tab-label { display: none !important; }
        .lc-tab .lc-tab-label-short { display: block !important; }
        .lc-tab .lc-soon-badge { font-size: 8px !important; padding: 0px 3px !important; }
      }
      @media (min-width: 769px) {
        .lc-tab .lc-tab-label { display: block !important; }
        .lc-tab .lc-tab-label-short { display: none !important; }
        .lc-tab-bar-wrap::after { display: none; }
      }

      /* -- MISC COMPONENTS -- */
      .test-stack span {
        position: absolute; top: 8px; width: 58px; height: 76px;
        border-radius: 6px;
        background: linear-gradient(160deg, #A78BFA, #525AFF);
        color: white; display: flex; align-items: center; justify-content: center;
        font-weight: 900; box-shadow: 0 8px 14px rgba(0,0,0,0.15); border: 3px solid white;
      }
      .test-stack span:first-child { left: 10px; transform: rotate(-14deg); }
      .test-stack span:last-child  { left: 58px; transform: rotate(9deg); }

      .promo-cards strong {
        display: block; font-family: ${FONT_DISPLAY};
        font-size: 26px; color: #00913c; margin-bottom: 4px; font-weight: 700;
      }
      .promo-cards p  { margin: 0 0 10px; font-size: 14px; color: #2f4a36; }
      .promo-cards em {
        display: inline-flex; align-items: center; gap: 6px;
        font-style: normal; color: #008C2E; font-weight: 700;
      }

      .payment-form label, .admin-form label {
        display: flex; flex-direction: column; gap: 7px;
        font-size: 13px; font-weight: 800; color: #334155;
      }
      label input, label select, label textarea {
        width: 100%; border: 2px solid #F0E6D6; border-radius: 10px;
        padding: 11px 12px; font-family: ${FONT_BODY}; font-size: 14px; background: #F8FBFF;
      }
      label textarea { min-height: 92px; resize: vertical; }
    `}</style>
  );
}

// ---------- STYLES ----------
const FONT_BODY    = '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
const FONT_DISPLAY = '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';

const styles = {
  app: {
    minHeight: '100vh',
    width: '100%',
    fontFamily: FONT_BODY,
    background: '#F5FBFF',
    color: '#1C1215',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
  },
  main: { flex: 1, paddingBottom: 0, width: '100%' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px' },
  productHero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 24,
    background: 'white',
    border: '1px solid #F0E6D6',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 12px 30px rgba(82,90,255,0.07)',
    flexWrap: 'wrap',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.2,
    color: '#525AFF',
    textTransform: 'uppercase',
  },
  heroMiniPanel: {
    minWidth: 240,
    maxWidth: 320,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    background: '#F0FAFF',
    border: '1px solid #B8E4FB',
    borderRadius: 14,
    padding: 16,
    color: '#4C1D95',
  },
  responsiveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
  },
  actionCard: {
    background: 'white',
    border: '1px solid #F0E6D6',
    borderRadius: 14,
    padding: 16,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: '0 8px 18px rgba(82,90,255,0.06)',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 900,
    color: '#1C1215',
  },
  actionText: {
    margin: '6px 0',
    fontSize: 13,
    lineHeight: 1.45,
    color: '#6B5E55',
  },
  actionMeta: {
    fontSize: 12,
    color: '#525AFF',
    fontWeight: 800,
  },
  actionCta: {
    marginLeft: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: '#525AFF',
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  parentSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#F0FAFF',
    borderRadius: 14,
    padding: 14,
    minWidth: 240,
  },
  parentAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#525AFF',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
  },
  reportPanel: {
    background: 'white',
    border: '1px solid #F0E6D6',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 8px 22px rgba(82,90,255,0.06)',
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    color: '#334155',
  },
  activityWeekRow: {
    display: 'grid',
    gridTemplateColumns: '48px 1fr 64px',
    gap: 12,
    alignItems: 'center',
    padding: '10px 0',
  },
  activityTrack: {
    height: 12,
    borderRadius: 999,
    background: '#E2E8F0',
    overflow: 'hidden',
  },
  activityFill: {
    height: '100%',
    borderRadius: 999,
  },
  quickActions: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 24,
  },
  primaryAction: {
    background: '#525AFF',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    padding: '12px 18px',
    fontSize: 14,
    fontWeight: 900,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 4px 12px rgba(82,90,255,0.28)',
  },
  secondaryAction: {
    background: 'white',
    color: '#525AFF',
    border: '2px solid #B8E4FB',
    borderRadius: 10,
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 900,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reportTable: {
    background: 'white',
    border: '1px solid #F0E6D6',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 8px 22px rgba(82,90,255,0.06)',
  },
  reportRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
    gap: 12,
    alignItems: 'center',
    padding: '14px 18px',
    borderTop: '1px solid #E2E8F0',
    fontSize: 14,
  },
  reportRowHead: {
    borderTop: 'none',
    background: '#F0FAFF',
    color: '#525AFF',
    fontWeight: 900,
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 18,
    marginTop: 28,
  },
  planCard: {
    position: 'relative',
    background: 'white',
    border: '1px solid #F0E6D6',
    borderRadius: 18,
    padding: 24,
    boxShadow: '0 8px 24px rgba(82,90,255,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  planFeatured: {
    border: '2px solid #525AFF',
    transform: 'translateY(-4px)',
  },
  planBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    background: '#D97706',
    color: 'white',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 900,
  },
  planName: {
    margin: 0,
    fontFamily: FONT_DISPLAY,
    fontSize: 28,
    color: '#525AFF',
  },
  planPrice: {
    fontSize: 42,
    fontWeight: 900,
    color: '#1C1215',
  },
  planFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#334155',
    fontSize: 14,
  },
  paymentForm: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 14,
    background: 'white',
    border: '1px solid #F0E6D6',
    borderRadius: 16,
    padding: 20,
  },
  adminForm: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 14,
    background: 'white',
    border: '1px solid #F0E6D6',
    borderRadius: 16,
    padding: 20,
  },
  statusPill: {
    display: 'inline-flex',
    width: 'fit-content',
    borderRadius: 999,
    background: '#DCFCE7',
    color: '#15803D',
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 900,
  },

  // Header
  header: {
    background: '#2D1B69',
    borderBottom: 'none',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 2px 16px rgba(45,27,105,0.45)',
  },
  headerInner: {
    maxWidth: 1120, margin: '0 auto', padding: '10px 20px 0',
    display: 'flex', flexDirection: 'column',
    gap: 8,
  },
  headerTopRow: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    display: 'flex', alignItems: 'center',
    background: 'transparent', border: 'none', cursor: 'pointer',
    padding: 0, flexShrink: 0,
  },
  logoMark: {
    height: 38, borderRadius: 8,
    display: 'inline-flex', alignItems: 'stretch',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.28)',
  },
  logoCapSection: {
    background: '#1E0F4A',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 9px',
    fontSize: 18,
    borderRight: '2px solid rgba(255,255,255,0.15)',
    flexShrink: 0,
  },
  logoWordmark: {
    background: 'linear-gradient(135deg, #3B1F5E 0%, #525AFF 100%)',
    display: 'flex', alignItems: 'center',
    padding: '0 14px 0 9px',
    color: '#E0F4FF',
    fontWeight: 900, fontSize: 17,
    fontFamily: FONT_DISPLAY,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
  },
  logoIcon: {
    width: 40, height: 40, borderRadius: 12,
    background: 'linear-gradient(135deg, #525AFF 0%, #8FD9FB 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white',
    boxShadow: '0 4px 12px rgba(82,90,255,0.4)',
  },
  logoText: { fontFamily: FONT_BODY, fontSize: 14, fontWeight: 800, color: 'white', lineHeight: 1 },
  logoTag: { fontSize: 11, color: '#6B7280', marginTop: 2, fontWeight: 500 },

  headerNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    width: '100%',
    paddingBottom: 4,
  },
  navLink: {
    background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.92)',
    fontSize: 21, fontWeight: 500, cursor: 'pointer',
    padding: '2px 0 10px',
    fontFamily: FONT_DISPLAY,
    display: 'inline-flex', alignItems: 'center', gap: 5,
    position: 'relative',
    transition: 'color 0.15s',
  },
  navLinkActive: {
    color: 'white',
    fontWeight: 700,
  },
  navActiveCaret: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: '9px solid white',
  },
  searchWrap: {
    height: 36, borderRadius: 999, background: 'white',
    display: 'flex', alignItems: 'center',
    padding: 0, border: 'none',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  searchInput: {
    border: 'none', outline: 'none', flex: 1,
    fontSize: 14, color: '#374151', fontFamily: FONT_BODY,
    padding: '0 8px',
    background: 'transparent',
  },
  searchIcon: {
    width: 38,
    height: 36,
    background: '#525AFF',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: '999px 0 0 999px',
  },
  searchSubmit: {
    width: 36,
    height: 34,
    background: 'transparent',
    border: 'none',
    borderLeft: '1px solid #D1D5DB',
    color: '#9CA3AF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },

  headerStats: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  statChip: {
    display: 'inline-flex', alignItems: 'center',
    padding: '4px 8px', borderRadius: 999,
    border: '1px solid', background: 'white',
    fontSize: 12, fontWeight: 800,
  },

  headerActions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  topRoleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: 3,
    borderRadius: 6,
    background: 'rgba(255,255,255,0.2)',
  },
  topRoleBtn: {
    height: 24,
    padding: '0 7px',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.45)',
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 800,
    cursor: 'pointer',
  },
  topRoleBtnActive: {
    background: 'white',
    color: '#525AFF',
    borderColor: 'white',
  },
  iconBtn: {
    width: 34, height: 34, borderRadius: 5,
    background: '#525AFF', border: '1px solid rgba(255,255,255,0.5)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', transition: 'all 0.15s',
  },
  resetBtn: {
    width: 32, height: 32, borderRadius: 5,
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.35)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white',
  },
  hamburgerBtn: {
    width: 36, height: 36, borderRadius: 6,
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.35)',
    cursor: 'pointer',
    display: 'none',
    alignItems: 'center', justifyContent: 'center',
    color: 'white', flexShrink: 0,
  },
  mobileMenu: {
    display: 'flex', flexDirection: 'column',
    background: '#1E0F4A',
    borderTop: '1px solid rgba(255,255,255,0.15)',
    paddingBottom: 8,
  },
  mobileNavLink: {
    background: 'none', border: 'none',
    color: 'rgba(255,255,255,0.88)',
    fontSize: 17, fontWeight: 600,
    padding: '13px 20px', textAlign: 'left', cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    fontFamily: FONT_DISPLAY,
    width: '100%',
  },
  mobileNavLinkActive: {
    color: 'white', background: 'rgba(255,255,255,0.08)', fontWeight: 800,
  },
  mobileMenuDivider: {
    height: 1, background: 'rgba(255,255,255,0.18)', margin: '6px 0',
  },
  signInBtn: {
    height: 36,
    padding: '0 18px',
    border: 'none',
    borderRadius: 6,
    background: '#D97706',
    color: 'white',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.1,
    boxShadow: '0 2px 8px rgba(217,119,6,0.35)',
  },
  membershipBtn: {
    height: 36,
    padding: '0 18px',
    border: '1.5px solid #B8E4FB',
    borderRadius: 6,
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.1,
  },
  userBadge: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '4px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.35)', color: 'white',
  },
  avatar: {
    width: 20, height: 20, borderRadius: '50%',
    background: '#D97706',
    color: 'white', fontWeight: 700, fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  // Login
  loginWrap: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(135deg, #F0FAFF 0%, #E0F4FF 45%, #FFF7ED 100%)',
  },
  loginBg: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 },
  loginCard: {
    background: 'white', borderRadius: 24, padding: 40,
    boxShadow: '0 24px 64px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)',
    maxWidth: 480, width: '100%', position: 'relative', zIndex: 1,
    animation: 'slideUp 0.5s ease',
  },
  loginHero: { textAlign: 'center' },
  loginLogo: {
    width: 72, height: 72, margin: '0 auto', borderRadius: 20,
    background: 'linear-gradient(135deg, #525AFF 0%, #8FD9FB 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white',
    boxShadow: '0 8px 24px rgba(82,90,255,0.4)',
  },
  loginTitle: {
    fontFamily: FONT_DISPLAY, fontSize: 42, fontWeight: 900,
    margin: '20px 0 8px', color: '#1F2937', letterSpacing: '-0.02em',
  },
  loginSub: { fontSize: 15, color: '#6B7280', margin: 0 },
  fieldLabel: { display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 },
  input: {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    border: '2px solid #E5E7EB', fontSize: 16, fontFamily: FONT_BODY,
    transition: 'border-color 0.15s', background: '#FAFBFF',
  },
  roleGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 },
  roleBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '14px 8px', borderRadius: 12, border: '2px solid',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  primaryBtn: {
    width: '100%', marginTop: 24, padding: '14px 20px',
    background: 'linear-gradient(135deg, #525AFF 0%, #8FD9FB 100%)',
    color: 'white', border: 'none', borderRadius: 14,
    fontSize: 16, fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: '0 8px 20px rgba(82,90,255,0.38)',
    transition: 'transform 0.1s',
  },
  loginNote: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16 },

  // Hero
  hero: {
    display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48,
    alignItems: 'center',
  },
  heroLeft: {},
  heroBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 999,
    background: 'linear-gradient(135deg, #E0F4FF 0%, #FDE8BB 100%)',
    fontSize: 12, fontWeight: 700, color: '#3A41CC',
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: FONT_DISPLAY, fontSize: 'clamp(36px, 5vw, 56px)',
    fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.025em',
    margin: 0, color: '#1F2937',
  },
  heroName: {
    background: 'linear-gradient(135deg, #525AFF 0%, #EC4899 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroEmphasis: {
    fontStyle: 'italic',
    color: '#525AFF',
  },
  heroDesc: { fontSize: 17, color: '#4B5563', marginTop: 16, lineHeight: 1.6, maxWidth: 540 },
  heroStats: { display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' },
  heroStatCard: {
    padding: '14px 20px', borderRadius: 14, background: 'white',
    border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  heroStatValue: { fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 900, lineHeight: 1 },
  heroStatLabel: { fontSize: 12, color: '#6B7280', fontWeight: 600, marginTop: 4 },

  heroRight: {},

  redesignHero: {
    position: 'relative',
    minHeight: 398,
    background: 'linear-gradient(180deg, #FFF7ED 0%, #FECBA1 48%, #FCA572 68%, #F97316 80%, #525AFF 85%, #4C1D95 100%)',
    overflow: 'hidden',
    borderBottom: 'none',
  },
  heroSkyline: {
    position: 'absolute',
    left: 0,
    bottom: 42,
    width: '38%',
    height: 120,
    opacity: 1,
    background: 'linear-gradient(120deg, transparent 0 22%, #FECBA1 22% 30%, transparent 30%), linear-gradient(90deg, #FDE8BB 0 22%, transparent 22% 28%, #FDE8BB 28% 50%, transparent 50% 56%, #FDE8BB 56% 78%, transparent 78%)',
    borderBottom: '12px solid #525AFF',
  },
  heroHills: {
    position: 'absolute',
    left: -90,
    right: -90,
    bottom: -54,
    height: 150,
    background: 'radial-gradient(ellipse at 20% 68%, #4C1D95 0 28%, transparent 29%), radial-gradient(ellipse at 66% 74%, #3A41CC 0 31%, transparent 32%), radial-gradient(ellipse at 94% 66%, #525AFF 0 28%, transparent 29%)',
  },
  heroBalloon: {
    position: 'absolute',
    left: 70,
    top: 18,
    width: 88,
    height: 136,
    borderRadius: '50% 50% 45% 45%',
    background: 'radial-gradient(circle at 30% 30%, #FEF3C7 0 10%, transparent 11%), repeating-linear-gradient(90deg, #FCA5A5 0 15px, #F97316 15px 18px)',
    border: '2px solid #F97316',
    boxShadow: '0 100px 0 -36px #525AFF',
  },
  heroSun: {
    position: 'absolute',
    left: 244,
    top: 32,
    width: 70,
    height: 70,
    borderRadius: '50%',
    background: 'radial-gradient(circle, #FFFDE7 0 30%, #FDE68A 31% 62%, rgba(253,230,138,0.25) 63%)',
    boxShadow: '0 0 0 12px rgba(251,191,36,0.22)',
  },
  heroRocket: {
    position: 'absolute',
    right: 154,
    top: 46,
    width: 82,
    height: 82,
    background: 'linear-gradient(135deg, transparent 0 46%, #FCA5A5 47% 54%, transparent 55%), linear-gradient(35deg, transparent 0 45%, #FB923C 46% 54%, transparent 55%)',
    transform: 'rotate(-12deg)',
  },
  heroKid: {
    position: 'absolute',
    right: 76,
    top: 108,
    fontSize: 74,
    transform: 'rotate(8deg)',
  },
  heroRider: {
    position: 'absolute',
    left: 170,
    bottom: 38,
    fontSize: 80,
    transform: 'rotate(-7deg)',
  },
  heroInner: {
    position: 'relative',
    maxWidth: 940,
    margin: '0 auto',
    padding: '12px 16px 78px',
    textAlign: 'center',
    zIndex: 2,
  },
  heroKicker: {
    margin: '0 0 26px',
    color: '#3A41CC',
    fontSize: 42,
    fontFamily: FONT_DISPLAY,
    fontWeight: 500,
  },
  heroClouds: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.05fr 1fr',
    gap: 0,
    alignItems: 'start',
    maxWidth: 780,
    margin: '0 auto 28px',
  },
  learningCloud: {
    minHeight: 160,
    padding: '26px 26px 20px',
    background: 'rgba(255,255,255,0.88)',
    border: '1.5px solid',
    borderRadius: '44% 56% 50% 50% / 46% 48% 52% 54%',
    boxShadow: '0 8px 18px rgba(0,117,156,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    fontSize: 16,
    lineHeight: 1.45,
  },
  heroGreeting: {
    margin: '10px 0 12px',
    fontSize: 13,
    color: '#3A41CC',
    fontWeight: 700,
  },
  heroCta: {
    background: '#525AFF',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    padding: '10px 24px',
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 3px 0 #4C1D95',
  },
  ixlHero: {
    position: 'relative',
    background: 'linear-gradient(180deg, #F5FBFF 0%, #FEF3C7 35%, #FDE8BB 70%, #FCD34D 100%)',
    overflow: 'hidden',
    padding: '48px 220px 110px',
    minHeight: 360,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  ixlDeco: {
    position: 'absolute',
    lineHeight: 1,
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 1,
    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))',
  },
  ixlHeroContent: {
    position: 'relative',
    zIndex: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  ixlHeroTitle: {
    fontFamily: FONT_DISPLAY,
    fontSize: 46,
    fontWeight: 400,
    color: '#4C1D95',
    textAlign: 'center',
    margin: '0 0 28px',
    letterSpacing: '-0.01em',
  },
  ixlHeroIs: {
    fontWeight: 900,
    fontStyle: 'italic',
    color: '#525AFF',
  },
  ixlCloudsRow: {
    display: 'flex',
    gap: 18,
    justifyContent: 'center',
    marginBottom: 28,
    alignItems: 'flex-start',
  },
  ixlCloud: {
    background: 'rgba(255,255,255,0.94)',
    borderRadius: 20,
    padding: '22px 22px 16px',
    textAlign: 'center',
    width: 228,
    boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
  },
  ixlCloudCenter: {
    marginTop: 24,
  },
  ixlCloudTitle: {
    fontFamily: FONT_DISPLAY,
    fontSize: 19,
    fontWeight: 700,
    margin: '0 0 10px',
    lineHeight: 1.3,
  },
  ixlCloudBody: {
    fontSize: 13,
    color: '#374151',
    margin: '0 0 12px',
    lineHeight: 1.6,
  },
  ixlMemberBtn: {
    background: '#525AFF',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    padding: '13px 38px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 3px 0 #4C1D95',
    position: 'relative',
    zIndex: 4,
  },
  ixlWater: {
    position: 'absolute',
    bottom: 58,
    left: '35%',
    right: '35%',
    height: 28,
    background: '#6EE7B7',
    borderRadius: '50%',
    opacity: 0.7,
    zIndex: 2,
  },
  ixlHillBack: {
    position: 'absolute',
    bottom: 0,
    left: '-15%',
    right: '-15%',
    height: 85,
    background: '#F59E0B',
    borderRadius: '55% 55% 0 0',
    zIndex: 2,
  },
  ixlHillFront: {
    position: 'absolute',
    bottom: 0,
    left: '-25%',
    right: '-25%',
    height: 58,
    background: '#D97706',
    borderRadius: '45% 45% 0 0',
    zIndex: 3,
  },
  homePromoBand: {
    background: '#FFF7ED',
    borderBottom: 'none',
    padding: '30px 16px',
  },
  promoCards: {
    maxWidth: 1030,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 14,
  },
  promoCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 14,
    minHeight: 132,
    padding: '22px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    textAlign: 'left',
    color: '#1F2937',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  promoIcon: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: '#D97706',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  testStack: {
    position: 'relative',
    width: 126,
    height: 94,
    flexShrink: 0,
  },
  gradeCatalogSection: {
    background: '#F5FBFF',
    padding: '0 16px 38px',
  },
  gradeCatalogGrid: {
    maxWidth: 1030,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '30px 24px',
  },
  catalogCard: {
    background: 'white',
    border: '1px solid',
    borderRadius: 4,
    minHeight: 248,
    padding: '20px 20px 18px',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  catalogHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  catalogNumber: {
    width: 44,
    height: 38,
    borderRadius: '0 18px 18px 0',
    color: 'white',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 18,
    marginLeft: -24,
  },
  catalogTitle: {
    color: '#525AFF',
    fontSize: 30,
    fontFamily: FONT_DISPLAY,
    fontWeight: 500,
  },
  catalogDesc: {
    minHeight: 64,
    margin: '0 0 14px',
    color: '#374151',
    fontSize: 14,
    lineHeight: 1.48,
    borderBottom: '1px solid #DADADA',
    paddingBottom: 12,
  },
  catalogRows: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 8,
    fontSize: 14,
    color: '#374151',
  },
  catalogRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 6,
    borderBottom: 'none',
    paddingBottom: 0,
  },
  catalogProgress: {
    marginTop: 'auto',
    paddingTop: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#525AFF',
    fontSize: 12,
    fontWeight: 800,
  },
  skillsBand: {
    background: '#FFF7ED',
    padding: '36px 16px',
    textAlign: 'center',
  },
  bandTitle: {
    margin: 0,
    color: '#D97706',
    fontFamily: FONT_DISPLAY,
    fontSize: 28,
    fontWeight: 800,
  },
  bandSub: {
    margin: '6px auto 20px',
    maxWidth: 620,
    color: '#92400E',
    fontSize: 13,
  },
  skillCarousel: {
    maxWidth: 820,
    margin: '0 auto 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  skillTile: {
    width: 82,
    minHeight: 112,
    background: 'white',
    border: '1px solid #E8C5A0',
    borderRadius: 4,
    padding: 8,
    boxShadow: '0 5px 10px rgba(217,119,6,0.10)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontSize: 10,
    color: '#6B5E55',
  },
  skillTileIcon: {
    width: 46,
    height: 46,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenCta: {
    background: '#525AFF',
    color: 'white',
    border: 'none',
    borderRadius: 3,
    padding: '8px 18px',
    fontSize: 12,
    fontWeight: 900,
    cursor: 'pointer',
  },
  supportBand: {
    background: 'linear-gradient(180deg, #2D1B69 0%, #1E0F4A 100%)',
    padding: '32px 16px 38px',
    textAlign: 'center',
    color: 'white',
  },
  supportTitle: {
    margin: 0,
    fontFamily: FONT_DISPLAY,
    fontSize: 24,
    fontWeight: 800,
  },
  supportSub: {
    margin: '6px auto 20px',
    maxWidth: 700,
    fontSize: 13,
    opacity: 0.95,
  },
  supportGrid: {
    maxWidth: 980,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 0,
  },
  supportCard: {
    background: 'white',
    color: '#374151',
    minHeight: 190,
    padding: '20px 16px',
    border: '1px solid #B8E4FB',
  },
  supportIcon: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    border: '2px solid',
    margin: '0 auto 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportCta: {
    marginTop: 18,
    background: '#525AFF',
    color: 'white',
    border: 'none',
    borderRadius: 3,
    padding: '8px 22px',
    fontSize: 12,
    fontWeight: 900,
    cursor: 'pointer',
  },
  impactBand: {
    background: 'linear-gradient(180deg, #525AFF 0%, #3A41CC 100%)',
    padding: '28px 16px 42px',
    textAlign: 'center',
    color: 'white',
    borderTop: '1px solid rgba(255,255,255,0.15)',
  },
  impactTitle: {
    margin: '0 auto 22px',
    maxWidth: 720,
    fontFamily: FONT_DISPLAY,
    fontSize: 22,
    fontWeight: 800,
  },
  impactGrid: {
    maxWidth: 820,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 32,
  },
  impactCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  impactAvatar: {
    width: 66,
    height: 66,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FDE68A, #FCA5A5)',
    border: '3px solid white',
    color: '#525AFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactButton: {
    background: '#D97706',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: 2,
    padding: '5px 12px',
    fontSize: 11,
    fontWeight: 800,
    cursor: 'pointer',
  },
  homeStats: {
    maxWidth: 760,
    margin: '28px auto 0',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
  },

  // Dashboard preview
  dashPreview: {
    width: '100%', background: 'white', borderRadius: 20, padding: 24,
    border: '1px solid #E5E7EB', cursor: 'pointer', textAlign: 'left',
    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  dashPreviewHead: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  dashRing: {
    position: 'relative', width: 130, height: 130, margin: '0 auto 20px',
  },
  dashRingLabel: {
    position: 'absolute', inset: 0, display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  dashStats: { display: 'flex', flexDirection: 'column', gap: 10 },
  dashStatRow: {
    display: 'flex', justifyContent: 'space-between',
    paddingBottom: 8, borderBottom: '1px dashed #E5E7EB',
  },
  dashCTA: {
    marginTop: 12, padding: '10px 14px', borderRadius: 10,
    background: 'linear-gradient(135deg, #E0F4FF, #F0FAFF)',
    color: '#525AFF', fontWeight: 700, fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },

  // Section header
  sectionHeader: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 800,
    margin: 0, color: '#1F2937', letterSpacing: '-0.02em',
  },
  sectionSub: { fontSize: 15, color: '#6B7280', margin: '4px 0 0' },

  // Grade grid
  gradeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 16,
  },
  gradeCard: {
    position: 'relative', overflow: 'hidden',
    background: 'white', borderRadius: 18, padding: 20,
    border: '1px solid #F0E6D6', cursor: 'pointer', textAlign: 'left',
    transition: 'transform 0.2s, box-shadow 0.2s',
    minHeight: 140,
  },
  gradeEmoji: {
    width: 50, height: 50, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 26,
  },
  gradeLabel: {
    marginTop: 14, fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 800, color: '#1F2937',
  },
  gradeMeta: { fontSize: 12, color: '#6B7280', fontWeight: 500, marginTop: 4 },
  gradeAccent: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4 },

  // Subjects
  subjectGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
  subjectCard: {
    padding: 24, borderRadius: 18, textAlign: 'left',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  bigSubjectCard: {
    padding: 24, borderRadius: 18, textAlign: 'left',
    border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  subjectIcon: {
    width: 48, height: 48, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  subjectTitle: {
    fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 800,
    margin: '14px 0 4px', color: '#1F2937',
  },
  subjectTag: { fontSize: 13, color: '#6B7280', margin: 0 },
  subjectStats: {
    display: 'flex', gap: 16, marginTop: 14, fontSize: 13, color: '#374151',
  },
  miniProgressBar: {
    height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 4,
    marginTop: 12, overflow: 'hidden',
  },
  miniProgressFill: { height: '100%', borderRadius: 4, transition: 'width 0.4s' },
  subjectCTA: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 13, fontWeight: 700, marginTop: 12,
  },

  // Motivational strip
  motivStrip: {
    marginTop: 56, padding: 24, borderRadius: 20,
    background: 'linear-gradient(135deg, #fffbe5 0%, #ffeef5 100%)',
    border: '1px solid #FEE440',
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
  },
  motivItem: { display: 'flex', alignItems: 'center', gap: 14 },
  motivLabel: { fontWeight: 800, fontSize: 15, color: '#1F2937' },
  motivSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  // Grade screen
  gradeHeader: {
    color: 'white', padding: 32, borderRadius: 24,
    display: 'flex', alignItems: 'center', gap: 24,
    marginBottom: 32, marginTop: 16,
    boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
  },
  gradeHeaderEmoji: { fontSize: 64 },
  gradeHeaderTitle: { fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 900, margin: '4px 0', letterSpacing: '-0.02em' },
  gradeHeaderSub: { fontSize: 16, opacity: 0.9, margin: 0 },

  // Subject screen
  subjectBanner: {
    padding: 24, borderRadius: 20, border: '2px solid',
    display: 'flex', alignItems: 'center', gap: 20,
    marginTop: 16, marginBottom: 24,
  },
  subjectBannerTitle: { fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 900, margin: '4px 0' },
  subjectBannerSub: { fontSize: 14, color: '#6B7280', margin: 0 },

  grade8MathPage: {
    maxWidth: 1220,
    margin: '0 auto',
    padding: '16px 24px 42px',
    background: 'white',
  },
  grade8TopTabs: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderTop: '1px solid #D1D5DB',
    background: '#F3F4F6',
    margin: '-16px -24px 24px',
    paddingLeft: 48,
    overflowX: 'auto',
  },
  grade8Tab: {
    padding: '11px 18px',
    color: '#525AFF',
    fontSize: 14,
    whiteSpace: 'nowrap',
  },
  grade8TabActive: {
    padding: '11px 24px',
    color: 'white',
    background: '#525AFF',
    fontSize: 14,
    fontWeight: 800,
    clipPath: 'polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)',
    whiteSpace: 'nowrap',
  },
  grade8Header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 24,
    alignItems: 'flex-start',
    marginBottom: 26,
  },
  grade8Title: {
    margin: 0,
    fontFamily: FONT_DISPLAY,
    fontSize: 48,
    fontWeight: 500,
    color: '#E6B400',
  },
  grade8Intro: {
    maxWidth: 790,
    margin: '10px 0 20px',
    fontSize: 14,
    lineHeight: 1.45,
    color: '#374151',
  },
  grade8Switch: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    margin: 0,
    color: '#374151',
    fontSize: 14,
  },
  grade8Stats: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  grade8StatPill: {
    minWidth: 126,
    minHeight: 52,
    border: '1.5px solid #E6B400',
    borderRadius: 999,
    color: '#E6B400',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 700,
  },
  grade8SkillColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    columnGap: 52,
    rowGap: 28,
  },
  grade8Group: {
    minWidth: 0,
    breakInside: 'avoid',
  },
  grade8GroupTitle: {
    margin: '0 0 8px',
    fontFamily: FONT_BODY,
    fontSize: 20,
    lineHeight: 1.2,
    color: '#4AB5B5',
  },
  grade8SkillList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  grade8SkillItem: {
    minWidth: 0,
  },
  grade8SkillLink: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '22px 1fr auto auto',
    alignItems: 'start',
    gap: 6,
    background: 'transparent',
    border: 'none',
    padding: 0,
    textAlign: 'left',
    color: '#374151',
    fontSize: 14,
    lineHeight: 1.25,
    cursor: 'pointer',
  },
  grade8Icons: {
    color: '#6B7280',
    whiteSpace: 'nowrap',
    fontSize: 12,
  },
  grade8Mastery: {
    color: '#525AFF',
    fontSize: 11,
    whiteSpace: 'nowrap',
  },

  skillList: { display: 'flex', flexDirection: 'column', gap: 12 },
  skillCard: {
    background: 'white', borderRadius: 16, padding: 20,
    border: '1px solid #F0E6D6', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 20,
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  skillNumber: {
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: 800, fontSize: 18,
    flexShrink: 0,
  },
  skillTitle: { fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 800, margin: 0, color: '#1F2937' },
  skillDesc: { fontSize: 13, color: '#6B7280', margin: '4px 0 0' },
  skillMeta: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  masteryPill: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 999,
    border: '1.5px solid', fontSize: 11, fontWeight: 700,
    background: 'white',
  },
  skillMetaDot: { color: '#D1D5DB' },
  skillMetaText: { fontSize: 12, color: '#6B7280' },
  skillRight: { display: 'flex', alignItems: 'center', gap: 12 },
  skillMasteryRing: { position: 'relative', width: 48, height: 48 },
  skillRingLabel: {
    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 800, color: '#1F2937',
  },

  // Skill intro
  skillIntro: {
    background: 'white', borderRadius: 24, padding: '48px 32px',
    textAlign: 'center', maxWidth: 720, margin: '24px auto 0',
    boxShadow: '0 12px 32px rgba(82,90,255,0.06)',
    border: '1px solid #F0E6D6',
  },
  skillIntroIcon: {
    width: 72, height: 72, borderRadius: 20, margin: '0 auto',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  },
  skillIntroTitle: {
    fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 900,
    margin: '20px 0 8px', letterSpacing: '-0.02em',
  },
  skillIntroDesc: { fontSize: 16, color: '#6B7280', margin: '0 auto', maxWidth: 480 },
  explainBox: {
    marginTop: 32, padding: 20, borderRadius: 14,
    background: '#FFFBEB', border: '1px solid #FDE68A', textAlign: 'left',
  },
  explainHead: { display: 'flex', alignItems: 'center', gap: 8, color: '#92400E', marginBottom: 8 },
  explainText: { margin: 0, fontSize: 15, color: '#374151', lineHeight: 1.6 },
  skillMetaRow: {
    display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24, flexWrap: 'wrap',
  },
  skillMetaItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 14, color: '#374151', fontWeight: 600,
  },

  // Practice
  practiceWrap: { maxWidth: 720, margin: '24px auto 0' },
  practiceHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, padding: '0 4px',
  },
  practiceProgressBar: { display: 'flex', gap: 6 },
  progressDot: {
    width: 12, height: 12, borderRadius: '50%',
    transition: 'all 0.3s', flexShrink: 0,
  },
  practiceCounter: { fontSize: 13, fontWeight: 700, color: '#6B7280' },

  questionCard: {
    background: 'white', borderRadius: 20, padding: 32,
    border: '1px solid #F0E6D6',
    boxShadow: '0 8px 24px rgba(82,90,255,0.05)',
    animation: 'slideUp 0.3s ease',
  },
  questionMeta: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  diffBadge: {
    padding: '4px 10px', borderRadius: 999,
    color: 'white', fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
  },
  questionType: { fontSize: 12, color: '#6B7280', fontWeight: 600 },
  questionPrompt: {
    fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 800,
    color: '#1F2937', margin: '0 0 24px', lineHeight: 1.3,
  },

  mcqGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 },
  mcqBtn: {
    padding: '16px 20px', borderRadius: 12, border: '2px solid',
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 12,
    transition: 'all 0.15s', fontFamily: FONT_BODY,
  },

  fillInput: {
    width: '100%', padding: '16px 20px', borderRadius: 12,
    border: '2px solid', fontSize: 18, fontWeight: 600,
    fontFamily: FONT_BODY, transition: 'all 0.15s',
  },

  hintBox: {
    marginTop: 16, padding: '12px 16px', borderRadius: 10,
    background: '#FFFBEB', border: '1px solid #FDE68A',
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 14, color: '#92400E', fontWeight: 500,
  },

  feedback: {
    marginTop: 16, padding: 16, borderRadius: 12,
    border: '2px solid', animation: 'pop 0.3s ease',
  },
  feedbackTop: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  feedbackIcon: {
    width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  solutionBox: {
    marginTop: 12, paddingTop: 12, borderTop: '1px dashed rgba(0,0,0,0.1)',
  },

  questionActions: {
    marginTop: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
  },
  hintBtn: {
    padding: '10px 16px', borderRadius: 10, border: '2px solid #FDE68A',
    background: '#FFFBEB', color: '#92400E', fontWeight: 700, fontSize: 14,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
  },

  // Results
  resultWrap: {
    maxWidth: 600, margin: '40px auto 0',
    background: 'white', borderRadius: 24, padding: 48,
    textAlign: 'center', border: '1px solid #F0E6D6',
    boxShadow: '0 12px 32px rgba(82,90,255,0.08)',
    animation: 'pop 0.5s ease',
  },
  resultEmoji: { fontSize: 80 },
  resultTitle: { fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 900, margin: '8px 0', letterSpacing: '-0.02em' },
  resultSub: { fontSize: 16, color: '#6B7280', margin: 0 },
  resultStats: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 24, marginTop: 32, padding: '24px 0',
    borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB',
  },
  resultStat: { textAlign: 'center' },
  resultStatValue: { fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 900, lineHeight: 1 },
  resultStatLabel: { fontSize: 12, color: '#6B7280', fontWeight: 600, marginTop: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  resultDivider: { width: 1, height: 50, background: '#E5E7EB' },
  resultActions: { display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' },
  secondaryBtn: {
    padding: '12px 20px', borderRadius: 12,
    background: '#F3F4F6', border: '2px solid #E5E7EB',
    color: '#374151', fontWeight: 700, fontSize: 14,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
  },

  // Dashboard
  dashHero: { marginTop: 16 },
  dashHeroTitle: { fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 900, margin: '6px 0', letterSpacing: '-0.025em' },
  dashHeroSub: { fontSize: 16, color: '#6B7280', margin: 0 },
  dashHeroStats: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12, marginTop: 28,
  },
  bigStat: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'white', padding: 18, borderRadius: 16,
    border: '1px solid #F0E6D6',
  },
  bigStatIcon: {
    width: 48, height: 48, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  bigStatValue: { fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 900, color: '#1F2937', lineHeight: 1 },
  bigStatLabel: { fontSize: 12, color: '#6B7280', fontWeight: 600, marginTop: 4 },

  subjectAnalytics: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16,
  },
  subjectAnalyticCard: {
    background: 'white', padding: 20, borderRadius: 16,
    border: '1px solid #F0E6D6',
  },
  analyticHead: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
  analyticIcon: {
    width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  analyticBar: {
    height: 10, background: '#F3F4F6', borderRadius: 6, overflow: 'hidden',
  },
  analyticBarFill: { height: '100%', borderRadius: 6, transition: 'width 0.6s' },
  analyticPct: { marginTop: 8, fontSize: 12, fontWeight: 700, color: '#374151' },

  recList: { display: 'flex', flexDirection: 'column', gap: 10 },
  recCard: {
    background: 'white', padding: 18, borderRadius: 14,
    border: '1px solid #F0E6D6', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 16,
    transition: 'all 0.15s',
  },
  recIcon: {
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  recReason: { fontSize: 11, fontWeight: 700, color: '#525AFF', textTransform: 'uppercase', letterSpacing: 0.5 },
  recTitle: { fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 800, color: '#1F2937', marginTop: 2 },
  recMeta: { fontSize: 12, color: '#6B7280', marginTop: 4 },

  recentGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12,
  },
  recentCard: {
    background: 'white', padding: 18, borderRadius: 14,
    border: '1px solid #F0E6D6', cursor: 'pointer', textAlign: 'left',
    transition: 'all 0.15s',
  },
  recentIcon: {
    width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  recentTitle: { fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 800, margin: '12px 0 8px' },
  recentBar: {
    height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden', marginBottom: 8,
  },
  recentMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 12 },

  // Badges
  badgesHero: {
    display: 'flex', alignItems: 'center', gap: 20,
    background: 'linear-gradient(135deg, #FFF7ED 0%, #E0F4FF 100%)',
    padding: 32, borderRadius: 24, marginTop: 16, marginBottom: 32,
    border: '2px solid #FDE8BB',
  },
  badgeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16,
  },
  badgeCard: {
    padding: 24, borderRadius: 18, border: '2px solid', textAlign: 'center',
    transition: 'transform 0.15s',
  },
  badgeEmoji: { fontSize: 56, marginBottom: 8 },
  badgeName: { fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 800, margin: '8px 0 4px' },
  badgeDesc: { fontSize: 12, color: '#6B7280', margin: 0, minHeight: 32 },
  badgeEarned: {
    marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 999,
    background: '#525AFF', color: 'white', fontSize: 11, fontWeight: 700,
  },
  badgeLocked: {
    marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 999,
    background: '#E5E7EB', color: '#6B7280', fontSize: 11, fontWeight: 700,
  },

  // Empty state
  emptyState: {
    padding: 32, textAlign: 'center', borderRadius: 14,
    background: '#F9FAFB', border: '1px dashed #E5E7EB',
    color: '#6B7280', fontSize: 14,
  },

  // Activity table (Completed / In Progress / All Quiz Records)
  activityTable: {
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  activityRow: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'white', border: '1px solid #E5E7EB', borderRadius: 12,
    padding: '12px 16px', cursor: 'pointer', width: '100%',
    transition: 'box-shadow 0.15s',
    textAlign: 'left',
  },
  activityIcon: {
    width: 34, height: 34, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  activityTitle: { fontWeight: 600, fontSize: 14, color: '#111827' },
  activityMeta:  { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  activityProgressBar: {
    height: 4, borderRadius: 2, background: '#F3F4F6',
    marginTop: 6, overflow: 'hidden',
  },
  activityStats: {
    display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  activityStat: { fontSize: 12, color: '#6B7280' },
  activityDate:  { fontSize: 11, color: '#9CA3AF', minWidth: 60, textAlign: 'right' },
  statusBadge: {
    fontSize: 11, fontWeight: 600, padding: '2px 8px',
    borderRadius: 20, whiteSpace: 'nowrap',
  },

  // Sign In page
  siHero: {
    position: 'relative',
    background: 'linear-gradient(180deg, #F0FAFF 0%, #E0F4FF 55%, #525AFF 100%)',
    minHeight: 320,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '44px 24px 80px',
    overflow: 'hidden',
  },
  siDeco: {
    position: 'absolute',
    lineHeight: 1,
    pointerEvents: 'none',
    userSelect: 'none',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
  },
  siCard: {
    background: 'white',
    borderRadius: 10,
    padding: '28px 32px 0',
    width: 340,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    position: 'relative',
    zIndex: 2,
    flexShrink: 0,
  },
  siCardTitle: {
    textAlign: 'center',
    color: '#525AFF',
    fontFamily: FONT_DISPLAY,
    fontSize: 26,
    fontWeight: 700,
    margin: '0 0 22px',
  },
  siField: { marginBottom: 14 },
  siFieldRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  siLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: 500,
  },
  siForgot: {
    fontSize: 12,
    color: '#6D8BC0',
    cursor: 'pointer',
    fontWeight: 500,
  },
  siInput: {
    width: '100%',
    height: 34,
    border: '1px solid #D1D5DB',
    borderRadius: 3,
    padding: '0 9px',
    fontSize: 14,
    fontFamily: FONT_BODY,
    outline: 'none',
    display: 'block',
    boxSizing: 'border-box',
  },
  siBtnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    margin: '18px 0 0',
  },
  siBtn: {
    background: '#525AFF',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    padding: '10px 28px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 0 #4C1D95',
  },
  siRemember: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    color: '#374151',
    cursor: 'pointer',
    fontWeight: 500,
  },
  siLaunchCard: {
    borderTop: '1px dashed #E5E7EB',
    margin: '18px -32px 0',
    padding: '13px 32px',
    textAlign: 'center',
    fontSize: 13,
    color: '#0070CC',
    cursor: 'pointer',
    borderRadius: '0 0 10px 10px',
    background: '#FAFAFA',
  },
  siHills: {
    position: 'absolute',
    bottom: 0,
    left: '-10%',
    right: '-10%',
    height: 56,
    background: '#4C1D95',
    borderRadius: '60% 60% 0 0',
  },
  siMemberSection: {
    background: 'white',
    padding: '52px 24px 48px',
    textAlign: 'center',
  },
  siNotMemberTitle: {
    color: '#525AFF',
    fontFamily: FONT_DISPLAY,
    fontSize: 30,
    fontWeight: 700,
    margin: '0 0 6px',
  },
  siNotMemberSub: {
    color: '#6B7280',
    fontSize: 14,
    margin: '0 0 36px',
  },
  siFeatureList: {
    maxWidth: 520,
    margin: '0 auto 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  siFeatureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    textAlign: 'left',
  },
  siFeatureIcon: {
    width: 68,
    height: 68,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  siFeatureTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 5,
    fontFamily: FONT_DISPLAY,
  },
  siFeatureText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 1.55,
  },
  siCelebrate: {
    fontSize: 14,
    color: '#374151',
    margin: '0 0 22px',
  },
  siJoinBtn: {
    background: '#525AFF',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    padding: '13px 44px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 0 #3A41CC',
  },
  siFooter: {
    background: '#F9FAFB',
    borderTop: '1px solid #E5E7EB',
    padding: '18px 24px',
    textAlign: 'center',
  },
  siFooterLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    marginBottom: 8,
    fontSize: 12,
  },
  siFooterLink: {
    color: '#0070CC',
    cursor: 'pointer',
    fontSize: 12,
  },
  siFooterCopy: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  // Skill plan cards (exact-skills band)
  skillPlanGrid: {
    maxWidth: 700,
    margin: '0 auto 20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 10,
  },
  skillPlanCard: {
    border: 'none',
    borderRadius: 6,
    padding: '14px 8px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
    transition: 'transform 0.15s',
  },
  skillPlanIcon: { fontSize: 26, lineHeight: 1 },
  skillPlanLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: 'white',
    textAlign: 'center',
    lineHeight: 1.2,
  },

  // New impact card layout
  impactIconCircle: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'rgba(255,255,255,0.18)',
    border: '3px solid rgba(255,255,255,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 30, marginBottom: 4,
  },
  impactCardTitle: {
    fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 800,
    color: 'white', margin: '0 0 6px',
  },
  impactCardText: {
    fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 1.5,
    margin: '0 0 12px',
  },

  // Testimonials
  testimonialsBand: {
    background: 'white',
    padding: '48px 24px',
    borderTop: '1px solid #E5E7EB',
  },
  testimonialsInner: {
    maxWidth: 720,
    margin: '0 auto',
    textAlign: 'center',
  },
  testimonialStars: {
    fontSize: 22,
    color: '#6D8BC0',
    letterSpacing: 3,
    marginBottom: 16,
  },
  testimonialQuote: {
    fontFamily: FONT_DISPLAY,
    fontSize: 22,
    fontWeight: 500,
    color: '#1F2937',
    lineHeight: 1.6,
    margin: '0 0 16px',
    fontStyle: 'italic',
  },
  testimonialAttrib: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: 600,
    margin: '0 0 16px',
  },
  testimonialLink: {
    background: 'transparent',
    border: '1.5px solid #525AFF',
    borderRadius: 4,
    color: '#525AFF',
    fontSize: 13,
    fontWeight: 700,
    padding: '7px 18px',
    cursor: 'pointer',
  },

  // Footer (IXL-style multi-column)
  footerInner: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '0 24px',
  },
  footerTop: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: 48,
    padding: '40px 0 28px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  footerBrand: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    minWidth: 160,
  },
  footerLogo: {
    height: 34,
    borderRadius: 7,
    display: 'inline-flex',
    alignItems: 'stretch',
    overflow: 'hidden',
    width: 'fit-content',
    boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
  },
  footerTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
    lineHeight: 1.5,
    maxWidth: 180,
  },
  footerJoinBtn: {
    background: '#525AFF',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    padding: '8px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  footerCols: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 24,
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  footerColHead: {
    color: 'white',
    fontSize: 13,
    fontWeight: 800,
    margin: '0 0 4px',
    letterSpacing: 0.3,
  },
  footerLink: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    cursor: 'pointer',
    lineHeight: 1.4,
    transition: 'color 0.15s',
  },
  footerBottom: {
    padding: '16px 0',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },

  // Learning Catalog
  lcSubjectBar: {
    background: 'white',
    borderBottom: '1px solid #E5E7EB',
    overflowX: 'auto',
  },
  lcBarInner: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  lcSubjectTab: {
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    padding: '10px 22px 8px',
    fontSize: 12,
    fontWeight: 500,
    color: '#6B7280',
    cursor: 'pointer',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap',
    fontFamily: FONT_BODY,
    transition: 'color 0.15s, border-color 0.15s',
    minWidth: 72,
    flexShrink: 0,
  },
  lcSubjectTabDisabled: {
    color: '#9CA3AF',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  lcViewBar: {
    background: 'white',
    borderBottom: '1px solid #E5E7EB',
    fontSize: 13,
  },
  lcViewLabel: {
    fontWeight: 700,
    color: '#374151',
    marginRight: 8,
    fontSize: 13,
  },
  lcViewTab: {
    background: 'transparent',
    border: 'none',
    padding: '5px 16px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
    fontFamily: FONT_BODY,
  },
  lcViewTabActive: {
    background: '#A78BFA',
    color: '#ffffff',
    fontWeight: 700,
  },
  lcHero: {
    position: 'relative',
    minHeight: 210,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(32px, 6vw, 40px) clamp(16px, 14vw, 180px) 80px',
  },
  lcHeroDecoLeft: {
    position: 'absolute',
    left: '6%',
    bottom: 30,
    fontSize: 88,
    lineHeight: 1,
    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.10))',
  },
  lcHeroCenter: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    maxWidth: 600,
  },
  lcHeroTitle: {
    fontFamily: FONT_DISPLAY,
    fontSize: 42,
    fontWeight: 700,
    margin: '0 0 12px',
    lineHeight: 1.1,
  },
  lcHeroDesc: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 1.65,
    margin: 0,
  },
  lcHeroDecoRight: {
    position: 'absolute',
    right: '7%',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'center',
  },
  lcDecoItem: {
    fontSize: 38,
    display: 'block',
    animation: 'float 3s ease-in-out infinite',
  },
  lcHeroHill: { display: 'none' },
  lcHeroHillBack: {
    position: 'absolute',
    bottom: 0,
    left: '-5%',
    right: '-5%',
    height: 80,
    borderRadius: '50% 50% 0 0 / 60% 60% 0 0',
  },
  lcHeroHillFront: {
    position: 'absolute',
    bottom: 0,
    left: '-15%',
    right: '-15%',
    height: 52,
    borderRadius: '50% 50% 0 0 / 60% 60% 0 0',
  },
  lcCloud1: {
    position: 'absolute', top: 18, left: '15%',
    width: 90, height: 28, borderRadius: 999,
    background: 'rgba(255,255,255,0.75)',
    boxShadow: '0 0 0 14px rgba(255,255,255,0.35)',
  },
  lcCloud2: {
    position: 'absolute', top: 30, left: '22%',
    width: 60, height: 20, borderRadius: 999,
    background: 'rgba(255,255,255,0.65)',
    boxShadow: '0 0 0 10px rgba(255,255,255,0.25)',
  },
  lcCloud3: {
    position: 'absolute', top: 14, right: '20%',
    width: 80, height: 24, borderRadius: 999,
    background: 'rgba(255,255,255,0.70)',
    boxShadow: '0 0 0 12px rgba(255,255,255,0.30)',
  },
  lcGradeList: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '28px 24px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  lcGradeRow: {
    background: 'white',
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    padding: '18px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    transition: 'box-shadow 0.15s, transform 0.15s',
  },
  lcGradeLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    flex: 1,
    minWidth: 0,
  },
  lcGradeBadge: {
    width: 52,
    height: 52,
    borderRadius: 10,
    flexShrink: 0,
    color: 'white',
    fontFamily: FONT_DISPLAY,
    fontSize: 22,
    fontWeight: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lcGradeInfo: {
    flex: 1,
    minWidth: 0,
  },
  lcGradeName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
    fontFamily: FONT_DISPLAY,
    marginBottom: 4,
  },
  lcGradeSkills: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 1.55,
    overflow: 'hidden',
  },
  lcIncludesLabel: {
    fontWeight: 600,
    color: '#374151',
  },
  lcSkillLink: {
    color: '#0070CC',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  lcSkillSep: {
    color: '#D1D5DB',
  },
  lcSeeAllBtn: {
    flexShrink: 0,
    border: 'none',
    borderRadius: 999,
    padding: '10px 22px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: FONT_BODY,
    whiteSpace: 'nowrap',
    transition: 'opacity 0.15s',
  },

  // Misc
  backBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: '#6B7280', fontSize: 14, fontWeight: 600,
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '6px 0', marginBottom: 8,
  },

  toastContainer: {
    position: 'fixed', bottom: 24, right: 24, zIndex: 100,
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  toast: {
    color: 'white', padding: '12px 20px', borderRadius: 12,
    fontWeight: 700, fontSize: 14,
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    animation: 'slideUp 0.3s ease',
  },

  footer: {
    background: '#0F1A2B',
    borderTop: 'none',
  },
};

// ── Header styles (Dribbble-style single-row nav) ────────────────────────────
const hStyles = {
  header: {
    position: 'sticky', top: 0, zIndex: 400,
    background: '#ffffff',
    borderBottom: '1px solid #EBEBEB',
  },
  inner: {
    maxWidth: 1280, margin: '0 auto', padding: '0 24px',
    height: 64, display: 'flex', alignItems: 'center', gap: 20,
  },

  // Logo
  logo: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
  },
  logoText: {
    fontFamily: FONT_BODY, fontWeight: 800, fontSize: 18,
    color: '#1C1215', letterSpacing: '-0.02em',
  },

  // Search bar
  searchBar: {
    display: 'flex', alignItems: 'center',
    background: '#F3F4F6', borderRadius: 999,
    padding: '0 6px 0 16px', height: 48, margin: '8px 0',
    flex: '1 1 auto', maxWidth: 400, minWidth: 180,
    border: '1.5px solid transparent',
  },
  searchInput: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    fontSize: 14, color: '#374151', fontFamily: FONT_BODY,
  },
  searchDivider: { width: 1, height: 18, background: '#D1D5DB', margin: '0 10px' },
  searchCategory: {
    fontSize: 13, fontWeight: 600, color: '#374151',
    fontFamily: FONT_BODY, whiteSpace: 'nowrap', cursor: 'pointer',
  },
  searchBtn: {
    width: 30, height: 30, borderRadius: '50%',
    background: '#EA4C89', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginLeft: 6,
    transition: 'filter 0.15s',
  },

  // Nav
  nav: {
    display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0,
  },
  navLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 15.5, fontWeight: 700, color: '#374151',
    fontFamily: FONT_BODY, padding: '8px 14px', borderRadius: 8,
    display: 'flex', alignItems: 'center',
    transition: 'background 0.15s, color 0.15s',
  },
  navActive: {
    color: '#111827', fontWeight: 800, background: '#F3F4F6',
  },

  // Dropdown panel
  dropdown: {
    position: 'absolute', top: 'calc(100% + 4px)', left: '50%',
    transform: 'translateX(-50%)',
    background: 'white', borderRadius: 4,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
    border: '1px solid #E5E7EB', padding: '8px 4px',
    minWidth: 240, zIndex: 500,
    animation: 'dropdownSlide 0.15s ease both',
  },
  dropItem: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
    padding: '12px 16px', borderRadius: 0, textAlign: 'left',
    transition: 'background 0.1s',
  },
  dropIcon:  { fontSize: 18, lineHeight: 1, marginTop: 1 },
  dropLabel: { fontSize: 13, fontWeight: 600, color: '#111827', fontFamily: FONT_BODY },
  dropSub:   { fontSize: 11, color: '#9CA3AF', marginTop: 2,   fontFamily: FONT_BODY },

  // Right actions
  actions: {
    display: 'flex', alignItems: 'center', gap: 6,
    marginLeft: 'auto', flexShrink: 0,
  },
  signUpBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 500, color: '#374151',
    fontFamily: FONT_BODY, padding: '8px 14px', borderRadius: 8,
    transition: 'color 0.15s',
  },
  loginBtn: {
    background: '#1C1215', border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 600, color: 'white',
    fontFamily: FONT_BODY, padding: '9px 20px',
    borderRadius: 999, transition: 'opacity 0.15s',
  },

  // Hamburger
  hamburger: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#374151', padding: 6, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },

  // Mobile menu
  mobileMenu: {
    display: 'flex', flexDirection: 'column',
    background: 'white', borderTop: '1px solid #F3F4F6',
    padding: '8px 16px 16px',
  },
  mobileLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 15, fontWeight: 500, color: '#374151',
    fontFamily: FONT_BODY, padding: '13px 8px',
    borderRadius: 8, textAlign: 'left',
  },
  mobileLinkActive: { color: '#1C1215', fontWeight: 700 },
  mobileDivider: { height: 1, background: '#F3F4F6', margin: '6px 0' },

  // Two-row layout containers
  topRow: {
    maxWidth: 1280, margin: '0 auto', padding: '0 24px',
    height: 88, display: 'flex', alignItems: 'center', gap: 10,
  },
  navRow: {
    maxWidth: 1280, margin: '0 auto', padding: '0 24px',
    height: 40, display: 'flex', alignItems: 'center', gap: 2,
    borderTop: '1px solid #F3F4F6', position: 'relative', overflow: 'visible',
  },

  // Logo mark (emoji / icon container)
  logoMark: {
    fontSize: 20, lineHeight: 1,
  },

  // Search bar extras
  searchIconWrap: {
    display: 'flex', alignItems: 'center', marginRight: 6, flexShrink: 0,
  },
  searchSubmit: {
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '4px 2px', flexShrink: 0,
  },

  // Role toggle group
  roleGroup: {
    display: 'flex', alignItems: 'center', gap: 2,
    background: '#F3F4F6', borderRadius: 999, padding: 3, flexShrink: 0,
  },
  roleBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 15, fontWeight: 500, color: '#6B7280',
    fontFamily: FONT_BODY, padding: '5px 12px', borderRadius: 999,
    transition: 'background 0.15s, color 0.15s',
  },
  roleBtnActive: {
    background: 'white', color: '#1C1215', fontWeight: 700,
    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
  },

  // Action buttons in top row
  signInBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'none', border: '1.5px solid #E5E7EB', cursor: 'pointer',
    fontSize: 15, fontWeight: 600, color: '#374151',
    fontFamily: FONT_BODY, padding: '6px 14px', borderRadius: 999,
    transition: 'border-color 0.15s, color 0.15s',
    flexShrink: 0,
  },
  membershipBtn: {
    background: '#4AB5B5', border: 'none', cursor: 'pointer',
    fontSize: 15, fontWeight: 700, color: 'white',
    fontFamily: FONT_BODY, padding: '7px 16px', borderRadius: 999,
    transition: 'opacity 0.15s', flexShrink: 0,
  },
  resetBtn: {
    background: 'none', border: '1.5px solid #E5E7EB', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: '50%',
    color: '#9CA3AF', transition: 'color 0.15s, border-color 0.15s',
    flexShrink: 0,
  },

  // Search suggestions
  suggestPanel: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
    background: 'white', borderRadius: 12,
    boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
    border: '1px solid #E5E7EB', overflow: 'hidden',
    zIndex: 700, animation: 'dropdownSlide 0.15s ease both',
  },
  suggestItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
    padding: '10px 14px', textAlign: 'left',
    transition: 'background 0.1s',
    fontFamily: FONT_BODY,
  },
  suggestIcon: {
    flexShrink: 0, display: 'flex', alignItems: 'center',
    width: 24, height: 24, borderRadius: 6,
    background: '#F3F4F6', justifyContent: 'center',
  },
  suggestText: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0,
  },
  suggestLabel: {
    fontSize: 13, fontWeight: 600, color: '#111827',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  suggestSub: {
    fontSize: 11, color: '#9CA3AF',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  suggestKind: {
    fontSize: 10, fontWeight: 600, color: '#9CA3AF',
    textTransform: 'capitalize', flexShrink: 0,
  },

  // Mega menu panel
  megaPanel: {
    position: 'absolute', top: 'calc(100% + 4px)', left: 0,
    background: 'white', borderRadius: 0,
    boxShadow: '0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
    border: '1px solid #E5E7EB',
    padding: '32px 44px 36px',
    display: 'inline-flex', flexDirection: 'row', alignItems: 'flex-start',
    gap: 0, flexWrap: 'nowrap',
    width: 'max-content',
    zIndex: 600,
    animation: 'dropdownSlide 0.15s ease both',
  },
  megaCol: {
    display: 'flex', flexDirection: 'column', gap: 0,
    flex: '0 0 auto',
  },
  megaGroup: {
    display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 22,
  },
  megaHeading: {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 14.5, fontWeight: 700, color: '#0B7DA1',
    fontFamily: FONT_BODY, padding: '6px 0', textAlign: 'left',
    transition: 'color 0.13s',
    whiteSpace: 'nowrap',
  },
  megaHeadingIcon: {
    color: '#0B7DA1', display: 'flex', alignItems: 'center', flexShrink: 0,
  },
  megaBadge: {
    background: '#2563EB', color: 'white',
    fontSize: 10, fontWeight: 800, borderRadius: 999,
    padding: '2px 8px', letterSpacing: '0.02em',
  },
  megaInlineLinks: {
    display: 'flex', flexWrap: 'wrap', alignItems: 'center',
    gap: 6, paddingLeft: 27, marginTop: 10,
  },
  megaInlineLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13.5, color: '#0B9DC7', fontFamily: FONT_BODY,
    padding: '3px 0', transition: 'color 0.12s',
  },
  megaBullet: {
    color: '#B0BEC5', fontSize: 13,
  },
  megaBlockLinks: {
    display: 'flex', flexDirection: 'column', gap: 0,
    paddingLeft: 27, marginTop: 10,
  },
  megaBlockLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13.5, color: '#0B9DC7', fontFamily: FONT_BODY,
    padding: '6px 0', textAlign: 'left',
    borderBottom: '1px solid #F3F7FA',
    transition: 'color 0.12s',
  },
  megaLinks: { display: 'none' },
  megaLink:  { display: 'none' },
  megaDot:   {},

  // Active nav indicator underline
  navCaret: {
    display: 'block', width: '15%', height: 3, borderRadius: 99,
    background: '#4AB5B5',
    position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
  },
};
