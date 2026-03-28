import { createDashboardLayout } from '../../layouts/dashboardLayout';
import { createDashboardHeader } from '../dashboard/dashboardHeader';
import createSidebar from '../dashboard/dashboardSideBar';
import { createDayMain } from './dayMain';

import '../../../styles/screens/day/dayScreen.scss';

export type DayScreenProps = {
  day: number;
  onBackToDashboard: () => void;
  onSignOut: () => void;
};

export default function renderDayScreen({
  day,
  onBackToDashboard,
  onSignOut,
}: DayScreenProps): HTMLElement {
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

  layout.main.replaceChildren(
    createDayMain({
      day,
      onBackToDashboard,
    }),
  );

  return layout.root;
}
