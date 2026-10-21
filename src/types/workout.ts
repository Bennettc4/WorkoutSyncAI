export interface StretchItem {
  name: string;
  repsOrDuration: string;
  targetArea: string;
  instruction: string;
}

export interface ExerciseItem {
  stepNumber: number;
  name: string;
  targetMuscles: string;
  equipment: string;
  sets: number;
  repCount: string;
  restSeconds: number;
  formCues: string[];
  alternatives?: string;
}

export interface WorkoutDay {
  dayNumber: number;
  dayName: string;
  focus: string;
  targetMuscles: string[];
  estimatedDurationMinutes: number;
  stretchingWarmup: StretchItem[];
  exercises: ExerciseItem[];
  stretchingCooldown: StretchItem[];
  coachTips: string;
}

export interface WorkoutProgram {
  programTitle: string;
  programSubtitle: string;
  detectedScheduleSummary: string;
  totalDays: number;
  weeklyFrequency: string;
  coachPhilosophy: string;
  days: WorkoutDay[];
}
