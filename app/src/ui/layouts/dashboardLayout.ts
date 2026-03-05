export type DashboardLayout = {
  root: HTMLElement;
  header: HTMLElement;
  main: HTMLElement;
  sidebar: HTMLElement;
};

export function createDashboardLayout(): DashboardLayout {
  const root = document.createElement('div');
  root.className = 'dashboard';

  const header = document.createElement('header');
  header.className = 'dashboard__header';

  const main = document.createElement('main');
  main.className = 'dashboard__main';

  const sidebar = document.createElement('aside');
  sidebar.className = 'dashboard__sidebar';
  sidebar.textContent = 'Sidebar (later)';

  root.append(header, main, sidebar);

  return { root, header, main, sidebar };
}
