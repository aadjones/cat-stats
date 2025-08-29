# CatStats 🐈‍⬛

Transform your pet into a legendary RPG character! CatStats is a personality analyzer that generates detailed character sheets for pets based on behavioral questionnaires.

## Features

- **Interactive Personality Quiz**: Multi-step questionnaire covering behavior, preferences, and quirks
- **RPG-Style Character Sheets**: Complete with combat moves, environmental powers, and social skills
- **Dynamic Stats Visualization**: Radar charts showing wisdom, cunning, agility, stealth, charisma, and resolve
- **AI-Generated Descriptions**: Unique character abilities powered by Claude AI
- **Beautiful Theming**: Color schemes that adapt to your pet's dominant personality traits
- **Export Functionality**: Download character sheets as text files

## Quick Start

### Prerequisites

- Node.js 18+
- Vercel CLI (for API functionality)
- Anthropic API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aadjones/cat-stats
   cd cat-stats
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   # Create .env.local
   echo "ANTHROPIC_API_KEY=your_api_key_here" > .env.local

   # Add to Vercel for development
   vercel env add ANTHROPIC_API_KEY development
   ```

4. Run the development server:

   ```bash
   # For full functionality with API
   vercel dev

   # For frontend-only development
   npm run dev
   ```

## Development

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run typecheck` - Run TypeScript type checking
- `vercel dev` - Start with API functionality

### Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3
- **API**: Vercel Functions (serverless)
- **AI Integration**: Anthropic Claude API
- **Testing**: Jest + React Testing Library

## Deployment

Deploy to Vercel:

1. Connect your repository to Vercel
2. Set the `ANTHROPIC_API_KEY` environment variable
3. Deploy automatically on push to main

## License

All Rights Reserved - see [LICENSE](LICENSE) file for details.
