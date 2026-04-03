import { createDashboardLayout } from '../../layouts/dashboardLayout';
import { createDashboardHeader } from '../dashboard/dashboardHeader';
import createSidebar from '../dashboard/dashboardSideBar';
import QuizWidget from '../widgets/quizWidget';
import GamePlayWidget from '../widgets/gamePlayWidget';
import { eventBus } from '../../../core/EventBus';

export type GameScreenProps = {
  day: number;
  gameId: string;
  skill: string;
  onBack: () => void;
  onSignOut: () => void;
};

export default function renderGameScreen({
  day,
  gameId,
  skill,
  onBack,
  onSignOut,
}: GameScreenProps): HTMLElement {
  const layout = createDashboardLayout();

  layout.header.replaceChildren(
    createDashboardHeader({ day, totalDays: 7, title: 'DevQuest', onSignOut }),
  );

  layout.sidebar.replaceChildren(
    createSidebar({
      onHelp: () => {},
      onCoffeeBreak: () => {},
      onLunchBreak: () => {},
      onSmokeBreak: () => {},
    }),
  );

  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'game-widget-container';

  if (gameId === 'quiz') {
    const quiz = new QuizWidget(widgetContainer, gameId, onBack);
    quiz.start(skill, day);
  } else if (gameId === 'bugfix' || gameId === 'debug') {
    const gameWidget = new GamePlayWidget(widgetContainer, {
      day,
      gameId: gameId as 'bugfix' | 'debug',
      onBack,
    });
    gameWidget.start();
  } else {
    widgetContainer.innerHTML = `<h2 style="color:white">Game ${gameId} is under construction!</h2>`;
  }

  layout.main.replaceChildren(widgetContainer);

  return layout.root;
}
