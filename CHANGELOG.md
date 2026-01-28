# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
  - Tailwind CSS 4.0 with Vite plugin and custom color tokens
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
