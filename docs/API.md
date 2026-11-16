# CodeArena API contract

Base URL: `http://127.0.0.1:5050/api/v1`

Protected endpoints use `Authorization: Bearer <JWT>`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/signup` | Create a user and return a JWT |
| POST | `/auth/login` | Authenticate a user |
| GET | `/dashboard/me` | Return dashboard metrics |
| POST | `/submissions/run` | Run code against sample input |
| POST | `/submissions/submit` | Evaluate and persist a submission |
| GET | `/submissions/me/history` | Return the current user's submissions |
| POST | `/mcq/:id/attempt` | Evaluate and persist an MCQ attempt |
| POST | `/debugging/:id/submit` | Evaluate a debugging fix and record the attempt |
| POST | `/battles/matchmake` | Match a player or same-level bot |
| POST | `/battles/private-rooms` | Create an invite room |
| POST | `/battles/private-rooms/:roomCode/join` | Join an invite room |
| GET | `/battles/history` | Return completed battle results |
| POST | `/battles/:battleId/finish` | Idempotently save result and rating delta |
| GET | `/platform/analytics` | Return skill profile and explainable recommendations |

## Code execution lifecycle

The backend accepts code, language, and input. When Judge0 credentials exist, it creates an asynchronous Judge0 submission, polls until a terminal status, maps the status to a CodeArena verdict, and returns output, error, runtime, and memory. When credentials are absent, the explicit demo-mode problem-aware judge is used so the local product still behaves predictably.

## Realtime events

- `presence:join` / `presence:update`: online player presence
- `battle:notification`: matchmaking and private-room notification
- `battle:join` / `battle:leave`: room lifecycle
- `battle:heartbeat` / `battle:progress`: live progress signal
- `battle:finished`: synchronized result event
