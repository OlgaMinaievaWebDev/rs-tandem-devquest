import { createDashboardLayout } from '../../layouts/dashboardLayout';
import { createDashboardHeader } from './dashboardHeader';
import createSidebar from './dashboardSideBar';
import { createDashboardMain } from './dashboardMain';
import '../../../styles/screens/dashboard/dashboardScreen.scss';

export type DashboardScreenProps = {
  onSelectDay: (day: number) => void;
  onSignOut: () => void;
};

export default function renderDashboardScreen({
  onSelectDay,
  onSignOut,
}: DashboardScreenProps): HTMLElement {
  const layout = createDashboardLayout();

  layout.header.replaceChildren(createDashboardHeader({ day: 1, onSignOut }));

  layout.sidebar.replaceChildren(createSidebar());

  layout.main.replaceChildren(
    createDashboardMain({
      onSelectDay,
      currentDay: 1,
      totalDays: 7,
    }),
  );

  return layout.root;
}
