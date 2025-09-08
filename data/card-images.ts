// This file contains placeholder base64 encoded SVG images for each tarot card.
// In a real-world application, these would be detailed, unique illustrations.
// For demonstration, we've created unique designs for the Major Arcana and each Minor Arcana suit.

const SVG_HEADER = 'data:image/svg+xml;base64,';

const createCardSvg = (centralElement: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" aria-hidden="true">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
      <stop offset="0%" stop-color="#2a2833" />
      <stop offset="100%" stop-color="#1c1b22" />
    </radialGradient>
  </defs>
  <rect width="300" height="420" fill="url(#g)" />
  <rect x="10" y="10" width="280" height="400" rx="20" ry="20" fill="none" stroke="#e0c483" stroke-width="2" stroke-opacity="0.5" />
  <rect x="15" y="15" width="270" height="390" rx="15" ry="15" fill="none" stroke="#e0c483" stroke-width="1" stroke-opacity="0.3" />
  <g transform="translate(150, 210)" class="text-accent" fill="none" stroke="currentColor" stroke-width="2">
    ${centralElement}
  </g>
</svg>
`;

const MAJOR_ARCANA_SVG = createCardSvg(`
  <g stroke-width="1.5">
    <path d="M0 -50 L14.695 -40.45 L28.53 -25 L28.53 0 L14.695 15.45 L0 25 L-14.695 15.45 L-28.53 0 L-28.53 -25 L-14.695 -40.45 Z" />
    <path d="M0 -30 L8.66 -15 L8.66 15 L0 30 L-8.66 15 L-8.66 -15 Z" fill="currentColor" stroke="none" opacity="0.3"/>
    <circle cx="0" cy="0" r="10"/>
    <path d="M 0 -50 L 0 -60 M 0 25 L 0 35 M 28.53 0 L 38.53 0 M -28.53 0 L -38.53 0" stroke-width="1" opacity="0.5"/>
  </g>
`);

const WANDS_SVG = createCardSvg(`
  <g transform="scale(1.2)">
    <path d="M0,30 C-25,-10 -10,-25 0,-50 C10,-25 25,-10 0,30 Z" fill="currentColor" opacity="0.3" stroke="none" />
    <path d="M0,20 C-15,0 -5,-15 0,-35 C5,-15 15,0 0,20 Z" stroke-width="1.5" />
    <path d="M-15 35 L0 50 L15 35" stroke-width="1" />
  </g>
`);

const CUPS_SVG = createCardSvg(`
  <g>
    <path d="M-30 20 L-30 -20 Q-30 -50 0 -50 Q30 -50 30 -20 L30 20 Z" />
    <path d="M-15 30 L15 30" />
    <path d="M0 30 L0 50" />
    <path d="M-10 50 L10 50" />
    <path d="M-20 -10 Q0 -20 20 -10 M-25 0 Q0 -10 25 0 M-20 10 Q0 0 20 10" stroke-width="1" opacity="0.5"/>
  </g>
`);

const SWORDS_SVG = createCardSvg(`
  <g transform="rotate(45)">
    <path d="M0 -60 L0 60 M-60 0 L60 0" stroke-width="1.5" />
    <path d="M-10 -50 L0 -60 L10 -50 M-10 50 L0 60 L10 50 M-50 -10 L-60 0 L-50 10 M50 -10 L60 0 L50 10" />
    <circle cx="0" cy="0" r="20" stroke-width="1" />
  </g>
`);

const PENTACLES_SVG = createCardSvg(`
  <g>
    <circle cx="0" cy="0" r="40" stroke-width="1.5" />
    <path d="M0,-30 L-28.53,22.5 L35.27,-9.27 L-35.27,-9.27 L28.53,22.5 Z" stroke-width="1.5" />
    <circle cx="0" cy="0" r="45" stroke-width="1" stroke-dasharray="3 4" opacity="0.7"/>
  </g>
`);

// Base64 encode the SVG strings
const MAJOR_ARCANA_IMG = SVG_HEADER + btoa(MAJOR_ARCANA_SVG);
const WANDS_IMG = SVG_HEADER + btoa(WANDS_SVG);
const CUPS_IMG = SVG_HEADER + btoa(CUPS_SVG);
const SWORDS_IMG = SVG_HEADER + btoa(SWORDS_SVG);
const PENTACLES_IMG = SVG_HEADER + btoa(PENTACLES_SVG);


// This map associates each card ID with its corresponding image.
export const CARD_IMAGES: { [key: string]: string } = {
  'major-0': MAJOR_ARCANA_IMG,
  'major-1': MAJOR_ARCANA_IMG,
  'major-2': MAJOR_ARCANA_IMG,
  'major-3': MAJOR_ARCANA_IMG,
  'major-4': MAJOR_ARCANA_IMG,
  'major-5': MAJOR_ARCANA_IMG,
  'major-6': MAJOR_ARCANA_IMG,
  'major-7': MAJOR_ARCANA_IMG,
  'major-8': MAJOR_ARCANA_IMG,
  'major-9': MAJOR_ARCANA_IMG,
  'major-10': MAJOR_ARCANA_IMG,
  'major-11': MAJOR_ARCANA_IMG,
  'major-12': MAJOR_ARCANA_IMG,
  'major-13': MAJOR_ARCANA_IMG,
  'major-14': MAJOR_ARCANA_IMG,
  'major-15': MAJOR_ARCANA_IMG,
  'major-16': MAJOR_ARCANA_IMG,
  'major-17': MAJOR_ARCANA_IMG,
  'major-18': MAJOR_ARCANA_IMG,
  'major-19': MAJOR_ARCANA_IMG,
  'major-20': MAJOR_ARCANA_IMG,
  'major-21': MAJOR_ARCANA_IMG,
  'wands-1': WANDS_IMG,
  'wands-2': WANDS_IMG,
  'wands-3': WANDS_IMG,
  'wands-4': WANDS_IMG,
  'wands-5': WANDS_IMG,
  'wands-6': WANDS_IMG,
  'wands-7': WANDS_IMG,
  'wands-8': WANDS_IMG,
  'wands-9': WANDS_IMG,
  'wands-10': WANDS_IMG,
  'wands-page': WANDS_IMG,
  'wands-knight': WANDS_IMG,
  'wands-queen': WANDS_IMG,
  'wands-king': WANDS_IMG,
  'cups-1': CUPS_IMG,
  'cups-2': CUPS_IMG,
  'cups-3': CUPS_IMG,
  'cups-4': CUPS_IMG,
  'cups-5': CUPS_IMG,
  'cups-6': CUPS_IMG,
  'cups-7': CUPS_IMG,
  'cups-8': CUPS_IMG,
  'cups-9': CUPS_IMG,
  'cups-10': CUPS_IMG,
  'cups-page': CUPS_IMG,
  'cups-knight': CUPS_IMG,
  'cups-queen': CUPS_IMG,
  'cups-king': CUPS_IMG,
  'swords-1': SWORDS_IMG,
  'swords-2': SWORDS_IMG,
  'swords-3': SWORDS_IMG,
  'swords-4': SWORDS_IMG,
  'swords-5': SWORDS_IMG,
  'swords-6': SWORDS_IMG,
  'swords-7': SWORDS_IMG,
  'swords-8': SWORDS_IMG,
  'swords-9': SWORDS_IMG,
  'swords-10': SWORDS_IMG,
  'swords-page': SWORDS_IMG,
  'swords-knight': SWORDS_IMG,
  'swords-queen': SWORDS_IMG,
  'swords-king': SWORDS_IMG,
  'pentacles-1': PENTACLES_IMG,
  'pentacles-2': PENTACLES_IMG,
  'pentacles-3': PENTACLES_IMG,
  'pentacles-4': PENTACLES_IMG,
  'pentacles-5': PENTACLES_IMG,
  'pentacles-6': PENTACLES_IMG,
  'pentacles-7': PENTACLES_IMG,
  'pentacles-8': PENTACLES_IMG,
  'pentacles-9': PENTACLES_IMG,
  'pentacles-10': PENTACLES_IMG,
  'pentacles-page': PENTACLES_IMG,
  'pentacles-knight': PENTACLES_IMG,
  'pentacles-queen': PENTACLES_IMG,
  'pentacles-king': PENTACLES_IMG,
};
