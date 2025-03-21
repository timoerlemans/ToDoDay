# TodoDay

Een moderne todo-applicatie gebouwd met Angular en Supabase.

## Features

- 🔐 Authenticatie met Supabase
- 📱 Responsive design
- 🌙 Dark mode support
- ⚡ Snelle en moderne UI met Tailwind CSS
- 📝 CRUD operaties voor taken

## Technologieën

- Angular 17
- Supabase
- Tailwind CSS
- TypeScript
- RxJS

## Ontwikkeling

### Vereisten

- Node.js (v18 of hoger)
- pnpm (v8 of hoger)
- Angular CLI

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

3. Maak een `.env` bestand aan in de root van het project met de volgende variabelen:
```env
SUPABASE_URL=jouw-supabase-url
SUPABASE_ANON_KEY=jouw-supabase-anon-key
```

4. Start de development server:
```bash
pnpm start
```

De applicatie is nu beschikbaar op `http://localhost:4200`.

## Build

Om een productie build te maken:

```bash
pnpm build
```

## Licentie

MIT
