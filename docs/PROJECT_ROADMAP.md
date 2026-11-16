# CodeArena Project Roadmap

## Product Goal

Build a professional major-project platform where students can practice coding problems, solve debugging challenges, answer technical skill questions, compete in real-time battles, and track performance.

## Core Modules

1. Authentication with JWT and role-based access
2. Coding problem list and problem details
3. Monaco code editor with language selection
4. Judge0 run-code and submit-code flow
5. Submission history and verdict tracking
6. Debugging challenge arena
7. Technical MCQ practice
8. Interview practice mode
9. Real-time 1v1 battles using Socket.IO
10. Leaderboard, ratings, and analytics
11. Admin panel for content management
12. Optional AI review and hints

## Professional Build Phases

### Phase 1: Foundation

- Set up monorepo structure
- Configure React frontend
- Configure Express backend
- Add environment templates
- Add shared documentation

### Phase 2: Auth

- Signup and login APIs
- Password hashing with bcrypt
- JWT token generation
- Protected frontend routes
- User and admin roles

### Phase 3: Coding Practice

- Problem schema
- Test case schema
- Problem list UI
- Problem details UI
- Monaco editor integration

### Phase 4: Code Execution

- Judge0 client
- Run code with custom input
- Submit code against hidden tests
- Verdict display
- Submission persistence

### Phase 5: Interview Practice

- Debugging challenges
- Technical MCQs
- Mixed interview rounds
- Score reports

### Phase 6: Battles And Ranking

- Socket.IO battle rooms
- Matchmaking
- Battle timer
- Live status updates
- First accepted solution wins
- Ratings and leaderboard

### Phase 7: Admin And Deployment

- Admin dashboard
- Content management
- Analytics
- Deployment to Vercel/Render/Railway
- PostgreSQL on NeonDB/Supabase
