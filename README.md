# TodoDay

A modern todo application built with Angular and Supabase, featuring real-time task management and a beautiful user interface.

## Features

- 🔐 Secure authentication with Supabase
- 📱 Responsive design with mobile-first approach
- 🌙 Dark mode support with system preference detection
- ⚡ Fast and modern UI with Tailwind CSS
- 📝 Advanced task management:
  - Create, read, update, and delete tasks
  - Task status tracking (Todo, In Progress, Done)
  - Priority levels (High, Medium, Low)
  - Project organization
  - Custom labels
  - Due dates and start dates
  - Reminder notifications
- 🔄 Real-time updates with Supabase subscriptions
- 🎯 Task organization:
  - Project categorization
  - Label-based filtering
  - Priority-based sorting
  - Status-based grouping (Active/Completed)
- 📅 Date management:
  - Due date tracking
  - Start date scheduling
  - Reminder notifications
- 🔍 Smart task filtering and organization
- 🎨 Modern UI components:
  - Responsive grid layout
  - Interactive task cards
  - Status indicators
  - Priority badges
  - Project tags
  - Label chips

## Technologies

- Angular 17 with standalone components
- Supabase for backend and real-time features
- Tailwind CSS for styling
- TypeScript for type safety
- RxJS for reactive programming
- Angular Signals for state management
- Jest for unit testing
- Cypress for end-to-end testing
- Angular Material for UI components
- Font Awesome for icons

## Development

### Requirements

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Angular CLI
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/[your-username]/tododay.git
cd tododay
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the project root:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:

```bash
pnpm start
```

The application is now available at `http://localhost:4200`.

### Scripts

- `pnpm start` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm test` - Run unit tests
- `pnpm e2e` - Run end-to-end tests
- `pnpm lint` - Check code quality
- `pnpm format` - Format code with Prettier

## Project Structure

```
tododay/
├── src/
│   ├── app/
│   │   ├── core/           # Core services, guards, and models
│   │   │   ├── auth/      # Authentication
│   │   │   └── task/      # Task management
│   │   └── shared/        # Shared components and utilities
│   └── assets/            # Static assets
├── projects/              # Monorepo projects
└── tests/                # Test files
```

## Deployment

1. Build the application:

```bash
pnpm build
```

2. The built application is located in the `dist` directory

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
