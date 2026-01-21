# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Development Principles

- **Simple > Clever:** Prefer simple, readable solutions even if they are less "elegant."
- **Delete > Add:** Aggressively seek opportunities to remove code and dependencies.
- **Working > Perfect:** Focus on delivering a working solution for the immediate problem.
- **Honest & Direct:** State limitations and push back on bad ideas clearly and without jargon.
- **Question Assumptions:** Don't blindly accept that a new feature, dependency, or "best practice" is necessary.

## Debugging Mode: Think Like a Detective

When something isn't working, **STOP FLAILING** and become systematic:

### 1. State Your Theory

Form a specific, testable hypothesis about the root cause:

- "I think X is happening because of Y"
- "The symptom suggests Z might be broken"

### 2. Design a Minimal Test

Create the simplest possible test to prove/disprove your theory:

- Isolate one variable at a time
- Remove all unnecessary complexity
- Make the test outcome binary (works/doesn't work)

### 3. Collect Evidence

Look at actual data, not assumptions:

- Browser DevTools (Network, Console, Elements)
- Build outputs and error messages
- File contents and configurations

### 4. Test Systematically

Run tests in logical order:

- Start with the most likely cause
- Test one thing at a time
- Document what you tried and the results

### 5. Form New Theory

Based on evidence, either:

- Confirm your theory and fix the root cause
- Reject your theory and form a new one
- Discover the issue was elsewhere entirely

## Critical Deployment Lessons (2025)

### Tailwind CSS v4 Breaking Changes

**SYMPTOM**: CSS file extremely small (~3kB), no color classes like `bg-red-500` generated, styling looks broken.

**ROOT CAUSE**: Tailwind CSS v4 completely changed the import syntax:

- ❌ **OLD (v3)**: `@tailwind base; @tailwind components; @tailwind utilities;`
- ✅ **NEW (v4)**: `@import "tailwindcss";`

**SOLUTION**:

1. Update `src/index.css` to use `@import "tailwindcss";`
2. Remove conflicting Vite default CSS that overrides Tailwind
3. Install `@tailwindcss/postcss` plugin for PostCSS processing

**EVIDENCE**: CSS file jumps from 3kB to 27kB when fixed correctly.

### Vercel API Functions Must Use JavaScript (2025)

**SYMPTOM**: `FUNCTION_INVOCATION_FAILED` errors, APIs returning HTML instead of JSON.

**ROOT CAUSE**: Vercel now requires plain JavaScript files for API functions, not TypeScript.

- ❌ `api/character.ts` - Causes function invocation failures
- ✅ `api/character.js` - Works correctly

**SOLUTION**:

1. Convert all `api/*.ts` files to `api/*.js` files
2. Remove TypeScript imports (e.g., `import type { VercelRequest, VercelResponse }`)
3. Use simple ES6 exports: `export default async function handler(req, res) {}`
4. Keep `vercel.json` minimal or use simple rewrites

**DON'T**: Over-commit to git during debugging. Test changes locally first.

### ESLint React Hook Dependency Warnings - CRITICAL GUIDANCE

**SYMPTOM**: ESLint warnings like "React Hook useEffect has missing dependencies"

**⚠️ DO NOT BLINDLY FIX THESE WARNINGS ⚠️**

**ROOT CAUSE**: ESLint cannot understand complex animation timing or intentional dependency omissions.

**DANGEROUS PATTERN**: Adding `currentPhase` or other state variables to animation useEffect dependencies will cause infinite re-render loops and break timing-sensitive code.

**WHEN TO IGNORE THE WARNING**:

- Animation controllers that manage phase transitions
- Effects that should only run once on mount
- Timing-sensitive code where re-running would break functionality
- Cases where the effect manages its own state via refs

**SAFE APPROACH**:

1. **Understand WHY the dependency is missing** before adding it
2. **Test the behavior** - does adding the dependency break anything?
3. **Use `// eslint-disable-next-line react-hooks/exhaustive-deps` comment** if the warning is intentionally ignored
4. **Never add dependencies that would cause the effect to re-run on every state change**

**EXAMPLE OF WHAT NOT TO DO**:

```js
// ❌ This will break animation timing by restarting on every phase change
useEffect(() => {
  // Animation logic that progresses through phases
}, [currentPhase, isPlaying]); // currentPhase causes infinite loop!
```

**CORRECT APPROACH**:

```js
// ✅ Only restart when play/pause changes, not on phase transitions
useEffect(() => {
  // Animation logic that progresses through phases
}, [isPlaying]); // eslint-disable-next-line react-hooks/exhaustive-deps
```

### Default Questions to Ask

- What is the absolute simplest version of this that could work?
- Are we building something we don't need yet?
- Is this solving a real problem, or an imaginary one?
- Can we test this idea with a small experiment instead of a big rewrite?

## Testing Philosophy

Write **focused unit tests for core analysis logic only**. Follow these principles:

### What to Test

- **Core algorithms**: Pet personality calculations, stat generation, character creation logic
- **Data transformations**: User input processing, stat calculations, character data formatting
- **Business rules**: Personality archetype assignment, attribute scoring, character sheet generation
- **Edge cases**: Invalid inputs, missing data, boundary conditions

### What NOT to Test

- **UI interactions**: Don't test React components, user interactions, or rendering
- **Complex mocking**: Avoid heavy mocking of external APIs or file systems
- **Implementation details**: Don't test internal function calls or intermediate states

### Test Quality Guidelines

- **Behavioral, not brittle**: Test that personality calculations are reasonable, not exact values
- **Meaningful assertions**: Verify core functionality works as intended
- **Value-driven**: Only write tests that would catch real regressions in pet analysis
- **Fast and reliable**: Tests should run quickly without external dependencies

### Test Organization

- **All tests go in `src/test/`**: Mirror the source structure (e.g., `src/test/core/personality/`)
- **Test files use `.test.ts` or `.spec.ts` suffix**

## Git Workflow

This project uses automated CI commits to keep the repository active (periodic heartbeat commits). This means you'll often need to rebase before pushing.

**Standard workflow for pushing changes:**

```bash
git pull --rebase origin main
git push
```

The `--rebase` flag ensures your commits are replayed on top of the automated CI commits, keeping history linear and clean.

**If you hit rebase conflicts:**

1. Fix conflicts in the affected files
2. `git add <fixed-files>`
3. `git rebase --continue`

## Pre-commit Requirements

Before committing to git, ensure:

- **Tests pass**: `npm test` shows all green
- **Code is formatted**: `npm run format` to auto-format all files
- **Linting passes**: `npm run lint` with zero errors or warnings

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build` (runs TypeScript compiler first, then Vite build)
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`
- **Run tests**: `npm test`
- **Run tests in watch mode**: `npm run test:watch`
- **Format code**: `npm run format`

## Project URLs

- **Production**: https://cat-stats-six.vercel.app/
- **Hosting**: Vercel

## Architecture Overview

This is a React + TypeScript + Vite application called "CatStats" - a pet personality analyzer that generates RPG-style character sheets for cats.

### Core Structure

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite with HMR (Hot Module Replacement)
- **Styling**: CSS with Tailwind-style utility classes (inline styles)
- **Linting**: ESLint with React-specific rules

### Key Components

- Main application logic is in `src/App.tsx` (currently default Vite template)
- Complete pet analyzer implementation exists in `docs/pet_personality_analyzer.tsx` (not yet integrated)
- The pet analyzer includes:
  - Multi-step questionnaire system
  - Statistical calculation engine for pet attributes (wisdom, cunning, agility, etc.)
  - Canvas-based radar chart visualization
  - PDF/text export functionality
  - Dynamic theming based on dominant pet attributes

### API Setup (Required for Character Generation)

The app uses Vercel Functions to proxy API calls to Anthropic Claude API:

- **Development**: `vercel dev` (requires Vercel CLI + `.env.local` with `ANTHROPIC_API_KEY`)
- **Production**: Deploy to Vercel and set `ANTHROPIC_API_KEY` environment variable
- **API endpoint**: `/api/character` (proxies to `https://api.anthropic.com/v1/messages`)

### Development Setup

1. Install Vercel CLI: `npm install -g vercel`
2. Create `.env.local`: `ANTHROPIC_API_KEY=your_api_key_here`
3. Run locally: `vercel dev` instead of `npm run dev`

### Development Notes

- Uses ES modules (`"type": "module"` in package.json)
- TypeScript configuration split between app and node contexts
- Standard Vite React setup with minimal dependencies
- No testing framework currently configured
