import { AIService, type QuizQuestion } from '../../../services/aiService';
import { eventBus } from '../../../core/EventBus';
import { createButton } from '../../components/button';
import '../../../styles/widgets/quizWidget.scss';
import Loader from '../../components/loader';

export default class QuizWidget {
  private container: HTMLElement;

  private gameId: string;

  private onBack: () => void;

  private questions: QuizQuestion[] = [];

  private currentIndex: number = 0;

  private correctAnswersCount: number = 0;

  private loader: Loader;

  constructor(container: HTMLElement, gameId: string, onBack: () => void) {
    this.container = container;
    this.gameId = gameId;
    this.onBack = onBack;
    this.loader = new Loader();
  }

  public async start(skill: string, day: number) {
    this.container.append(this.loader.getElement());
    this.loader.show('AI Lead is typing your questions...');

    try {
      this.questions = await AIService.getQuizQuestions(skill, day);
      eventBus.emit('TASK_STARTED', { gameId: this.gameId, duration: 60 });
      this.renderCurrentQuestion();
    } catch {
      this.container.innerHTML = '<p>Error loading quiz. Please try again.</p>';

      const back = createButton({
        label: 'Back to Dashboard',
        icon: '←',
        variant: 'terminal',
        className: 'day-main__btn',
        onClick: () => {
          this.onBack();
        },
        ariaLabel: 'Back to dashboard',
      });
      this.container.append(back);
    } finally {
      this.loader.hide();
    }
  }

  private renderCurrentQuestion() {
    this.container.replaceChildren();

    const questionData = this.questions[this.currentIndex];

    const wrapper = document.createElement('div');
    wrapper.className = 'quiz-widget';

    const header = document.createElement('div');
    header.className = 'quiz-widget__header';

    const progress = document.createElement('span');
    progress.className = 'quiz-widget__progress';
    progress.textContent = `Question ${this.currentIndex + 1} of ${this.questions.length}`;

    header.append(progress);

    const questionWrap = document.createElement('div');
    questionWrap.className = 'quiz-widget__wrap';

    const quizRuls = document.createElement('p');
    quizRuls.className = 'quiz-widget__rules';
    quizRuls.textContent =
      'To pass the quiz, you need to answer at least 4 out of 5 questions correctly.';

    const questionText = document.createElement('h3');
    questionText.className = 'quiz-widget__question';
    questionText.textContent = questionData.question;

    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'quiz-widget__options';

    questionData.options.forEach((option) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-widget__option-btn';
      btn.textContent = option;

      btn.addEventListener('click', (event) =>
        this.handleAnswer(option, questionData.correctAnswer, event),
      );

      optionsGrid.append(btn);
    });

    questionWrap.append(quizRuls, questionText, optionsGrid);
    wrapper.append(header, questionWrap);
    this.container.append(wrapper);
  }

  private handleAnswer(selectedOption: string, correctAnswer: string, event: MouseEvent) {
    const clickedBtn = event.currentTarget as HTMLButtonElement;

    const allButtons = this.container.querySelectorAll(
      '.quiz-widget__option-btn',
    ) as NodeListOf<HTMLButtonElement>;
    allButtons.forEach((btn) => {
      btn.disabled = true;
    });
    const isCorrect = selectedOption === correctAnswer;

    if (isCorrect) {
      this.correctAnswersCount += 1;
      clickedBtn.classList.add('quiz-widget__option-btn--correct');
    } else {
      clickedBtn.classList.add('quiz-widget__option-btn--wrong');
      allButtons.forEach((btn) => {
        if (btn.textContent === correctAnswer) {
          btn.classList.add('quiz-widget__option-btn--show-correct');
        }
      });
    }

    setTimeout(() => {
      this.currentIndex += 1;

      if (this.currentIndex >= this.questions.length) {
        this.finishQuiz();
      } else {
        this.renderCurrentQuestion();
      }
    }, 1000);
  }

  private finishQuiz() {
    const isWin = this.correctAnswersCount >= 4;
    const outcome = isWin ? 'correct' : 'wrong';
    const resultMessage = `${this.correctAnswersCount}/${this.questions.length} correct`;

    eventBus.emit('TASK_FINISHED', {
      gameId: this.gameId,
      outcome,
      userAnswer: resultMessage,
    });
  }
}
