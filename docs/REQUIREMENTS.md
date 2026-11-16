# CodeArena Requirements

## Objective

CodeArena is a real-time coding battle and technical interview practice platform for students preparing for software engineering roles.

## Functional Modules

### User Authentication

- User signup with name, email, and password
- User login with JWT token generation
- Password hashing with bcrypt
- Protected API routes
- Role-based access for `USER` and `ADMIN`

### Coding Problems

- Problem listing with difficulty and tags
- Problem details with statement, constraints, sample input, and sample output
- PostgreSQL-backed test cases
- Admin-managed problem content

### Code Editor

- Monaco editor integration
- Language selector for C++, Java, Python, and JavaScript
- Custom input box
- Run and submit actions

### Judge0 Code Execution

- Run code with custom input
- Submit code against hidden test cases
- Return verdicts, runtime, memory, output, and errors

### Submissions

- Store submitted code, language, verdict, runtime, memory, user, and problem
- Show recent submissions on dashboard
- Support problem-wise submission history

### Debugging Challenges

- Show broken code and expected behavior
- Allow users to fix and submit code
- Categorize by syntax, logical, runtime, and edge-case bugs
- Score users by solved debugging challenges

### Technical MCQ Questions

- Category-wise questions for DBMS, OS, CN, OOP, SQL, JavaScript, React, Node.js, DSA, and algorithms
- Store options, answer, explanation, and difficulty
- Track attempts and scores

### Interview Practice Mode

- Coding round
- Debugging round
- MCQ round
- Mixed interview round
- Final score report

### 1v1 Battle Mode

- Real-time battle rooms with Socket.IO
- Coding, debugging, MCQ, and mixed battle types
- Timer and live opponent status
- Winner selection by accepted solution or score

### Leaderboard

- Current rating
- Wins and losses
- Solved problem count
- Battle wins
- Rank tracking

### Admin Panel

- Manage users
- Manage coding problems and test cases
- Manage debugging challenges
- Manage MCQ questions
- View submissions and battle reports

### Analytics Dashboard

- Solved problems by difficulty
- Topic-wise performance
- MCQ accuracy
- Debugging score
- Battle win rate
- Recent activity

### Optional AI Code Review

- Code explanation
- Time complexity analysis
- Space complexity analysis
- Hints after failed submissions
- Interview feedback

## Current Milestone Scope

Steps 1 through 5 are implemented in this milestone:

1. Requirement planning
2. Project setup
3. Database setup
4. Authentication module
5. User dashboard
