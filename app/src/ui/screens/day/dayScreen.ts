import { createDashboardLayout } from '../../layouts/dashboardLayout';
import { createDashboardHeader } from '../dashboard/dashboardHeader';
import createSidebar from '../dashboard/dashboardSideBar';
import { createDayMain } from './dayMain';

import '../../../styles/screens/day/dayScreen.scss';

export type DayScreenProps = {
  day: number;
  onBackToDashboard: () => void;
};

export default function renderDayScreen({ day, onBackToDashboard }: DayScreenProps): HTMLElement {
  const layout = createDashboardLayout();

  layout.header.replaceChildren(createDashboardHeader({ day, totalDays: 7, title: 'DevQuest' }));

  layout.sidebar.replaceChildren(
    createSidebar({
      onHelp: () => console.log('help'),
      onCoffeeBreak: () => console.log('coffee'),
      onLunchBreak: () => console.log('lunch'),
      onSmokeBreak: () => console.log('smoke'),
    }),
  );

  layout.main.replaceChildren(
    createDayMain({
      day,
      onStartGame: (gameId) => console.log('start', gameId),
      onBackToDashboard,
    }),
  );

  return layout.root;
}
