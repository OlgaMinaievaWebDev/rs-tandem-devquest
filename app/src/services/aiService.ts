// src/services/aiService.ts
import supabase from '../lib/supabase';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface ChatEvaluation {
  isCorrect: boolean;
  feedback: string;
}

// export interface BossResponse {
//   title?: string;
//   seniorLeadResponse: string; // Основной текст от босса
//   codeExample?: string; // Код, если есть
//   codeExplanation?: string; // Объяснение кода
//   feedback?: string;
// }

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

  // public static async getAILeadResponse(
  //   gameId: 'bugfix' | 'debug',
  //   day: number,
  //   userMessage: string,
  // ): Promise<BossResponse> {
  //   const prompt = `You are a strict but professional Senior Frontend Developer and AI Team Lead at DevQuest with 10+ years of experience.

  //   You specialize ONLY in frontend: JavaScript, TypeScript, React, HTML, CSS, and modern frontend practices.

  //   Today is Day ${day}. The current task is: ${gameId === 'bugfix' ? 'Fix the Bug' : 'Debug Challenge'}.

  //   Junior's message: "${userMessage}"

  //   Return your response **strictly as a valid JSON object** with no extra text:

  //   {
  //     "seniorLeadResponse": "your main message to the junior (be direct and professional)",
  //     "codeExample": "improved code example if applicable, or empty string",
  //     "codeExplanation": "brief explanation of the code or what was wrong, or empty string",
  //     "feedback": "short feedback on their approach"
  //   }

  //   Requirements for the bug:
  //   - Must be a realistic frontend bug (JS, DOM manipulation, state, events, rendering, etc.)
  //   - The code must look like real production code
  //   - The bug should be findable but not too obvious
  //   - Do NOT include the correct solution in the code or comments
  //   - Make sure "buggyCode" contains actual code with syntax highlighting in mind (use proper indentation)

  //   Return ONLY valid JSON. No explanations, no markdown.

  //   Rules:
  //   - Stay strictly within frontend development.
  //   - Use modern, clean frontend practices.
  //   - Never be overly rude or toxic.
  //   - Always provide value and direction.
  //   - Return only valid JSON.`;

  //   try {
  //     const raw = await this.askAI(prompt);

  //     if (typeof raw === 'string') {
  //       return {
  //         seniorLeadResponse: raw,
  //         codeExample: '',
  //         codeExplanation: '',
  //         feedback: '',
  //       };
  //     }

  //     return {
  //       seniorLeadResponse: raw?.seniorLeadResponse || 'I expected a cleaner frontend solution.',
  //       codeExample: raw?.codeExample || '',
  //       codeExplanation: raw?.codeExplanation || '',
  //       feedback: raw?.feedback || '',
  //     };
  //   } catch (error) {
  //     console.error('getBossResponse error:', error);
  //     return {
  //       seniorLeadResponse: "I didn't catch that. Please explain your frontend solution again.",
  //       codeExample: '',
  //       codeExplanation: '',
  //       feedback: '',
  //     };
  //   }
  // }

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

  // 2. ПРОВЕРКА ОТВЕТА В ЧАТЕ (Вызывается при каждом ответе пользователя)
  // public static async evaluateChatAnswer(
  //   skill: string,
  //   question: string,
  //   userAnswer: string,
  // ): Promise<ChatEvaluation> {
  //   // Здесь промпт динамический! Он включает ответ реального игрока.
  //   const prompt = `Ты строгий, но справедливый Senior ${skill} Developer.
  //   Твой джуниор ответил на вопрос: "${question}".
  //   Его ответ: "${userAnswer}".
  //   Оцени этот ответ. Верни СТРОГО JSON: { "isCorrect": true/false, "feedback": "Твой короткий комментарий и совет" }. Никакого лишнего текста.`;

  //   return this.askAI(prompt);
  // }

  // 3. ГЕНЕРАЦИЯ БАГФИКСА (На будущее)
  // public static async getBugfixTask(skill: string, day: number) {
  //   const prompt = `Ты Senior Developer. Дай задачу на поиск бага для ${skill}... Уровень сложности: день ${day} из 7.`;
  //   return this.askAI(prompt);
  // }

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
