import '../../styles/components/toast.scss';
import successSvg from '../../assets/icons/success.svg';
import warningSvg from '../../assets/icons/warning.svg';

export type ToastType = 'error' | 'success';

let toastContainer: HTMLDivElement | null = null;

function createToastContainer() {
  if (toastContainer) return toastContainer;

  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  return toastContainer;
}

function dismissToast(toast: HTMLDivElement) {
  toast.classList.remove('toast--visible');
  toast.addEventListener(
    'transitionend',
    () => {
      toast.remove();
      if (toastContainer && toastContainer.children.length === 0) {
        toastContainer.remove();
        toastContainer = null;
      }
    },
    { once: true },
  );
}

export function showToast(
  message: string,
  type: ToastType = 'error',
  duration: number = 3000,
): void {
  const container = createToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const content = document.createElement('div');
  content.className = 'toast__content';

  const icon = document.createElement('img');
  icon.className = 'toast__icon';
  icon.src = type === 'success' ? successSvg : warningSvg;

  const text = document.createElement('span');
  text.className = 'toast__message';
  text.textContent = message;

  content.append(icon, text);
  toast.appendChild(content);

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('toast--visible');
  });

  const timeoutId = setTimeout(() => {
    dismissToast(toast);
  }, duration);

  toast.addEventListener('click', () => {
    clearTimeout(timeoutId);
    dismissToast(toast);
  });
}

export const showError = (message: string) => showToast(message, 'error');
export const showSuccess = (message: string) => showToast(message, 'success');
