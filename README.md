# TodoDay

Een moderne todo-applicatie gebouwd met Angular en Supabase.

🌍 [English version below](#english)

## Features

- 🔐 Authenticatie met Supabase
- 📱 Responsive design
- 🌙 Dark mode support
- ⚡ Snelle en moderne UI met Tailwind CSS
- 📝 CRUD operaties voor taken
- 🔄 Real-time updates
- 🎯 Taak prioriteiten en categorieën
- 📅 Deadline management
- 🔍 Zoek en filter functionaliteit

## Technologieën

- Angular 17
- Supabase
- Tailwind CSS
- TypeScript
- RxJS
- NgRx Signals
- Jest (Unit Tests)
- Cypress (E2E Tests)

## Ontwikkeling

### Vereisten

- Node.js (v18 of hoger)
- pnpm (v8 of hoger)
- Angular CLI
- Git

### Installatie

1. Clone de repository:

```bash
git clone https://github.com/[jouw-username]/tododay.git
cd tododay
```

2. Installeer dependencies:

```bash
pnpm install
```

3. Maak een `.env` bestand aan in de root van het project:

```env
SUPABASE_URL=jouw-supabase-url
SUPABASE_ANON_KEY=jouw-supabase-anon-key
OPENAI_API_KEY=jouw-openai-api-key
```

4. Start de development server:

```bash
pnpm start
```

De applicatie is nu beschikbaar op `http://localhost:4200`.

### Scripts

- `pnpm start` - Start de development server
- `pnpm build` - Bouw de applicatie voor productie
- `pnpm test` - Voer unit tests uit
- `pnpm e2e` - Voer end-to-end tests uit
- `pnpm lint` - Controleer code kwaliteit
- `pnpm format` - Format de code met Prettier

## Deployment

1. Bouw de applicatie:

```bash
pnpm build
```

2. De gebouwde applicatie bevindt zich in de `dist` map

## Bijdragen

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## Licentie

Dit project is gelicenseerd onder de MIT licentie - zie het [LICENSE](LICENSE) bestand voor details.

---

<a name="english"></a>

# TodoDay (English)

A modern todo application built with Angular and Supabase.

## Features

- 🔐 Authentication with Supabase
- 📱 Responsive design
- 🌙 Dark mode support
- ⚡ Fast and modern UI with Tailwind CSS
- 📝 CRUD operations for tasks
- 🔄 Real-time updates
- 🎯 Task priorities and categories
- 📅 Deadline management
- 🔍 Search and filter functionality

## Technologies

- Angular 17
- Supabase
- Tailwind CSS
- TypeScript
- RxJS
- NgRx Signals
- Jest (Unit Tests)
- Cypress (E2E Tests)

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
OPENAI_API_KEY=your-openai-api-key
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
