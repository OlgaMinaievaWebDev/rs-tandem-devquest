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
  btn.className = 'action-menu__item action-menu__item--disabled';

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

function createStatusBar(
  xp: number,
  stress: number,
  stressMax: number,
  health: number,
  authorityMax: number,
): HTMLElement[] {
  const xpContainer = document.createElement('div');
  xpContainer.className = 'sidebar__xp';
  const xpTitle = document.createElement('span');
  xpTitle.className = 'sidebar__xp-title';
  xpTitle.textContent = 'XP:';
  xpContainer.prepend(xpTitle);
  const xpValue = document.createElement('span');
  xpValue.className = 'sidebar__xp-value';
  xpValue.textContent = `${xp}`;
  xpContainer.append(xpTitle, xpValue);

  const stressBar = renderStatusBar('Stress', stress, stressMax, 'stress');
  const authorityBar = renderStatusBar('Authority', health, authorityMax, 'authority');

  return [xpContainer, stressBar, authorityBar];
}

export default function createSidebar(handlers: SidebarHandlers = {}): HTMLElement {
  const { user, game } = store.getState();
  const { day, xp, health, stress } = game;

  const root = document.createElement('div');
  root.className = 'sidebar';

  const header = document.createElement('div');
  header.className = 'sidebar__header';

  const profile = document.createElement('div');
  profile.className = 'sidebar__profile';

  const avatar = document.createElement('img');
  avatar.className = 'sidebar__avatar';
  avatar.src = user?.avatarId ? user.avatarId : 'avatar1.png';
  avatar.alt = 'User Avatar';

  const username = document.createElement('div');
  username.className = 'sidebar__username';
  username.textContent = user?.name || 'Player';

  profile.append(avatar, username);

  const STRESS_MAX = 100;
  const AUTHORITY_MAX = 100;

  const elements = createStatusBar(xp, stress, STRESS_MAX, health, AUTHORITY_MAX);

  const bars = document.createElement('div');
  bars.className = 'sidebar__bars';
  bars.append(...elements);

  const menu = document.createElement('div');
  menu.className = 'action-menu';

  menu.append(
    createActionMenuItem({
      icon: '☕',
      label: 'Coffee Break',
      badge: undefined,
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
      eventBus.emit('RESTART_GAME', { changeView: true });
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

  store.subscribe((state) => {
    const { xp: currentXp, health: currentHealth, stress: currentStress } = state.game;
    const statusElements = createStatusBar(
      currentXp,
      currentStress,
      STRESS_MAX,
      currentHealth,
      AUTHORITY_MAX,
    );
    bars.replaceChildren(...statusElements);
  });

  return root;
}
