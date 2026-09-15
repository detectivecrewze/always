// Shared flower assets and deterministic opening layout used by the gift gate and finale.
export const BLOOM_THEME_IDS = [
  'vintage-burgundy',
  'classic-light',
  'midnight-rose',
  'ocean-breeze',
  'blush-pink',
  'midnight-blue',
  'velvet-purple',
  'antique-rose-diary',
];

const FLOWER_TYPES = ['rose', 'peony', 'hydrangea', 'anemone'];

export const BLOOM_FLOWER_SRCS = Object.fromEntries(
  BLOOM_THEME_IDS.map((theme) => [
    theme,
    FLOWER_TYPES.map((flower) => `/assets/bloom/${theme}-${flower}.webp`),
  ])
);

export function getBloomFlowerSources(themeName) {
  return BLOOM_FLOWER_SRCS[themeName] || BLOOM_FLOWER_SRCS['vintage-burgundy'];
}

const BLOOM_RINGS = [
  { radius: 0, count: 1, size: 30 },
  { radius: 14, count: 7, size: 29 },
  { radius: 27, count: 11, size: 28 },
  { radius: 40, count: 16, size: 27 },
  { radius: 52, count: 23, size: 26 },
];

export function buildBloomFlowers(themeName) {
  const sources = getBloomFlowerSources(themeName);

  return BLOOM_RINGS.flatMap(({ radius, count, size }, ring) =>
    Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + ring * 0.37;
      const offset = Math.sin((ring + 1) * 19 + index * 11) * 1.6;
      const distance = radius + offset;

      return {
        id: `${ring}-${index}`,
        src: sources[(index * 5 + ring) % sources.length],
        x: Math.cos(angle) * distance * 1.15,
        y: Math.sin(angle) * distance * 1.15,
        size: size + Math.sin(index * 7 + ring) * 1.5,
        rotate: (index * 47 + ring * 29) % 360,
        delay: ring * 0.5 + index * 0.06,
        spinDuration: 4.8 + ((index + ring) % 6) * 0.45,
        spinDirection: (index + ring) % 2 === 0 ? '360deg' : '-360deg',
      };
    })
  );
}
