import '../../../styles/screens/dashboard/dashboardHeader.scss';
import { createButton } from '../../components/button';

export type DashboardHeaderProps = {
  title?: string;
  day: number;
  totalDays?: number;
  onSignOut: () => void;
};

export function createDashboardHeader({
  title = 'DevQuest',
  day,
  totalDays = 7,
  onSignOut,
}: DashboardHeaderProps): HTMLElement {
  const header = document.createElement('div');
  header.className = 'dashboard-header';

  const left = document.createElement('div');
  left.className = 'dashboard-header__left';

  const brand = document.createElement('div');
  brand.className = 'dashboard-header__brand';
  brand.textContent = title;
  left.append(brand);

  const center = document.createElement('div');
  center.className = 'dashboard-header__center';

  const dayText = document.createElement('div');
  dayText.className = 'dashboard-header__day';
  dayText.textContent = `Day ${day} / ${totalDays}`;

  const progress = document.createElement('div');
  progress.className = 'dashboard-header__progress';

  for (let i = 1; i <= totalDays; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'dashboard-header__dot';

    if (i < day) dot.classList.add('is-done');
    if (i === day) dot.classList.add('is-current');

    dot.title = `Day ${i}`;
    progress.append(dot);
  }

  center.append(dayText, progress);

  const right = document.createElement('div');
  right.className = 'dashboard-header__right';

  // signOut btn
  const signOutButton = createButton({
    label: 'Sign out',
    variant: 'danger',
    onClick: () => {
      onSignOut();
    },
  });

  right.append(signOutButton);

  header.append(left, center, right);
  return header;
}
