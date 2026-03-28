import '../../../styles/screens/dashboard/dashboardMain.scss';

export type DashboardMainProps = {
  totalDays?: number;
  currentDay?: number;
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
    const isCompleted = day < currentDay;
    const isLocked = day > currentDay;

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'dashboard-main__card';
    if (isCompleted) card.classList.add('dashboard-main__card--completed');
    if (isLocked) card.classList.add('dashboard-main__card--is-locked');

    const label = document.createElement('div');
    label.className = 'dashboard-main__day';
    label.textContent = `Day ${day}`;

    const status = document.createElement('div');
    status.className = 'dashboard-main__status';

    if (isCompleted) {
      status.textContent = `Completed ✅`;
    } else if (isLocked) {
      status.textContent = `Locked 🔒`;
    } else {
      status.textContent = `Start 🚀`;
    }

    card.append(label, status);

    card.addEventListener('click', () => {
      onSelectDay?.(day);
    });

    list.append(card);
  }

  root.append(title, list);
  return root;
}
