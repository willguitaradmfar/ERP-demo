# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ERP-demo is a Next.js project with SQLite database, designed with a simple architecture for ERP functionality.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

This project follows a simple Next.js App Router structure with SQLite as the database:

- **Framework**: Next.js with App Router
- **Database**: SQLite (local file-based database)
- **ORM**: Prisma or Drizzle (to be configured)
- **Styling**: Tailwind CSS

### Directory Structure (planned)

```
src/
├── app/           # Next.js App Router pages and layouts
├── components/    # Reusable UI components
├── lib/           # Utility functions and database client
└── db/            # Database schema and migrations
```

## Database

SQLite database file will be stored in the project root or `prisma/` directory. The database connection is configured through the ORM's configuration file.
