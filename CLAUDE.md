# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Planething is a React-based flight tracking dashboard that displays real-time flight information. The application uses Convex as the backend database and server, with Convex Auth for authentication. It features a modern UI built with Tailwind CSS and displays flight departure/arrival information with delay tracking.

## Common Development Commands

### Development
- `npm run dev` - Start both frontend and backend development servers (recommended)
- `npm run dev:frontend` - Start Vite development server only
- `npm run dev:backend` - Start Convex development server only
- `npm run predev` - Setup command that runs Convex dev, setup script, and opens dashboard

### Build & Quality
- `npm run build` - Build the application for production
- `npm run lint` - Run TypeScript compilation and ESLint checks
- `npm run preview` - Preview the production build

### Convex CLI
- `npx convex dev` - Start Convex development server
- `npx convex dashboard` - Open Convex dashboard
- `npx convex docs` - Launch Convex documentation

## Architecture

### Frontend (src/)
- **App.tsx** - Main application component with React Router setup and authentication
- **components/Dashboard.tsx** - Main dashboard with flight list, stats, and infinite scrolling
- **components/FlightDetails.tsx** - Detailed flight information page with comprehensive flight data
- **components/ui/** - Reusable UI components (badge, card, table) following shadcn/ui patterns
- **hooks/useInfiniteFlights.ts** - Custom hook for infinite scrolling flight pagination with intersection observer
- **lib/utils.ts** - Utility functions (likely for class name merging with clsx/tailwind-merge)

### Backend (convex/)
- **schema.ts** - Convex database schema defining flights table with comprehensive flight data fields
- **myFunctions.ts** - Core backend functions:
  - `listFlights` - Paginated query to fetch flights (10 per page)
  - `getFlightStats` - Query to get statistics for all flights (totals, delays, airports)
  - `getFlightById` - Query to fetch single flight by ID for details page
  - `upsertFlights` - Mutation to insert/update flight data (prevents duplicates)
  - `addFlights` - Mutation to bulk insert flight data (legacy)
  - `cleanupOldFlights` - Mutation to remove flights older than specified hours
  - `truncateFlights` - Mutation to clear all flights (legacy)
  - `fetchFlights` - Action to fetch live flight data with modular provider support (AeroDataBox/AviationStack)
- **auth.config.ts** - Convex Auth configuration
- **auth.ts** - Authentication setup (likely exports auth utilities)

### Key Data Flow
1. Flight data is fetched via `fetchFlights` action with configurable providers (AeroDataBox default, AviationStack legacy)
2. AeroDataBox fetches both departures and arrivals in a single hourly call; AviationStack fetches separately 
3. Data is processed and upserted to Convex flights table (updates existing, inserts new)
4. Upsert prevents data loss and handles provider-specific field mapping
5. Frontend queries flights using paginated `listFlights` (10 per page) and displays in dashboard format
6. Stats header uses separate `getFlightStats` query to show totals for ALL flights in database
7. Infinite scrolling loads more flights as user scrolls down using intersection observer
8. Clicking on flight cards navigates to `/flight/:id` route showing detailed flight information
9. Flight details page uses `getFlightById` to fetch comprehensive flight data
10. Old flights can be cleaned up using `cleanupOldFlights` mutation
11. UI shows flight cards with departure/arrival info, delays, and real-time status

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, TypeScript, React Router
- **Backend**: Convex (database + serverless functions)
- **Authentication**: Convex Auth with password provider
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom design system (gradients, dark theme)

## External APIs

### AeroDataBox API (Default Provider)
- **Primary provider** for fetching real-time flight schedules via RapidAPI
- Fetches both departures and arrivals in a single hourly call 
- API key required as `AERODATABOX_API_KEY` environment variable
- Endpoint: `GET /flights/airports/iata/{code}/{fromLocal}/{toLocal}`
- Includes comprehensive flight data with legs, cancellations, and codeshares

### AviationStack API (Legacy Provider) 
- **Legacy provider** for fetching real-time flight departure data
- API key required as `AVIATIONSTACK_API_KEY` environment variable (optional if using AeroDataBox)
- Currently configured for OTP (Bucharest Henri Coandă International Airport)

### Provider Configuration
- Set `FLIGHT_DATA_PROVIDER=aerodatabox` (default) or `FLIGHT_DATA_PROVIDER=aviationstack`
- Modular design allows easy switching between providers

## Environment Setup

Ensure you have:
1. **Required**: `AERODATABOX_API_KEY` environment variable set (RapidAPI key for AeroDataBox)
2. **Optional**: `AVIATIONSTACK_API_KEY` environment variable (only if using AviationStack provider)
3. **Optional**: `FLIGHT_DATA_PROVIDER` environment variable (defaults to "aerodatabox")
4. Convex project configured (via `npx convex dev`)
5. Node.js and npm installed

See `.env.example` for complete environment variable reference.

## Development Notes

- The app uses a modern dark theme with blue/purple gradients and glass-morphism effects
- Flight cards are responsive with different layouts for mobile and desktop
- Real-time delay tracking with visual indicators (orange for delayed, green for on-time)
- Authentication is handled via Convex Auth with email/password flow