# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI+ is a mobile-first short video platform (TikTok-style) built with Next.js 16, TypeScript, React 19, and Supabase. Japanese-focused market. MVP stage.

## Commands

```bash
npm run dev      # Development server at http://localhost:3000
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint validation
```

No test framework configured yet.

## Architecture

```
Next.js App (App Router)
        │
        ├── Frontend (React 19 + Tailwind v4)
        │   └── Mobile-first UI (430px max-width)
        │
        ├── API Routes (/app/api/)
        │   └── feed, like, comment, action endpoints
        │
        └── Supabase Backend
            ├── PostgreSQL (videos, likes, comments, profiles)
            ├── Storage (video files in "videos" bucket)
            └── Anonymous Authentication
```

## Key Entry Points

- `/app/page.tsx` - Landing page
- `/app/login/page.tsx` - Anonymous auth flow
- `/app/start/page.tsx` - Profile creation
- `/app/tabs/feed/page.tsx` - Main video feed (core feature, 471 lines)
- `/app/tabs/me/page.tsx` - User profile
- `/app/upload/page.tsx` - Video upload
- `/app/u/[id]/page.tsx` - Other users' video pages

## Database Schema (Supabase)

```
videos: id, user_id, title, video_url, created_at
likes: id, video_id, user_id, created_at
comments: id, video_id, user_id, text, created_at
profiles: id (= auth.users.id), username, avatar_url, updated_at

Storage bucket: "videos" (public) - files at {user_id}/{timestamp}.{ext}
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
```

## Code Patterns

- All page components use `"use client"` directive
- Supabase client initialized in `/lib/supabase/client.ts`
- API routes use NextResponse, export async GET/POST handlers
- Video feed uses Intersection Observer for autoplay/pause
- Scroll-snap pagination for vertical video scrolling
- Dark theme (black background) throughout
