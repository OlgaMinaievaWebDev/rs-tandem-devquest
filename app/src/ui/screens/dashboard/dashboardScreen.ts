import { createDashboardLayout } from '../../layouts/dashboardLayout';
import '../../../styles/screens/dashboard/dashboardScreen.scss';

export default function renderDashboardScreen(): HTMLElement {
  const layout = createDashboardLayout();

  // temp header
  const h = document.createElement('div');
  h.textContent = 'DevQuest — Dashboard';
  layout.header.append(h);

  // temp sidebar
  const s = document.createElement('nav');
  s.textContent = 'Menu (later)';
  layout.sidebar.textContent = '';
  layout.sidebar.append(s);

  // temp main
  const m = document.createElement('section');
  m.textContent = 'Games / Days list (later)';
  layout.main.append(m);

  return layout.root;
}
