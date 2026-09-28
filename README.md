# Cogniva — Cognitive Gaming & Memory Assistance

Cogniva is a full-stack, responsive prototype for **supportive cognitive activities, personalized memory assistance, daily reminders, and caregiver-friendly activity summaries**. It is designed for a college or hackathon demonstration and uses fictional demo data so the experience is populated from the first screen.

> **Safety notice:** Cogniva is a supportive cognitive and memory assistance tool. It is not a medical diagnostic or treatment system, does not measure dementia severity, and does not replace doctors, psychologists, neurologists, caregivers, or professional care.

## Project overview

The application combines a calm, accessible user experience with a server-backed data layer. The landing experience opens directly into a demo workspace so a presenter can show the complete journey in five to ten minutes: today’s reminders, a recommended activity, a playable game, a memory prompt, progress charts, and caregiver view.

When a user signs in through the scaffold’s Manus OAuth flow, Cogniva switches to private workspace mode. Profile, memories, reminders, and game results then use the authenticated user’s database records and all protected procedures scope queries to the current user ID. The demo workspace remains available without a login and is intentionally populated with fictional data.

## Features

- Calm, responsive navigation designed for desktop, tablet, and mobile.
- Demo workspace with fictional Arun / Meena / Ravi data.
- Protected profile, memory, reminder, and game-result procedures for signed-in users.
- Memory Matching and Number Recall games with timers, scores, accuracy, and result screens.
- Additional activity cards for Picture Recognition and Daily Orientation.
- Adaptive recommendation fallback based on recent game activity.
- Personalized memory prompts generated through a safe rule-based fallback.
- Memory timeline with category filters, delete action, and prompt creation.
- Reminder creation, completion toggle, delete action, repeat and priority fields.
- Personal progress view with accuracy trend, activity breakdown, and recent sessions.
- Caregiver view with descriptive, non-clinical activity insights and quick actions.
- Accessible buttons, visible focus states, semantic labels, large touch targets, reduced-motion support, and friendly empty states.
- Toast notifications, validation, loading state, modal dialogs, and privacy messaging.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, custom responsive CSS |
| Backend | Node.js, Express, tRPC 11 |
| Database | MySQL/TiDB through Drizzle ORM |
| Authentication | Manus OAuth session cookie provided by the WebDev scaffold |
| UI | Lucide icons, Sonner toasts, Recharts-compatible project dependencies |
| AI | Provider-agnostic tRPC fallback procedures; external AI can be added behind the server boundary |
| Tooling | pnpm, Vitest, Drizzle Kit, TypeScript |

## Architecture

The browser renders React pages and calls typed tRPC procedures under `/api/trpc`. Protected procedures receive the authenticated user from the server context and pass only that user’s ID to database helpers. Drizzle maps the feature tables in `drizzle/schema.ts` to the configured MySQL/TiDB database. The `ai` router currently uses a deterministic fallback so the product works without an external API key; an LLM provider can be added to the server layer without coupling the UI to a provider.

```text
React UI
   ↓ typed tRPC hooks
Express + tRPC server
   ↓ protected user-scoped queries
Drizzle ORM
   ↓
MySQL / TiDB

AI router → rule-based fallback today → optional provider abstraction later
```

## Folder structure

```text
cognitive-memory-assistance/
├── client/
│   ├── src/
│   │   ├── pages/Home.tsx       # main responsive experience and games
│   │   ├── components/          # scaffold and shared UI components
│   │   ├── contexts/            # theme context
│   │   └── index.css            # application design system
│   └── index.html
├── drizzle/
│   ├── schema.ts                # users, profiles, memories, reminders, games
│   └── migrations/              # generated database migrations
├── server/
│   ├── db.ts                    # user-scoped query helpers
│   ├── routers.ts               # typed tRPC API surface
│   └── _core/                   # framework authentication/runtime
├── shared/
├── .env.example
├── package.json
└── README.md
```

## Installation

The project requires Node.js 22 or a compatible current Node release and pnpm.

```bash
git clone YOUR_REPOSITORY_URL cognitive-memory-assistance
cd cognitive-memory-assistance
pnpm install
cp .env.example .env
```

