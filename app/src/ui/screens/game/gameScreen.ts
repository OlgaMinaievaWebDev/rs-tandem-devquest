import { createDashboardLayout } from '../../layouts/dashboardLayout';
import { createDashboardHeader } from '../dashboard/dashboardHeader';
import createSidebar from '../dashboard/dashboardSideBar';
import QuizWidget from '../widgets/quizWidget';
import GamePlayWidget from '../widgets/gamePlayWidget';
import { eventBus } from '../../../core/EventBus';
import DebugChallengeWidget from '../widgets/debugChallengeWidget';

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
  } else if (gameId === 'bugfix') {
    const gameWidget = new GamePlayWidget(widgetContainer, {
      day,
      gameId: gameId as 'bugfix',
    });
    gameWidget.start();
  } else if (gameId === 'debug') {
    const debugWidget = new DebugChallengeWidget(widgetContainer, gameId, day);
    debugWidget.start();
  } else {
  }

  layout.main.replaceChildren(widgetContainer);

  return layout.root;
}
