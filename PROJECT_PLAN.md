# Health-Journal Dashboard - Complete Project Plan

## Project Overview
A comprehensive Next.js 16 health tracking dashboard with vibrant theme, dark mode, and multiple health data tracking capabilities.

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Theme**: Tweakcn (vibrant) + Tailark blocks
- **Database**: Neon PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (Google + GitHub OAuth)
- **Calendar**: React Big Calendar
- **Charts**: Recharts
- **Deployment**: Vercel

## Database Schema

### Tables Created:
1. **Users** (via NextAuth)
2. **Vitals** - Blood pressure, heart rate, temperature, SpO2
3. **Medications** - Name, dosage, time, taken status
4. **Workouts** - Exercise type, duration, calories, intensity
5. **Mood** - Rating (1-10), notes, tags
6. **Sleep** - Bedtime, wake time, quality, duration
7. **Nutrition** - Meals, calories, protein, carbs, fats

### Key Features:
- Multiple entries per day (timestamp-based)
- User-specific data isolation
- Indexed queries for performance

## Project Structure
```
health-journal/
├── app/
│   ├── api/auth/[...nextauth]/     # NextAuth API routes
│   ├── auth/
│   │   ├── signin/page.tsx         # Sign in page
│   │   └── error/page.tsx          # Auth error page
│   ├── dashboard/
│   │   ├── page.tsx                # Dashboard overview
│   │   ├── vitals/page.tsx         # Vitals tracking
│   │   ├── medications/page.tsx    # Medication tracking
│   │   ├── workouts/page.tsx       # Workout tracking (TODO)
│   │   ├── mood/page.tsx           # Mood tracking (TODO)
│   │   ├── sleep/page.tsx          # Sleep tracking (TODO)
│   │   ├── nutrition/page.tsx      # Nutrition tracking (TODO)
│   │   └── calendar/page.tsx       # Calendar view (TODO)
│   ├── layout.tsx                  # Root layout with theme
│   └── globals.css                 # Global styles + theme
├── components/
│   ├── ui/                         # Shadcn components
│   ├── dashboard-layout.tsx        # Sidebar + header layout
│   ├── theme-provider.tsx          # Theme context
│   └── theme-toggle.tsx            # Dark/light toggle
├── lib/
│   ├── prisma.ts                   # Prisma client
│   ├── auth.ts                     # NextAuth config
│   └── utils.ts                    # Utility functions
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── config.ts                   # Prisma 7 config
├── .env.local                      # Environment variables (NEVER COMMIT)
└── PROJECT_PLAN.md                 # This file
```

## Implementation Stages

### ✅ Stage 1: Project Initialization & Setup
**Status**: COMPLETE
- Next.js 16 initialized with TypeScript
- Tailwind CSS configured
- Shadcn/ui installed with slate base
- Project structure created
- Git repository initialized

### ✅ Stage 2: Database Setup with Neon PostgreSQL
**Status**: COMPLETE
- Neon account created (user responsibility)
- Database provisioned
- Prisma ORM configured
- Schema defined for all health types
- Connection string in .env.local

**Files Created**:
- `prisma/schema.prisma`
- `prisma.config.ts`
- `lib/prisma.ts`
- `.env.local` (DATABASE_URL)

### ✅ Stage 3: Authentication with NextAuth
**Status**: PARTIAL (Postponed to Stage 16)
- NextAuth.js configured
- OAuth providers ready (Google + GitHub)
- Sign in page created
- Will complete OAuth credentials in Stage 16

