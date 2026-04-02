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

  // 2. ПРОВЕРКА ОТВЕТА В ЧАТЕ (Вызывается при каждом ответе пользователя)
  public static async evaluateChatAnswer(
    skill: string,
    question: string,
    userAnswer: string,
  ): Promise<ChatEvaluation> {
    // Здесь промпт динамический! Он включает ответ реального игрока.
    const prompt = `Ты строгий, но справедливый Senior ${skill} Developer. 
    Твой джуниор ответил на вопрос: "${question}". 
    Его ответ: "${userAnswer}".
    Оцени этот ответ. Верни СТРОГО JSON: { "isCorrect": true/false, "feedback": "Твой короткий комментарий и совет" }. Никакого лишнего текста.`;

    return this.askAI(prompt);
  }

  // 3. ГЕНЕРАЦИЯ БАГФИКСА (На будущее)
  public static async getBugfixTask(skill: string, day: number) {
    const prompt = `Ты Senior Developer. Дай задачу на поиск бага для ${skill}... Уровень сложности: день ${day} из 7.`;
    return this.askAI(prompt);
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