Configure the database and authentication values in `.env`. In a WebDev environment the platform supplies these values automatically; when running outside Manus, provide your own compatible session/auth implementation or keep the demo workspace for frontend-only presentation.

## Environment variables

`.env.example` is intentionally safe to commit. Never commit `.env` or real credentials.

```dotenv
DATABASE_URL=mysql://user:password@localhost:3306/cogniva
JWT_SECRET=replace-with-a-long-random-secret
VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=
OWNER_NAME=
AI_API_KEY=
```

`AI_API_KEY` is optional. Cogniva’s memory prompt and recommendation features have a deterministic fallback and remain functional when the key is empty.

## Database setup

The repository includes a generated migration for the application tables. For a configured database:

```bash
pnpm db:push
```

The schema includes `users`, `profiles`, `memories`, `people`, `places`, `reminders`, `gameResults`, and `recommendations`. Foreign-key-like ownership is enforced in application procedures by scoping every query to the authenticated user ID. The demo workspace uses fictional in-browser sample data and does not require a database connection.

## Running locally

```bash
pnpm dev
```

Open the Vite/Express URL printed by the server. Use **Demo mode** to explore immediately, or sign in through the configured OAuth flow to exercise protected database-backed procedures.

Useful commands:

```bash
pnpm check       # TypeScript validation
pnpm test        # Vitest suite
pnpm build       # production frontend + server bundle
pnpm format      # Prettier formatting
```

## Demo flow

1. Start on **Today** and review today’s reminders.
2. Select **Start a gentle activity** or open **Cognitive games**.
3. Play Memory Matching or Number Recall.
4. Review the result screen and adaptive next-step note.
5. Open **Memory assistant**, filter the timeline, and make a prompt.
6. Add a memory or reminder with the modal form.
7. Open **My progress** to show the chart and activity history.
8. Open **Caregiver view** to show descriptive weekly insights.

## API documentation

The application exposes these typed tRPC procedures under `/api/trpc`:

| Procedure | Type | Purpose |
| --- | --- | --- |
| `auth.me` | query | Read the current session user |
| `auth.logout` | mutation | Clear the session cookie |
| `profile.get` | query | Read the signed-in user profile |
| `profile.save` | mutation | Save validated profile fields |
| `memories.list` | query | List the current user’s memories |
| `memories.add` | mutation | Create a validated memory |
| `memories.remove` | mutation | Remove an owned memory |
| `reminders.list` | query | List the current user’s reminders |
| `reminders.add` | mutation | Create a reminder |
| `reminders.toggle` | mutation | Mark an owned reminder complete/incomplete |
| `reminders.remove` | mutation | Delete an owned reminder |
| `games.list` | query | List the current user’s game results |
| `games.add` | mutation | Store a validated game result |
| `ai.memoryPrompt` | mutation | Generate a simple safe memory prompt |
| `ai.recommendation` | query | Recommend a next activity from recent performance |

## How to export and run locally

The project is organized as a normal source repository. Export or download the project directory, open it in VS Code, install dependencies, copy `.env.example` to `.env`, configure a compatible database, and run the commands above. Core UI and server source are in the repository; the WebDev runtime files are isolated under `server/_core`.

## How to push to GitHub

Do not include a real repository URL until you have created it.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

The included `.gitignore` excludes environment files, build output, logs, and local database artifacts.

## Deployment options

For a WebDev deployment, use the project’s managed preview/deployment workflow after configuring database and OAuth environment variables. For portable deployment, build the Node server with `pnpm build` and run the generated server bundle with `pnpm start` in a Node container. A managed MySQL/TiDB instance is recommended for production; SQLite can be used for a future local-only adapter if the Drizzle schema is migrated to SQLite types.

## Privacy, security, and limitations

Passwords are not handled by Cogniva directly; the scaffold’s OAuth flow manages authentication sessions. Protected data procedures use the current session user ID and never accept an arbitrary user ID from the browser. Inputs are validated with Zod and friendly errors are shown through the UI.

This is a prototype with fictional demo data. It does not provide medical advice, medication guidance, diagnosis, treatment, clinical scoring, or emergency support. Reminder text is entered by the user or caregiver and should be reviewed by a responsible person. Do not use the prototype as a substitute for professional care.
