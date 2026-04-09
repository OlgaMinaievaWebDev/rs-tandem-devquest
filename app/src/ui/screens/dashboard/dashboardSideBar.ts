import { renderStatusBar } from '../../components/statusBar';
import '../../../styles/screens/dashboard/dashboardSideBar.scss';
import TimerWidget from '../../components/timerWidget';
import { eventBus } from '../../../core/EventBus';
import { createButton } from '../../components/button';
import { store } from '../../../core/store';

export const sidebarTimer = new TimerWidget();

export type SidebarHandlers = {
  onCoffeeBreak?: () => void;
  onSmokeBreak?: () => void;
  onLunchBreak?: () => void;
  onHelp?: () => void;
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

  const header = document.createElement('div');
  header.className = 'sidebar__header';

  const state = store.getState();
  const { day, xp, health, stress } = state.game;

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
  const stressMax = 100;
  const authorityMax = 10;

  const bars = document.createElement('div');
  bars.className = 'sidebar__bars';
  bars.append(
    renderStatusBar('Stress', stress, stressMax, 'stress'),
    renderStatusBar('Authority', health, authorityMax, 'authority'),
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
  header.append(profile, bars, sidebarTimer.getElement(), menu);

  const footer = document.createElement('div');
  footer.className = 'sidebar__footer';

  const restartButton = createButton({
    label: 'Restart Game',
    variant: 'terminal',
    onClick: () => {
      eventBus.emit('RESTART_GAME', undefined);
    },
  });

  const isGameFresh = day === 1 && xp === 0 && health === 100 && stress === 0;
  if (isGameFresh) {
    restartButton.disabled = true;
    restartButton.title = "You haven't played yet!";
  } else {
    restartButton.disabled = false;
    restartButton.title = 'Start over from Day 1';
  }

  footer.append(restartButton);
  root.append(header, footer);
  return root;
}
