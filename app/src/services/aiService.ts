import supabase from '../lib/supabase';
import type { DebugChallenge } from '../ui/screens/widgets/debugChallengeWidget';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface ChatEvaluation {
  isCorrect: boolean;
  feedback: string;
}

export interface BugfixTask {
  description: string;
  buggyCode: string;
  correctSolution: string;
  hint?: string;
}

export interface BugfixEvaluation {
  isCorrect: boolean;
  feedback: string;
}

export class AIService {
  private static decodeHTML(text: string): string {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  }

  public static async getQuizQuestions(skill: string, day: number): Promise<QuizQuestion[]> {
    const prompt = `You are a Senior Developer. Generate 5 quiz questions for a junior developer specializing in ${skill}. Difficulty level: day ${day} out of 7. Return the response STRICTLY as a JSON array: [{ "question": "question text", "options": ["option1", "option2", "option3", "option4"], "correctAnswer": "correct option" }]. No additional text, only valid JSON. Do not use HTML escaping, return tags exactly as they are.`;

    const rawData = await this.askAI(prompt);
    const rawQuestions = rawData as QuizQuestion[];

    return rawQuestions.map((q) => ({
      question: this.decodeHTML(q.question),
      options: q.options.map((opt) => this.decodeHTML(opt)),
      correctAnswer: this.decodeHTML(q.correctAnswer),
    }));
  }

  public static async getBugfixTask(
    day: number,
    skill: string = 'JavaScript',
  ): Promise<BugfixTask> {
    const prompt = `You are a Senior ${skill} Developer creating a "Fix the Bug" challenge for a junior.
    Day difficulty: ${day}/7 (higher = more subtle bug).

    Generate a small, realistic frontend/JavaScript bug. The code should be 5–50 lines, easy to read, with a single bug (e.g., closure mistake, incorrect 'this' binding, state mutation, async issue, array method misuse).

    Return STRICTLY a JSON object with:
    {
      "description": "Briefly explain what the code is supposed to do and hint at the bug without giving away the solution.",
      "buggyCode": "The buggy code snippet (use proper indentation, no syntax highlighting hints in the code).",
      "correctSolution": "The corrected version of the code.",
      "hint": "Optional short hint (or empty string)."
    }

    No extra text, only valid JSON.`;

    const raw = await this.askAI(prompt);
    return {
      description: raw.description,
      buggyCode: raw.buggyCode,
      correctSolution: raw.correctSolution,
      hint: raw.hint || '',
    };
  }

  public static async evaluateBugfixAnswer(
    task: BugfixTask,
    userAnswer: string,
  ): Promise<BugfixEvaluation> {
    const prompt = `You are a strict but fair Senior Developer evaluating a junior's bug fix.

    Original buggy code:
    \`\`\`
    ${task.buggyCode}
    \`\`\`

    Correct solution:
    \`\`\`
    ${task.correctSolution}
    \`\`\`

    Junior's answer:
    "${userAnswer}"

    Determine if the answer is correct or contains the correct fix. It's acceptable if they explain the fix instead of providing full code. Be lenient with formatting.

    Return STRICTLY a JSON object:
    {
      "isCorrect": true/false,
      "feedback": "Your constructive feedback (1-2 sentences). If wrong, guide them without giving the full answer."
    }`;

    return this.askAI(prompt);
  }

  public static async getDebugChallenge(day: number): Promise<DebugChallenge> {
    const prompt = `
    You are an expert JavaScript instructor. Generate a single JSON object for a JavaScript event loop challenge.
    Day number: ${day} (where 1 = easiest, 7 = hardest).

    Difficulty scaling based on day:
    - Day 1: Very basic – one sync log, one microtask (Promise.then), one macrotask (setTimeout 0). No nesting, straightforward order.
    - Day 2: Add one extra sync log or a second microtask (e.g., two Promises).
    - Day 3: Introduce a macrotask inside a microtask, or vice versa. Slight nesting.
    - Day 4: Multiple timeouts with different delays (0 vs 100ms) or multiple Promises that resolve at different times.
    - Day 5: Include async/await with Promise, or a Promise that resolves with another Promise. Mix of microtask and macrotask ordering with edge cases.
    - Day 6: Nested setTimeout inside Promise, or Promise inside setTimeout. Use queueMicrotask or MutationObserver as a microtask. Include a tricky order where microtasks from one branch interleave.
    - Day 7: Complex race conditions – multiple levels of nesting, mixing sync errors, Promise.reject, process.nextTick (if Node), or recursive microtasks. Hardest event loop puzzle.

    Requirements:
    - The challenge must test understanding of the JavaScript event loop: execution order of synchronous code, microtasks (Promises, queueMicrotask), and macrotasks (setTimeout, setInterval, I/O).
    - Return ONLY valid JSON, no extra text or explanation.

    Output format:
    {
      "description": "A clear, concise description of what the user needs to understand or predict.",
      "codeSnippet": "console.log(...); setTimeout(...); Promise.resolve().then(...); ...",
      "expectedOutputs": ["first output", "second output", ...]
    }

    Rules for codeSnippet:
    - Must be valid JavaScript (no syntax errors).
    - Follow the difficulty guidelines above – include the appropriate number of logs and nesting.
    - Use .trim() so the string has no leading/trailing blank lines.
    - For days 4+, use different delay values (e.g., setTimeout with 0 and 100).

    Rules for expectedOutputs:
    - An array of strings in the exact order the console.logs will appear when the code runs.
    - Must match the number of console.log statements in codeSnippet.

    Example for day 1 (easiest):
    {
      "description": "Arrange the console outputs in the order they appear.",
      "codeSnippet": "console.log('Start');\\nsetTimeout(() => console.log('Timeout'), 0);\\nPromise.resolve().then(() => console.log('Promise'));\\nconsole.log('End');",
      "expectedOutputs": ["Start", "End", "Promise", "Timeout"]
    }

    Now generate a unique challenge for day ${day} (difficulty level ${day}/7). Return ONLY the JSON object.
    `;

    const raw = await this.askAI(prompt);

    return {
      description: raw.description,
      codeSnippet: raw.codeSnippet,
      expectedOutputs: raw.expectedOutputs,
    };
  }

  private static async askAI(prompt: string) {
    const { data, error } = await supabase.functions.invoke('generate-task', {
      body: { prompt },
    });

    if (error) {
      console.error('[AIService] Edge Function Error:', error);
      throw new Error('Failed to communicate with AI');
    }

    return data;
  }
}
