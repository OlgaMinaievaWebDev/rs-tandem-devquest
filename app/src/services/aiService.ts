export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export class AIService {
  /**
   * Имитация запроса к LLM.
   * Будущий системный промпт:
   * "Ты Senior Developer. Сгенерируй 5 тестовых вопросов (quiz) для джуниора
   * по специализации {skill}. Уровень сложности: день {day} из 7.
   * Верни ответ СТРОГО в формате JSON: [{ question, options, correctAnswer }]"
   */
  public static async getQuizQuestions(skill: string, day: number): Promise<QuizQuestion[]> {
    // Имитируем ожидание ответа от нейросети (2 секунды)
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    // Моковый JSON, который "вернула" нейросеть
    return [
      {
        question: `[Day ${day}, Skill: ${skill}] What is the primary purpose of a closure in JavaScript?`,
        options: [
          'To close the browser window',
          'To create private variables and functions',
          'To end a loop immediately',
          'To wrap text in HTML tags',
        ],
        correctAnswer: 'To create private variables and functions',
      },
      {
        question: `When should you use '=== ' instead of '=='?`,
        options: [
          'When you want to compare both value and type',
          'When comparing only types',
          'When comparing strings only',
          'You should always use ==',
        ],
        correctAnswer: 'When you want to compare both value and type',
      },
      {
        question: `What does 'NaN' stand for in JavaScript?`,
        options: ['Not a Node', 'Null and Negative', 'Not a Number', 'No action Needed'],
        correctAnswer: 'Not a Number',
      },
      {
        question: `Which method adds one or more elements to the end of an array?`,
        options: ['pop()', 'unshift()', 'push()', 'shift()'],
        correctAnswer: 'push()',
      },
      {
        question: `How do you declare a constant variable in ES6?`,
        options: ['var', 'let', 'constant', 'const'],
        correctAnswer: 'const',
      },
    ];
  }
}
