import { Font } from '@react-pdf/renderer';

// Import font files from fontsource packages (using woff for broader compatibility)
import CinzelRegular from '@fontsource/cinzel/files/cinzel-latin-400-normal.woff';
import CinzelBold from '@fontsource/cinzel/files/cinzel-latin-700-normal.woff';
import CrimsonTextRegular from '@fontsource/crimson-text/files/crimson-text-latin-400-normal.woff';
import CrimsonTextBold from '@fontsource/crimson-text/files/crimson-text-latin-700-normal.woff';
import CrimsonTextItalic from '@fontsource/crimson-text/files/crimson-text-latin-400-italic.woff';

// Register medieval-style fonts for D&D aesthetic
Font.register({
  family: 'Cinzel',
  fonts: [
    { src: CinzelRegular, fontWeight: 'normal' },
    { src: CinzelBold, fontWeight: 'bold' },
  ],
});

Font.register({
  family: 'CrimsonText',
  fonts: [
    { src: CrimsonTextRegular, fontWeight: 'normal' },
    { src: CrimsonTextBold, fontWeight: 'bold' },
    { src: CrimsonTextItalic, fontStyle: 'italic' },
  ],
});

// Disable hyphenation for cleaner text
Font.registerHyphenationCallback((word) => [word]);
