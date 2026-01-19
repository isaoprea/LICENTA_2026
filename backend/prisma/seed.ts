import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.submission.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.lesson.deleteMany();

  // Seed Lessons
  console.log('📚 Seeding lessons...');
  const lessons = await prisma.lesson.createMany({
    data: [
      {
        title: 'Introduction to Programming',
        description: 'Learn the basics of programming with variables, loops, and conditions.',
      },
      {
        title: 'Data Structures',
        description: 'Understanding arrays, linked lists, stacks, and queues.',
      },
      {
        title: 'Algorithms',
        description: 'Learn sorting, searching, and optimization algorithms.',
      },
      {
        title: 'Object-Oriented Programming',
        description: 'Master classes, inheritance, polymorphism, and encapsulation.',
      },
      {
        title: 'Web Development Basics',
        description: 'Introduction to HTML, CSS, and JavaScript for web applications.',
      },
    ],
  });
  console.log(`✅ Created ${lessons.count} lessons`);

  // Seed Problems
  console.log('🧩 Seeding problems...');
  
  const problem1 = await prisma.problem.create({
    data: {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: 'Easy',
      testCases: [
        { input: "3\n2 7 11\n9", output: "0 1" },
        { input: "3\n3 2 4\n6", output: "1 2" },
        { input: "2\n3 3\n6", output: "0 1" },
      ],
    },
  });

  const problem2 = await prisma.problem.create({
    data: {
      title: 'Reverse String',
      description: 'Write a function that reverses a string. The input string is given as an array of characters.',
      difficulty: 'Easy',
      testCases: [
        { input: "hello", output: "olleh" },
        { input: "Hannah", output: "hannaH" },
      ],
    },
  });

  const problem3 = await prisma.problem.create({
    data: {
      title: 'Binary Search',
      description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.',
      difficulty: 'Medium',
      testCases: [
        { input: "6\n-1 0 3 5 9 12\n9", output: "4" },
        { input: "6\n-1 0 3 5 9 12\n2", output: "-1" },
      ],
    },
  });

  const problem4 = await prisma.problem.create({
    data: {
      title: 'Valid Palindrome',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
      difficulty: 'Easy',
      testCases: [
        { input: "A man, a plan, a canal: Panama", output: "true" },
        { input: "race a car", output: "false" },
        { input: " ", output: "true" },
      ],
    },
  });

  const problem5 = await prisma.problem.create({
    data: {
      title: 'Merge Two Sorted Lists',
      description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list.',
      difficulty: 'Medium',
      testCases: [
        { input: "1 2 4\n1 3 4", output: "1 1 2 3 4 4" },
        { input: "\n", output: "" },
        { input: "\n0", output: "0" },
      ],
    },
  });

  const problem6 = await prisma.problem.create({
    data: {
      title: 'Longest Substring Without Repeating Characters',
      description: 'Given a string s, find the length of the longest substring without repeating characters.',
      difficulty: 'Hard',
      testCases: [
        { input: "abcabcbb", output: "3" },
        { input: "bbbbb", output: "1" },
        { input: "pwwkew", output: "3" },
      ],
    },
  });

  console.log(`✅ Created 6 problems`);

  // Seed some example submissions
  console.log('📝 Seeding submissions...');
  await prisma.submission.createMany({
    data: [
      {
        problemId: problem1.id,
        code: 'function twoSum(nums, target) { /* solution */ }',
        language: 'javascript',
        status: 'SUCCESS',
        output: '[0,1]',
      },
      {
        problemId: problem2.id,
        code: 'function reverseString(s) { s.reverse(); }',
        language: 'javascript',
        status: 'SUCCESS',
        output: '["o","l","l","e","h"]',
      },
      {
        problemId: problem3.id,
        code: 'function search(nums, target) { /* binary search */ }',
        language: 'javascript',
        status: 'WRONG_ANSWER',
        output: '5',
      },
    ],
  });
  console.log(`✅ Created 3 sample submissions`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
