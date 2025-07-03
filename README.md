# NovelNest Server Logic

This is the backend server for NovelNest, a real-time chat and voice channel application built with Node.js, Express, Supabase, and Socket.IO.

## Features

- User authentication and registration (Supabase Auth)
- Role-based access control (admin/user)
- Password reset and email verification flows
- RESTful API for users, channels, messages, books, and relationships
- Real-time messaging and signaling (Socket.IO)
- Voice channel support (WebRTC signaling via Socket.IO)
- Channel membership management (join/leave)
- Unit tests with Jest and Supertest

## Tech Stack

- Node.js, Express
- Supabase (Postgres, Auth)
- Socket.IO
- WebRTC (frontend, with backend signaling)
- Jest (testing)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Supabase project (get your API keys from the Supabase dashboard)

### Setup

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd novelNestServerLogic/back-end
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env` and fill in your Supabase credentials:
     ```env
     SUPABASE_URL=your-supabase-url
     SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_KEY=your-service-key
     PORT=3000
     FRONTEND_URL=http://localhost:3000
     ```
4. Run the server:
   ```sh
   npm start
   ```

### Running Tests

```sh
npm test
```

## API Endpoints

- `/api/user/register` — Register a new user
- `/api/user/login` — Login
- `/api/user/logout` — Logout
- `/api/user/request-password-reset` — Request password reset
- `/api/user/resend-email-verification` — Resend verification email
- `/api/user/me` — Get current user info
- `/api/channels` — List, create, join, leave, and manage channels
- `/api/messages` — Messaging endpoints

## Voice Channels (WebRTC)

- WebRTC signaling is handled via Socket.IO events.
- See frontend for implementation details.

## License

MIT
