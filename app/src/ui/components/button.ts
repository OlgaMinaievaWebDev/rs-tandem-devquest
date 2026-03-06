export type ButtonVariant = 'terminal' | 'danger' | 'warning';

export type ButtonOptions = {
  label: string;
  onClick: (event: MouseEvent) => void;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  icon?: string; // Support for icons/glyphs
};

export function createButton({
  label,
  onClick,
  variant = 'terminal', // Default to game theme
  className = '',
  disabled = false,
  ariaLabel,
  icon,
}: ButtonOptions): HTMLButtonElement {
  const button = document.createElement('button');

  // 1. Setup Standard Attributes
  button.type = 'button';
  button.disabled = disabled;

  // 2. Class Composition (Combines default, variant, and custom classes)
  button.className = `btn btn--${variant} ${className}`.trim();

  // 3. Content Construction (Safe for icons)
  if (icon) {
    const iconSpan = document.createElement('span');
    iconSpan.className = 'btn__icon';
    iconSpan.textContent = icon;
    button.appendChild(iconSpan);
  }

  const textSpan = document.createElement('span');
  textSpan.className = 'btn__label';
  textSpan.textContent = label;
  button.appendChild(textSpan);

  // 4. Accessibility
  if (ariaLabel) {
    button.setAttribute('aria-label', ariaLabel);
  }

  // 5. Event Handling
  button.addEventListener('click', (e) => {
    if (!button.disabled) onClick(e as MouseEvent);
  });

  return button;
}
