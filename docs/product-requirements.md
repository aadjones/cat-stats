# CatStats - Product Requirements Document

## Overview

CatStats is a React-based pet personality analyzer that transforms pets into RPG-style character sheets. Users answer a questionnaire about their pet's behavior and receive a detailed character sheet with stats, abilities, and a shareable image.

## Core User Journey

1. **Questionnaire** - User uploads pet photo and answers personality questions
2. **Character Generation** - AI generates custom RPG character sheet based on responses
3. **Results Display** - Full character sheet with stats radar chart, abilities, and weakness
4. **Sharing** - Condensed shareable card image for social media

## Technical Architecture

### Frontend Stack

- React 19 + TypeScript
- Vite for build tooling
- Tailwind CSS v4 for styling
- html2canvas for image generation

### Backend

- Vercel Functions for API
- Anthropic Claude API for character generation
- No database - stateless generation

### Key Components

#### Core Analysis Engine

- `src/core/personality/statsCalculator.ts` - Converts questionnaire responses to 7 RPG stats
- `src/core/personality/questions.ts` - Questionnaire configuration
- Stats: wisdom, cunning, agility, stealth, charisma, resolve, boldness

#### Character Generation

- `api/character.js` - Vercel function that calls Claude API
- Generates archetype, abilities, weakness, and situational modifiers
- Validates JSON responses with schema checking

#### UI Components

- `PetPersonalityAnalyzer.tsx` - Main app orchestrator
- `QuestionnaireForm.tsx` - Multi-step questionnaire with validation
- `CharacterSheet.tsx` - Full results display
- `ShareableCard.tsx` - Condensed social media format
- `StatsRadarChart.tsx` - Canvas-based radar chart visualization

### Current Sharing System

#### What Works Well

- Native mobile sharing with image attachment
- Fallback to download + clipboard link copy
- High-quality PNG generation (375x600px at 2x scale)
- Condensed "highlights" format showing:
  - Pet photo and name
  - Top 3 stats with progress bars
  - Best combat move and social skill
  - Critical vulnerability
  - CatStats branding

#### Current Limitations

- Static image only - no interactive elements
- No unique URLs for individual characters
- No persistence - characters lost on refresh
- Limited social context (no comparison, leaderboards, etc.)
- Single share format - no customization

## Feature Flags & Configurations

- `SHOW_DEBUG_BUTTON` - Quick example character for demos
- `SHOW_SEPARATE_DOWNLOAD_BUTTON` - Additional download option
- `ENABLE_TEXT_EXPORT` - Plain text character sheet export

## Development Setup

- `npm run dev` - Vite development server
- `vercel dev` - Development with API functions
- Requires `ANTHROPIC_API_KEY` in `.env.local`

## Testing Philosophy

Focus on core analysis logic only:

- Stats calculation accuracy
- Character generation validation
- Edge case handling
- No UI component testing

## Performance Characteristics

- Fast questionnaire (~2-3 minutes)
- Character generation: 3-5 seconds via Claude API
- Image generation: ~1 second via html2canvas
- Mobile-first responsive design
- Offline-capable after initial load (except character generation)

## Business Model Considerations

- Currently free with no monetization
- Viral sharing drives organic growth
- Character persistence could enable premium features
- No user accounts required - friction-free experience
