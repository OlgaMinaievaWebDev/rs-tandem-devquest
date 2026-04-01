import { renderStatusBar } from '../../components/statusBar';
import '../../../styles/screens/dashboard/dashboardSideBar.scss';
import TimerWidget from '../../components/timerWidget';

export const sidebarTimer = new TimerWidget();

export type SidebarHandlers = {
  onCoffeeBreak?: () => void;
  onSmokeBreak?: () => void;
  onLunchBreak?: () => void;
  onHelp?: () => void;
  onRestart?: () => void;
  onLogout?: () => void;
};

type MenuItemConfig = {
  icon: string;
  label: string;
  badge?: number;
  onClick?: () => void;
};

function createActionMenuItem({ icon, label, badge, onClick }: MenuItemConfig): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'action-menu__item';

  const iconEl = document.createElement('span');
  iconEl.className = 'action-menu__icon';
  iconEl.textContent = icon;

  const labelEl = document.createElement('span');
  labelEl.className = 'action-menu__label';
  labelEl.textContent = label;

  btn.append(iconEl, labelEl);

  if (typeof badge === 'number') {
    const badgeEl = document.createElement('span');
    badgeEl.className = 'action-menu__badge';
    badgeEl.textContent = String(badge);
    btn.append(badgeEl);
  }

  btn.addEventListener('click', onClick ?? (() => {}));
  return btn;
}

export default function createSidebar(handlers: SidebarHandlers = {}): HTMLElement {
  const root = document.createElement('div');
  root.className = 'sidebar';

  // ---- Profile (TEMP) ----
  const profile = document.createElement('div');
  profile.className = 'sidebar__profile';

  const avatar = document.createElement('div');
  avatar.className = 'sidebar__avatar';
  avatar.textContent = '👾';

  const username = document.createElement('div');
  username.className = 'sidebar__username';
  username.textContent = 'Player';

  profile.append(avatar, username);

  // ---- Status Bars (TEMP) ----
  const stress = 50;
  const stressMax = 100;

  const authority = 3;
  const authorityMax = 10;

  const bars = document.createElement('div');
  bars.className = 'sidebar__bars';
  bars.append(
    renderStatusBar('Stress', stress, stressMax, 'stress'),
    renderStatusBar('Authority', authority, authorityMax, 'authority'),
  );

  // ---- Action Menu ----
  const menu = document.createElement('div');
  menu.className = 'action-menu';

  menu.append(
    createActionMenuItem({
      icon: '☕',
      label: 'Coffee Break',
      badge: undefined, // later from store
      onClick: handlers.onCoffeeBreak,
    }),
    createActionMenuItem({
      icon: '🚬',
      label: 'Smoke Break',
      badge: undefined,
      onClick: handlers.onSmokeBreak,
    }),
    createActionMenuItem({
      icon: '🍱',
      label: 'Lunch Break',
      badge: undefined,
      onClick: handlers.onLunchBreak,
    }),
    createActionMenuItem({
      icon: '❓',
      label: 'Help',
      onClick: handlers.onHelp,
    }),
  );

  root.append(profile, bars, sidebarTimer.getElement(), menu);
  return root;
}
