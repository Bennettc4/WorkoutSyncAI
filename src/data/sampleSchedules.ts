export interface SampleSchedule {
  id: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
}

// Generate realistic simulated schedule note images via canvas/SVG data URI
function createScheduleSvgUri(title: string, lines: string[], bgType: 'paper' | 'whiteboard' | 'dark'): string {
  const bg = bgType === 'paper' 
    ? '#fdf6e2' 
    : bgType === 'whiteboard' 
    ? '#ffffff' 
    : '#1e293b';
  const textColor = bgType === 'dark' ? '#f8fafc' : '#1e1b4b';
  const accentColor = bgType === 'dark' ? '#38bdf8' : '#4338ca';
  const gridColor = bgType === 'paper' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(0, 0, 0, 0.05)';

  const linesSvg = lines.map((line, idx) => {
    const y = 140 + idx * 46;
    return `
      <line x1="40" y1="${y + 12}" x2="560" y2="${y + 12}" stroke="${gridColor}" stroke-width="1.5" />
      <text x="60" y="${y}" font-family="monospace, sans-serif" font-size="20" font-weight="600" fill="${textColor}">
        ${line}
      </text>
    `;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
    <rect width="600" height="700" fill="${bg}" rx="16" />
    <rect x="20" y="20" width="560" height="660" fill="none" stroke="${accentColor}" stroke-width="2" stroke-dasharray="6,6" rx="12" opacity="0.4"/>
    <text x="50" y="70" font-family="sans-serif" font-size="26" font-weight="800" fill="${accentColor}">
      ${title}
    </text>
    <text x="50" y="100" font-family="sans-serif" font-size="14" font-weight="500" fill="${textColor}" opacity="0.7">
      GYM TRAINING SPLIT SCHEDULE
    </text>
    ${linesSvg}
    <text x="50" y="650" font-family="sans-serif" font-size="12" fill="${textColor}" opacity="0.5">
      WorkoutAI Scanner Test Card • 2026
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_SCHEDULES: SampleSchedule[] = [
  {
    id: 'ppl',
    title: 'Push / Pull / Legs (3-Day)',
    tagline: 'Classic Hypertrophy Foundation',
    description: 'Day 1: Chest, Shoulders, Triceps. Day 2: Back, Biceps, Rear Delts. Day 3: Quads, Hamstrings, Calves.',
    imageUrl: createScheduleSvgUri('PUSH • PULL • LEGS SPLIT', [
      'MON: Day 1 - Chest / Shoulders / Triceps',
      'WED: Day 2 - Back / Biceps / Rear Delts',
      'FRI: Day 3 - Quads / Hamstrings / Calves & Abs',
      'REST: Active Recovery & Mobility',
      'GOAL: Strength & Muscle Growth',
      'NOTES: Dynamic warm-up + post stretches'
    ], 'paper'),
  },
  {
    id: 'upper-lower',
    title: 'Upper / Lower (4-Day)',
    tagline: 'Balanced Athletic Strength Split',
    description: 'Day 1: Upper Power, Day 2: Lower Power, Day 3: Upper Hypertrophy, Day 4: Lower Hypertrophy.',
    imageUrl: createScheduleSvgUri('4-DAY UPPER / LOWER SPLIT', [
      'MONDAY: Upper Body A (Heavy Bench & Rows)',
      'TUESDAY: Lower Body A (Squat & Hamstrings)',
      'THURSDAY: Upper Body B (Overhead Press & Pullups)',
      'FRIDAY: Lower Body B (Deadlift & Lunges)',
      'WEEKEND: Rest & Mobility',
      'REPS: 6-12 reps per exercise'
    ], 'whiteboard'),
  },
  {
    id: 'bro-split',
    title: '5-Day Muscle Group Split',
    tagline: 'Targeted High-Volume Bodybuilding',
    description: 'Chest on Mon, Back on Tue, Shoulders on Wed, Legs on Thu, Arms on Fri.',
    imageUrl: createScheduleSvgUri('5-DAY BODYBUILDING SPLIT', [
      'DAY 1: Chest Focus + Calves',
      'DAY 2: Back Width & Thickness',
      'DAY 3: Shoulders & Traps',
      'DAY 4: Quad & Hamstring Annihilation',
      'DAY 5: Biceps, Triceps & Forearms',
      'WEEKEND: Rest & Recovery'
    ], 'dark'),
  },
];
