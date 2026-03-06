import '../../../styles/screens/dashboard/dashboardMain.scss';

export type DashboardMainProps = {
  totalDays?: number;
  currentDay?: number; // used for lock/unlock UI
  onSelectDay?: (day: number) => void;
};

export function createDashboardMain({
  totalDays = 7,
  currentDay = 1,
  onSelectDay,
}: DashboardMainProps = {}): HTMLElement {
  const root = document.createElement('section');
  root.className = 'dashboard-main';

  const title = document.createElement('h2');
  title.className = 'dashboard-main__title';
  title.textContent = 'Your Week';

  const list = document.createElement('div');
  list.className = 'dashboard-main__grid';

  for (let day = 1; day <= totalDays; day += 1) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'dashboard-main__card';

    const locked = day > currentDay;
    if (locked) card.classList.add('is-locked');

    card.disabled = locked;

    const label = document.createElement('div');
    label.className = 'dashboard-main__day';
    label.textContent = `Day ${day}`;

    const status = document.createElement('div');
    status.className = 'dashboard-main__status';
    status.textContent = locked ? 'Locked' : 'Start';

    card.append(label, status);

    card.addEventListener('click', () => {
      onSelectDay?.(day);
    });

    list.append(card);
  }

  root.append(title, list);
  return root;
}
