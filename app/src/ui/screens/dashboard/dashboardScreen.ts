import { createDashboardLayout } from '../../layouts/dashboardLayout';
import { createDashboardHeader } from './dashboardHeader';
import createSidebar from './dashboardSideBar';
import { createDashboardMain } from './dashboardMain';
import '../../../styles/screens/dashboard/dashboardScreen.scss';

export type DashboardScreenProps = {
  currentDay: number;
  onSelectDay: (day: number) => void;
  onSignOut: () => void;
};

export default function renderDashboardScreen({
  currentDay,
  onSelectDay,
  onSignOut,
}: DashboardScreenProps): HTMLElement {
  const layout = createDashboardLayout();

  layout.header.replaceChildren(createDashboardHeader({ day: currentDay, onSignOut }));

  layout.sidebar.replaceChildren(createSidebar());

  layout.main.replaceChildren(
    createDashboardMain({
      onSelectDay,
      currentDay,
      totalDays: 7,
    }),
  );

  return layout.root;
}
