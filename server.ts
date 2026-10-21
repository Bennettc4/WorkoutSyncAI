import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support base64 image uploads up to 30mb
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI analysis endpoint
app.post('/api/analyze-schedule', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userNotes = '', focusGoal = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided. Please capture or upload a photo of your workout schedule.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please check your AI Studio secrets configuration.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Clean base64 string if it contains data URI header
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const prompt = `You are an elite, certified master strength and conditioning coach, physical therapist, and fitness programming specialist.
Carefully examine the workout schedule in this photo. It may be a handwritten note on paper, a gym whiteboard, a printed weekly split, a training app screenshot, or a bodybuilding log.

TASK:
1. Read the list of workout schedule days/splits shown in the image (e.g. Push/Pull/Legs, Upper/Lower, 5-day split, Full Body, Chest & Back, etc.). If parts are partially visible or handwritten, infer the best fitness split.
2. For EACH day in the schedule, design a comprehensive step-by-step gym routine:
   - Specific gym exercises with exact step order (Compound lifts first, followed by accessory/isolation).
   - Target muscle groups and gym equipment needed (e.g. Barbell, Dumbbells, Cable Station, Leg Press machine).
   - Exact rep counts (e.g., "8-10 reps", "12-15 reps", "3 sets to failure") and number of sets (e.g. 3-4 sets).
   - Rest periods in seconds between sets (e.g., 60-120 seconds).
   - Concrete form cues & execution tips for safety and maximum hypertrophy/strength.
   - Tailored Pre-Workout Dynamic Stretching & Joint Warm-Up (with names, repetitions/duration, target area, and clear instructions).
   - Tailored Post-Workout Cool-Down Static Stretching & Flexibility routine (with names, hold duration in seconds, target muscles, and guidance).
   - Pro coach tips and recovery guidance.
${userNotes ? `Additional user preference/context: "${userNotes}".` : ''}
${focusGoal ? `Target fitness focus: "${focusGoal}".` : ''}

You MUST output ONLY a valid JSON object matching this exact schema:
{
  "programTitle": "string (e.g. Hypertrophy Push-Pull-Legs Split)",
  "programSubtitle": "string (catchy tagline)",
  "detectedScheduleSummary": "string (what days or splits were detected)",
  "totalDays": 3,
  "weeklyFrequency": "string (e.g. 3-4 days per week)",
  "coachPhilosophy": "string (rationale for the workout progression)",
  "days": [
    {
      "dayNumber": 1,
      "dayName": "string (e.g. Day 1: Chest & Triceps (Push))",
      "focus": "string (e.g. Push / Upper Hypertrophy)",
      "targetMuscles": ["Chest", "Front Deltoids", "Triceps"],
      "estimatedDurationMinutes": 60,
      "stretchingWarmup": [
        {
          "name": "string (e.g. Arm Circles & Band Pull-Aparts)",
          "repsOrDuration": "string (e.g. 15 reps)",
          "targetArea": "string (e.g. Shoulders & Rotator Cuff)",
          "instruction": "string"
        }
      ],
      "exercises": [
        {
          "stepNumber": 1,
          "name": "string (e.g. Barbell Bench Press)",
          "targetMuscles": "string (e.g. Pectorals & Triceps)",
          "equipment": "string (e.g. Barbell & Flat Bench)",
          "sets": 4,
          "repCount": "string (e.g. 8-10 reps)",
          "restSeconds": 90,
          "formCues": ["Retract scapula", "Control eccentric tempo down"],
          "alternatives": "string (optional equipment alternative)"
        }
      ],
      "stretchingCooldown": [
        {
          "name": "string (e.g. Doorway Pec Stretch)",
          "repsOrDuration": "string (e.g. 30 sec per side)",
          "targetArea": "string (e.g. Chest)",
          "instruction": "string"
        }
      ],
      "coachTips": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Gemini returned an empty response. Please try taking a clearer photo.');
    }

    const cleanJson = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsedData = JSON.parse(cleanJson);
    return res.json({ success: true, data: parsedData });
  } catch (err: any) {
    console.error('Error generating workout routine:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to process workout schedule image. Please ensure the schedule is clearly visible and try again.',
    });
  }
});

// Vite middleware or production static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WorkoutAI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
