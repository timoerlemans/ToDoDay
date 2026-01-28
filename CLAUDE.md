# ToDoDay - Claude Code Instructions

## Project Overview

Full-stack webapp that visualizes daily tasks and events as an interactive spiral, reducing cognitive load by showing what's achievable for the day.

**Inspired by**: [Nautilus for Roam Research](https://github.com/tombarys/roam-depot-nautilus)

## Commands

```bash
# Install dependencies
pnpm install

# Development (all packages)
pnpm dev

# Build all
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm typecheck

# API only
pnpm --filter api dev

# Web only
pnpm --filter web dev

# Database commands (from api package)
pnpm --filter api db:generate  # Generate migrations
pnpm --filter api db:migrate   # Run migrations
pnpm --filter api db:push      # Push schema to DB
pnpm --filter api db:studio    # Open Drizzle Studio
```

## Architecture

Monorepo with three packages:
- **packages/shared**: Types, constants, parsing utilities
- **packages/api**: Fastify REST API + PostgreSQL
- **packages/web**: React + Vite frontend

## Key Data Models

- **NautilusItem**: Task or event with time, duration, completion status
- **SpiralSegment**: Rendered segment with angles and colors
- **ScheduledItem**: Item with calculated display position

## Time Notation Formats

Parser supports:
- 24h range: `12:30-14:20`
- 12h range: `9am to 1:45pm`, `9am-10am`
- Duration: `10m`, `45min`, `2h`, `1h30m`
- Completion: `d14:30` (Nautilus), ISO timestamp
- Dutch notation:
  - `2 uur` = 14:00
  - `half 1` = 12:30
  - `kwart over 3` = 15:15
  - `kwart voor 4` = 15:45
  - `10 over half 11` = 10:40
  - `5 voor half 2` = 13:25

## Color Scheme

- **Blue** (`#4A90D9`): Tasks
- **Yellow** (`#F5A623`): Fixed events
- **Gray** (`#D0D0D0`): Completed items
- **Red** (`#D64545`): Urgent/priority items
- **Red line** (`#E74C3C`): Current time indicator

## Database

PostgreSQL with Drizzle ORM. Run migrations:
```bash
pnpm --filter api db:migrate
```

## Environment Variables

See `packages/api/.env.example` and `packages/web/.env.example`.

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Access token signing key (min 32 chars)
- `JWT_REFRESH_SECRET` - Refresh token signing key (min 32 chars)
- `VITE_API_URL` - API base URL for frontend

## Testing

```bash
pnpm test                 # All tests
pnpm --filter api test    # API tests only
pnpm --filter web test    # Frontend tests only
```

## Conventions

- TypeScript strict mode
- 2-space indentation
- Single quotes for strings
- Semicolons required
- React functional components with hooks
- camelCase for variables/functions
- PascalCase for components/classes
- UPPER_SNAKE_CASE for constants

## Workflow

- **Read CHANGELOG.md first**: Understand project history before starting
- **Update CHANGELOG.md after each task**: Add changes under `[Unreleased]`
- **Atomic commits after each task**: Descriptive commit messages using the commit prefix style
- Run tests before committing
- Keep commits focused and atomic

## Commit Message Style

Use structured commit messages with prefixes:

```
[feat] Add new feature
[fix] Bug fix
[docs] Documentation changes
[refactor] Code refactoring
[test] Add or update tests
[chore] Maintenance tasks
[style] Code style changes
[perf] Performance improvements
```

**Format**: `[prefix] Short description (50 chars max)`
