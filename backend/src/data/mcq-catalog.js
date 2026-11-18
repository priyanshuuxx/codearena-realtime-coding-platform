const categories = [
  {
    category: 'DBMS',
    topics: ['normalization', 'indexes', 'transactions', 'joins', 'ACID', 'locks', 'keys', 'query planning'],
  },
  {
    category: 'Operating Systems',
    topics: ['processes', 'threads', 'deadlocks', 'paging', 'scheduling', 'mutexes', 'semaphores', 'virtual memory'],
  },
  {
    category: 'Computer Networks',
    topics: ['TCP', 'UDP', 'DNS', 'HTTP', 'TLS', 'routing', 'latency', 'status codes'],
  },
  {
    category: 'OOP',
    topics: ['encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'interfaces', 'composition', 'SOLID', 'overriding'],
  },
  {
    category: 'SQL',
    topics: ['GROUP BY', 'HAVING', 'subqueries', 'window functions', 'constraints', 'indexes', 'CTEs', 'aggregation'],
  },
  {
    category: 'JavaScript',
    topics: ['closures', 'promises', 'event loop', 'hoisting', 'this binding', 'prototypes', 'async await', 'modules'],
  },
  {
    category: 'React',
    topics: ['state', 'props', 'effects', 'memoization', 'keys', 'controlled inputs', 'context', 'rendering'],
  },
  {
    category: 'Node.js',
    topics: ['event loop', 'streams', 'middleware', 'JWT', 'Express routes', 'error handling', 'CORS', 'environment variables'],
  },
  {
    category: 'Data Structures',
    topics: ['arrays', 'stacks', 'queues', 'heaps', 'tries', 'hash maps', 'trees', 'graphs'],
  },
  {
    category: 'Algorithms',
    topics: ['binary search', 'DFS', 'BFS', 'dynamic programming', 'greedy', 'sorting', 'two pointers', 'sliding window'],
  },
];

function difficulty(index) {
  if (index % 10 === 0) return 'HARD';
  if (index % 3 === 0) return 'MEDIUM';
  return 'EASY';
}

function createQuestion(index) {
  const group = categories[index % categories.length];
  const topic = group.topics[Math.floor(index / categories.length) % group.topics.length];
  const number = index + 1;

  return {
    id: `mcq_${number}`,
    category: group.category,
    difficulty: difficulty(index),
    question: `In ${group.category}, which option best explains ${topic} in a software engineering interview?`,
    options: [
      `${topic} is used to improve correctness, performance, or maintainability in the right context.`,
      `${topic} means deleting production data before every request.`,
      `${topic} is only a UI color choice and never affects engineering decisions.`,
      `${topic} always removes the need for testing and code review.`,
    ],
    answer: 0,
    explanation: `${topic} is an important ${group.category} concept. A strong answer explains where it is used, what tradeoff it solves, and what can go wrong when it is misapplied.`,
    interviewSignal: ['Google-style', 'Amazon-style', 'Microsoft-style', 'Meta-style', 'Service-company-style'][index % 5],
    sourceNote: 'Original CodeArena MCQ based on common SDE interview fundamentals.',
  };
}

export const mcqQuestions = Array.from({ length: 1000 }, (_, index) => createQuestion(index));
