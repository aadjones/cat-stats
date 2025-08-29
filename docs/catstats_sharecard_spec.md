# CatStats Animated Share Card - Spec Document

## Goal

Transform the static CatStats character sheet into a Wrapped-style animated video optimized for social sharing (TikTok, Instagram Stories, etc.).

## Key Features

- Animated reveal sequence (phased, dramatic, narrative-driven).
- Export to short mp4 (primary) and fallback GIF.
- Vertical format (9:16) for social compatibility.
- Loopable design (clean ending that can replay seamlessly).
- Branding: CatStats logo on final frame.

## Sequence / Storyboard

1. **Intro**
   - Fade in pet photo + name.
   - Archetype appears with RPG-style typing effect.

2. **Core Attributes**
   - Radar chart animates from center outward.
   - Each stat ticks up in sequence (short delays).
   - Highest stat highlighted with a final pop.

3. **Combat Moves & Environmental Powers**
   - Cards fade in one by one (slide up or flip animation).
   - Light visual flourish (sparkle, tail swoosh, etc.).

4. **Social Skills & Passive Traits**
   - Cards reveal more gently (slower fade/slide).
   - Quirky tone; lighter animation.

5. **Critical Vulnerability**
   - Dramatic reveal: flash red background, text shake.
   - Linger briefly to emphasize weakness.

6. **(Optional) Situational Modifiers**
   - Only if comedic angle works.
   - Otherwise, skip to maintain pacing.

7. **Sign-Off**
   - End card with pet photo cameo + CatStats branding.
   - Text: “Turn your pet into a legend at catstats.app”
   - Loop cleanly.

## Tech Approach

- **Frontend Animation**:
  - Use Framer Motion or CSS transitions for reveal animations.
  - Radar chart stat growth animated with SVG path morph or canvas draw.
  - Typewriter effect for archetype.
  - Flash/shake for vulnerability.

- **Video Export Options**:
  1. **MVP**: Animate in browser → user screen-records → share.
  2. **Intermediate**: Use `canvas-capture` or `html2canvas` + `gif.js` for browser export.
  3. **Advanced**: Server-side rendering with Remotion or ffmpeg templates for consistent mp4 output.

- **Format**:
  - Vertical (1080x1920).
  - Under 30s runtime if possible.
  - Mp4 (H.264) primary, fallback GIF for easy embedding.

## Future Enhancements

- Add archetype-themed visual styles (tarot card, neon cyberpunk, pixel art).
- Background music or sound cues (stat ticks, screen shake).
- Comparative stats (“stealthier than 87% of cats”).
- Multi-card remixing for more share variations.
