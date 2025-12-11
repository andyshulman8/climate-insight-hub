# Climate News Translator

## Overview
A React application for analyzing climate news content with evidence-based analysis. The app allows users to paste climate news articles for analysis and displays the latest climate news.

## Project Structure
- **src/** - Main source code
  - **components/** - React components including UI library (shadcn/ui)
  - **pages/** - Page components (Index, Profile, NotFound)
  - **hooks/** - Custom React hooks
  - **lib/** - Utility functions and API helpers
- **public/** - Static assets

## Tech Stack
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation
- TanStack Query for data fetching

## Running the Project
The app runs on port 5000 using `npm run dev`.

## Recent Changes
- 2025-12-11: Migrated from Lovable to Replit environment
  - Updated vite.config.ts to use port 5000 and allow all hosts
  - Fixed CSS @import ordering in index.css
  - Removed lovable-tagger plugin

## Known Issues
- News fetching returns 401 (API credentials may be needed)