**Files Created**:
- `lib/auth.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `app/auth/signin/page.tsx`
- `app/auth/error/page.tsx`

### ✅ Stage 4: Theme Configuration
**Status**: COMPLETE
- Tweakcn vibrant colors configured
- Purple (#8b5cf6), Teal (#14b8a6), Coral (#f97066) palette
- Dark mode support with next-themes
- Tailwind config updated
- Calendar styles added

**Files Created**:
- `components/theme-provider.tsx`
- `components/theme-toggle.tsx`
- `app/globals.css` (updated)

### ✅ Stage 5: Core Layout & Navigation
**Status**: COMPLETE
- Responsive sidebar with all categories
- Mobile hamburger menu
- Header with user menu
- Dark/light theme toggle in sidebar
- Navigation active states

**Files Created**:
- `components/dashboard-layout.tsx`
- Components: Button, Card, Sheet, Avatar, Dropdown Menu

### ✅ Stage 6: Dashboard Overview Page
**Status**: COMPLETE
- Summary cards for each health category
- Today's activity feed
- Quick action buttons
- Trend indicators
- Stats overview

**Files Created**:
- `app/dashboard/page.tsx`

### ✅ Stage 7: Vitals Tracking Module
**Status**: COMPLETE
- BP, HR, Temp, SpO2 tracking
- Add reading dialog form
- Interactive line charts (Recharts)
- Data table with multiple daily entries
- Stats cards with trends

**Files Created**:
- `app/dashboard/vitals/page.tsx`
- Components: Dialog, Table, Label

### 🟡 Stage 8: Medication Tracking Module
**Status**: IN PROGRESS
- Basic structure created
- Add medication form ready
- Adherence chart started
- Need to complete checkbox functionality
- Need API integration

**Files Created**:
- `app/dashboard/medications/page.tsx`

### ⏳ Stage 9: Workout/Fitness Module
**Status**: PENDING
- Exercise type selection
- Duration and calories tracking
- Intensity levels
- Workout history
- Charts

### ⏳ Stage 10: Mood/Mental Health Module
**Status**: PENDING
- Mood rating slider (1-10)
- Mood journal
- Tag system
- Trend visualization

### ⏳ Stage 11: Sleep Tracking Module
**Status**: PENDING
- Bedtime/wake time picker
- Sleep quality rating
- Sleep duration calculation
- Sleep debt tracking

### ⏳ Stage 12: Nutrition/Diet Module
**Status**: PENDING
- Meal entry form
- Calorie counter
- Macro tracking (protein, carbs, fats)
- Food diary

### ⏳ Stage 13: Calendar Integration
**Status**: PENDING
- React Big Calendar installed
- Mini calendar in sidebar
- Full calendar page view
- Health events display
- Date filtering

### ⏳ Stage 14: Data Visualization
**Status**: PENDING
- Recharts for all modules
- Line, bar, area charts
- Interactive tooltips
- Time range selectors

### ⏳ Stage 15: Export & Utilities
**Status**: PENDING
- CSV export
- JSON export
- Data import
- Print-friendly views

### ⏳ Stage 16: Authentication + Deployment
**Status**: PENDING
- Google OAuth credentials
- GitHub OAuth credentials
- Environment variables
- Vercel deployment
- Domain setup

## Environment Variables Required

Create `.env.local` file with:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth (Stage 16)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## Next Steps to Continue

### Immediate (Continue from Stage 8):
1. **Complete Medications Module**
   - Fix checkbox state management
   - Add API integration for marking taken
   - Implement adherence calculation

2. **Create Remaining Modules** (Stages 9-12)
   - Follow same pattern as Vitals
   - Use existing shadcn components
   - Add Recharts for visualization

3. **Calendar Integration** (Stage 13)
   - Install React Big Calendar styles
   - Add mini calendar to sidebar
   - Create full calendar page

4. **Complete Data Visualization** (Stage 14)
   - Add charts to all modules
   - Consistent color scheme

5. **Export Functionality** (Stage 15)
   - CSV export for all data types
   - JSON backup

6. **Authentication & Deploy** (Stage 16)
   - Set up Google OAuth credentials
   - Set up GitHub OAuth credentials
   - Deploy to Vercel

## Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000

# Database commands (if needed)
npx prisma generate
npx prisma db push
```

## Key Dependencies Installed
- next
- react
- typescript
- tailwindcss
- @prisma/client
- next-auth
- next-themes
- recharts
- react-big-calendar
- date-fns
- lucide-react
- shadcn/ui components

## Notes for Continuing

### If You Lose This File:
1. Check the git history: `git log --oneline`
2. Current commit: `Complete Stages 1-7: Project setup...`
3. See what files exist: `ls -R app/ components/ lib/ prisma/`
4. Check .env.local for database connection

### If Database Connection Lost:
1. Go to https://neon.tech
2. Find your "health-journal" project
3. Copy the connection string
4. Update `.env.local`

### Starting Fresh:
If you need to restart:
```bash
rm -rf node_modules .next
npm install
npm run dev
```

## Support
- Next.js docs: https://nextjs.org/docs
- Shadcn/ui docs: https://ui.shadcn.com
- Prisma docs: https://www.prisma.io/docs
- Neon docs: https://neon.tech/docs

---
**Last Updated**: February 28, 2025
**Current Stage**: 8 (Medications - In Progress)
**Next Stage**: Complete Medications module
