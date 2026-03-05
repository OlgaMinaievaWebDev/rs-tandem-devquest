import { createDashboardLayout } from '../../layouts/dashboardLayout';
import { createDashboardHeader } from './dashboardHeader';
import createSidebar from './dashboardSideBar';
import '../../../styles/screens/dashboard/dashboardScreen.scss';

export default function renderDashboardScreen(): HTMLElement {
  const layout = createDashboardLayout();

  // header
  layout.header.replaceChildren(createDashboardHeader({ day: 1 }));

  // temp sidebar
  layout.sidebar.replaceChildren(createSidebar());

  // temp main
  const m = document.createElement('section');
  m.textContent = 'Games / Days list (later)';
  layout.main.append(m);

  return layout.root;
}
