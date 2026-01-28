# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Dutch time parser now correctly converts afternoon hours for all notations
  - `kwart over 3` now returns 15:15 (was returning 03:15)
  - `kwart voor 4` now returns 15:45 (was returning 03:45)
  - `half 3` now returns 14:30 (was returning 02:30)
  - All Dutch time patterns (N over X, N voor X, etc.) now apply afternoon conversion
- API TypeScript errors resolved:
  - Fixed Drizzle ORM `gt()` comparison in expired session cleanup
  - Removed unused imports (`NewUser`, `NewItem`, `env`)
  - Removed unused function parameters
- Lint error: Changed `console.log` to `console.error` in ErrorPage error reporting
- Session persistence across page refresh
  - Added `checkAuth` action to auth store that attempts token refresh on app load
  - Added `hasCheckedAuth` flag to prevent premature login redirects
  - AuthGuard now calls `checkAuth()` on mount before redirecting to login
  - Uses HttpOnly refresh token cookie to recover session silently

### Security
- Changed cookie SameSite from 'none' to 'strict' for better CSRF protection
- Added rate limiting to auth endpoints (5 requests/minute for login, register, refresh)

### Added
- Vitest test suite for shared package with comprehensive Dutch time notation tests
- Performance optimizations in SpiralCanvas:
  - Memoized SpiralSegment component with React.memo()
  - Memoized settings, config, hourMarkers, and scheduledItems arrays with useMemo()
  - Optimized hover callbacks with useCallback()

#### Phase 2: Core Features Implementation

**API Backend:**
- Authentication service with secure token handling
  - bcrypt password hashing (12 salt rounds)
  - SHA-256 hashed refresh tokens (never stored raw)
  - 15-minute access tokens, 7-day refresh tokens
  - Token rotation on refresh for security
  - httpOnly cookies for refresh tokens
- Auth routes: register, login, refresh, logout, me
- Day service with getOrCreate, relations loading
- Item service with text parsing using TimeParser/DurationParser
- Scheduling algorithm ported from obsidian-nautilus:
  - Events scheduled at fixed times (immovable)
  - Completed tasks pinned at completedAt time
  - Pending tasks fill available slots from current time
  - Tracks overflow items and free minutes remaining
- Settings routes with validation (workday bounds check)
- Enhanced health endpoint with database status and response times
- JWT middleware with @fastify/jwt
- All routes protected with authentication

**Frontend:**
- React Error Boundary with stack trace display (dev only)
- Health Page dashboard with real-time status monitoring
- API client with JWT interceptor and automatic token refresh
- TanStack Query hooks for all API endpoints
- Zustand stores for auth and day state with persistence
- AuthGuard component for protected routes
- RegisterPage for new user signup
- Working LoginPage with error handling
- TaskList connected to API with create/complete/delete
- TaskItem with delete button on hover
- TaskForm with loading state during creation
- SpiralCanvas fetching schedule from API
- SettingsPage with load/save to API
- MainLayout with user display and logout button

### Changed
- Updated Tailwind CSS from v4 to v3-compatible configuration
  - Changed from `@import 'tailwindcss'` to `@tailwind` directives
  - Added tailwind.config.js and postcss.config.js
  - Removed @tailwindcss/vite plugin in favor of PostCSS
- Protected routes (/, /settings) wrapped with AuthGuard
- All frontend components now fetch data from API instead of sample data

### Fixed
- CSS MIME type error from Tailwind v4 syntax

---

## Phase 1: Foundation (Previous)

### Added
- Initial monorepo structure with pnpm workspaces and Turborepo
- Root package.json with dev, build, test, lint, and typecheck scripts
- Base TypeScript configuration (tsconfig.base.json)
- Shared package (@tododay/shared) with core types and constants
  - NautilusItem, SpiralSegment, ScheduledItem types
  - UserSettings and Day types
  - SPIRAL_COLORS constants with dark mode variants
- Ported utilities from obsidian-nautilus:
  - TimeParser with support for 24h, 12h, and Dutch time notations
  - DurationParser for parsing duration strings (e.g., "1h30m", "45min")
  - SpiralMath for spiral geometry calculations
- Dutch time notation support in TimeParser:
  - "X uur" format (e.g., "2 uur" = 14:00)
  - "half X" format (e.g., "half 1" = 12:30)
  - "kwart over/voor X" format (e.g., "kwart voor 4" = 15:45)
  - "N over/voor half X" format (e.g., "10 over half 11" = 10:40)
- API package skeleton (@tododay/api)
  - Fastify, Drizzle ORM, PostgreSQL dependencies
  - JWT authentication dependencies (argon2, @fastify/jwt)
- Web package (@tododay/web)
  - React 19, Vite, TypeScript setup
  - Tailwind CSS with custom color tokens
  - shadcn/ui component dependencies
  - TanStack Query and Zustand for state management
  - ESLint config for React/TypeScript
  - MainLayout with header navigation
  - HomePage with spiral canvas and task list sidebar
  - LoginPage with authentication form
  - SettingsPage for workday and display preferences
  - TaskList, TaskItem, TaskForm components
  - Interactive SpiralCanvas with:
    - SVG-based spiral visualization
    - Color-coded segments (blue tasks, yellow events, gray completed, red urgent)
    - Hour markers around the spiral
    - Current time indicator line
    - Hover tooltips for items
    - Click-to-select segments
  - SpiralSegment component for rendering arc segments
- Database schema with Drizzle ORM:
  - users, sessions, user_settings tables
  - days and items tables with proper relationships
  - Unique index on days(user_id, date)
  - Index on items(day_id, sort_order)
- .gitignore with proper environment variable handling
- .prettierrc configuration

### Changed
- Replaced existing Angular project structure with new monorepo layout

### Removed
- Angular-specific ESLint configuration (.eslintrc.json)
