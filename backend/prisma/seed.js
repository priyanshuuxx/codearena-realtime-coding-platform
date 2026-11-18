import { PrismaClient } from '@prisma/client';
import { mcqQuestions } from '../src/data/mcq-catalog.js';
import { problems } from '../src/data/problem-catalog.js';

const prisma = new PrismaClient();

try {
  await prisma.problem.createMany({
    data: problems.map(({ id, title, slug, description, difficulty, tags, constraints, sampleInput, sampleOutput }) => ({
      id, title, slug, description, difficulty, tags, constraints, sampleInput, sampleOutput,
    })),
    skipDuplicates: true,
  });

  await prisma.mCQQuestion.createMany({
    data: mcqQuestions.map(({ id, question, category, options, answer, explanation, difficulty }) => ({
      id, question, category, options, answer, explanation, difficulty,
    })),
    skipDuplicates: true,
  });

  console.log(`Seeded ${problems.length} problems and ${mcqQuestions.length} quiz questions.`);
} finally {
  await prisma.$disconnect();
}
