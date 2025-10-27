import type { CharacterSheet } from '../../core/personality/types';

interface Theme {
  gradient: string;
  accentRgb: string;
  accent: string;
}

interface YearbookCharacterSheetProps {
  characterSheet: CharacterSheet;
  theme: Theme;
}

export function YearbookCharacterSheet({
  characterSheet,
}: YearbookCharacterSheetProps) {
  const { characterData, petName, petPhoto } = characterSheet;

  // Type guard to ensure we have yearbook data
  if (characterData.type !== 'yearbook') {
    return <div>Error: Expected yearbook data</div>;
  }

  // After type guard, TypeScript knows characterData is YearbookCharacterData

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
      <div
        className="bg-gradient-to-br from-amber-50 to-yellow-100 border-4 border-amber-900 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl relative"
        style={{
          boxShadow:
            '0 10px 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.3)',
        }}
      >
        {/* Yearbook header with vintage styling */}
        <div className="text-center mb-6 sm:mb-8 border-b-4 border-amber-900 pb-4">
          <div className="text-xs sm:text-sm text-amber-800 font-serif mb-1">
            CLASS OF 2025
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-amber-900 mb-2">
            {petName}
          </h1>
          <p className="text-amber-800 text-lg sm:text-xl font-serif italic">
            "{characterData.archetype}"
          </p>
        </div>

        {/* Photo and senior quote section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Photo */}
          <div className="flex justify-center items-start">
            {petPhoto ? (
              <div className="relative">
                <div
                  className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg overflow-hidden border-4 border-amber-900 bg-amber-200"
                  style={{
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
                  }}
                >
                  <img
                    src={petPhoto}
                    alt={petName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Photo corner decoration */}
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-900 transform rotate-45"></div>
              </div>
            ) : (
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg border-4 border-amber-900 bg-amber-200 flex items-center justify-center">
                <span className="text-6xl">📷</span>
              </div>
            )}
          </div>

          {/* Senior Quote and Quick Facts */}
          <div className="space-y-4">
            <div className="bg-amber-100 border-2 border-amber-800 rounded-lg p-4">
              <h3 className="text-amber-900 font-serif font-bold text-sm mb-2">
                SENIOR QUOTE
              </h3>
              <p className="text-amber-800 italic font-serif text-base">
                "{characterData.seniorQuote}"
              </p>
            </div>

            <div className="bg-amber-100 border-2 border-amber-800 rounded-lg p-4">
              <h3 className="text-amber-900 font-serif font-bold text-sm mb-2">
                ACTIVITIES & CLUBS
              </h3>
              <ul className="space-y-1">
                {characterData.clubs.map((club, index) => (
                  <li
                    key={index}
                    className="text-amber-800 text-amber-800 text-sm"
                  >
                    • {club}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Superlatives */}
        <div className="mb-6">
          <h3 className="text-center text-amber-900 font-serif font-bold text-xl sm:text-2xl mb-4 border-b-2 border-amber-900 pb-2">
            SUPERLATIVES
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {characterData.superlatives.map((superlative, index) => (
              <div
                key={index}
                className="bg-amber-100 border-2 border-amber-800 rounded-lg p-3 text-center"
              >
                <div className="text-amber-700 text-xs font-serif uppercase mb-1">
                  {superlative.category}
                </div>
                <div className="text-amber-900 font-serif font-bold text-sm sm:text-base">
                  {superlative.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Moments */}
        <div className="mb-6">
          <h3 className="text-center text-amber-900 font-serif font-bold text-xl sm:text-2xl mb-4 border-b-2 border-amber-900 pb-2">
            FAVORITE MEMORIES
          </h3>
          <div className="space-y-3">
            {characterData.favoriteMoments.map((moment, index) => (
              <div
                key={index}
                className="bg-amber-100 border-l-4 border-amber-800 rounded-r-lg p-3"
              >
                <p className="text-amber-800 font-serif text-sm sm:text-base">
                  {moment}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Future Goals */}
        <div className="bg-gradient-to-r from-amber-200 to-yellow-200 border-2 border-amber-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-amber-900 font-serif font-bold text-lg sm:text-xl mb-3 text-center">
            WHERE WILL THEY BE IN 10 YEARS?
          </h3>
          <p className="text-amber-800 font-serif text-sm sm:text-base text-center leading-relaxed">
            {characterData.futureGoals}
          </p>
        </div>

        {/* Decorative yearbook signature line */}
        <div className="mt-6 pt-4 border-t-2 border-amber-900">
          <p className="text-center text-amber-700 text-xs font-serif italic">
            "Stay pawsome, never change!" - The Yearbook Committee
          </p>
        </div>
      </div>
    </div>
  );
}
