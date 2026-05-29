export const themes = {
  'vintage-burgundy': {
    name: 'Vintage Burgundy',
    bg: '#2D141E',
    surface: '#401C2B', // Approx for rgba(64, 28, 43)
    text: '#FDE8E9',
    textMuted: '#D1A7B1',
    accent: '#E2859B',
    particle: '#D1A7B1',
  },
  'classic-light': {
    name: 'Classic Light',
    bg: '#FAF7F2',
    surface: '#F0EBE3',
    text: '#2C2420',
    textMuted: '#8C7B72',
    accent: '#C9A882',
    particle: '#E8C4B8',
  },
  'midnight-rose': {
    name: 'Midnight Rose',
    bg: '#050505',
    surface: '#111111',
    text: '#f5f5f5',
    textMuted: '#a1a1aa', // zinc-400
    accent: '#E11D48',    // rose-600
    particle: '#713f12',  // dark warm tone for particles
  },
  'ocean-breeze': {
    name: 'Ocean Breeze',
    bg: '#F0F7FA',
    surface: '#E1EEF4',
    text: '#1E293B',      // slate-800
    textMuted: '#64748B', // slate-500
    accent: '#0D9488',    // teal-600
    particle: '#99F6E4',  // teal-200
  },
  'blush-pink': {
    name: 'Blush Pink',
    bg: '#FFF1F2',        // rose-50
    surface: '#FFE4E6',   // rose-100
    text: '#4C0519',      // rose-950 (deep warm rose instead of blue/violet)
    textMuted: '#9F1239', // rose-700
    accent: '#E11D48',    // rose-600
    particle: '#FECDD3',  // rose-200
  }
};

export const defaultTheme = 'vintage-burgundy';
