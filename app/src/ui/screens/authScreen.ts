import { createButton } from '../components/button';
import '../../styles/screens/authScreen.scss';
import debounce from '../../utils/debounce';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  type ValidationResult,
} from '../../utils/validation';

export type AuthScreenHandlers = {
  onSignIn: (email: string, pass: string) => Promise<void>;
  onSignUp: (name: string, email: string, pass: string, avatar: string) => Promise<void>;
};

const AVATARS = Object.values(
  import.meta.glob('../../assets/avatars/*.png', {
    eager: true,
    import: 'default',
  }),
) as string[];

function createInputGroup(
  id: string,
  labelText: string,
  type: string,
  placeholder: string,
): {
  group: HTMLDivElement;
  input: HTMLInputElement;
  errorSpan: HTMLSpanElement;
} {
  const group = document.createElement('div');
  group.className = 'auth-screen__form-group';

  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = labelText;

  const groupInp = document.createElement('div');
  groupInp.className = 'auth-screen__input-group-err';

  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.name = id;
  input.placeholder = placeholder;
  input.className = 'auth-screen__input';
  input.required = true;

  const errorSpan = document.createElement('span');
  errorSpan.classList.add('auth-screen__error-text');
  groupInp.append(input, errorSpan);

  group.append(label, groupInp);
  return { group, input, errorSpan };
}

function renderAvatarPicker(
  avatars: string[],
  selectedAvatar: string,
  onSelect: (avatar: string) => void,
): HTMLFieldSetElement {
  const avatarPicker = document.createElement('fieldset');
  avatarPicker.className = 'auth-screen__avatar-picker';

  const legend = document.createElement('legend');
  legend.className = 'auth-screen__avatar-title';
  legend.textContent = 'Choose your avatar:';
  avatarPicker.appendChild(legend);

  const avatarlist = document.createElement('div');
  avatarlist.className = 'auth-screen__avatar-list';

  const avatarButtons: HTMLButtonElement[] = [];

  avatars.forEach((src) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `auth-screen__avatar-btn ${selectedAvatar === src ? 'is-selected' : ''}`;

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Avatar';
    img.className = 'auth-screen__avatar-img';

    btn.appendChild(img);
    btn.addEventListener('click', () => {
      onSelect(src);
      avatarButtons.forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
    });

    avatarButtons.push(btn);
    avatarlist.appendChild(btn);
  });
  avatarPicker.appendChild(avatarlist);
  return avatarPicker;
}

function applyValidation(
  { group, input, errorSpan }: ReturnType<typeof createInputGroup>,
  check: ValidationResult,
) {
  const isTouched = input.dataset.touched === 'true';
  const hasValue = input.value.trim() !== '';

  if (!check.isValid && isTouched && hasValue) {
    group.classList.add('auth-screen__form-group--invalid');
    errorSpan.textContent = check.error;
  } else {
    group.classList.remove('auth-screen__form-group--invalid');
    errorSpan.textContent = '';
  }
}

function createToggleSection(isSignUp: boolean, onToggle: () => void) {
  const toggleWrapper = document.createElement('div');
  toggleWrapper.className = 'auth-screen__toggle';

  const toggleText = document.createElement('span');
  toggleText.textContent = isSignUp ? 'Already have an account? ' : "Don't have an account? ";

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'auth-screen__toggle-btn';
  toggleBtn.textContent = isSignUp ? 'Log In' : 'Sign Up';

  toggleBtn.addEventListener('click', onToggle);
  toggleWrapper.append(toggleText, toggleBtn);

  return toggleWrapper;
}

function setupFormValidation(
  isSignUp: boolean,
  emailField: ReturnType<typeof createInputGroup>,
  passField: ReturnType<typeof createInputGroup>,
  submitBtn: HTMLButtonElement,
  usernameField: ReturnType<typeof createInputGroup> | null,
) {
  const validateForm = () => {
    const emailCheck = validateEmail(emailField.input.value);
    const passCheck = validatePassword(passField.input.value);

    applyValidation(emailField, emailCheck);
    applyValidation(passField, passCheck);

    let isFormValid = emailCheck.isValid && passCheck.isValid;

    if (isSignUp && usernameField) {
      const nameCheck = validateUsername(usernameField.input.value);
      applyValidation(usernameField, nameCheck);
      isFormValid = isFormValid && nameCheck.isValid;
    }

    submitBtn.disabled = !isFormValid;
  };

  const debouncedValidate = debounce(validateForm, 300);

  const markAsTouchedAndValidate = (inputElement: HTMLInputElement) => {
    inputElement.dataset.touched = 'true';
    debouncedValidate();
  };

  ['input', 'change'].forEach((evt) => {
    emailField.input.addEventListener(evt, () => markAsTouchedAndValidate(emailField.input));
    passField.input.addEventListener(evt, () => markAsTouchedAndValidate(passField.input));
    if (usernameField) {
      usernameField.input.addEventListener(evt, () =>
        markAsTouchedAndValidate(usernameField.input),
      );
    }
  });

  return validateForm;
}

export function renderAuthScreen(handlers: AuthScreenHandlers): HTMLElement {
  let isSignUp = false;
  let selectedAvatar = AVATARS[0];
  let isLoading = false;

  const screen = document.createElement('section');
  screen.className = 'auth-screen';

  const card = document.createElement('div');
  card.className = 'auth-screen__card';
  screen.append(card);

  // Login <-> Sign Up
  function renderCardContent() {
    card.replaceChildren();

    const header = document.createElement('h2');
    header.className = 'auth-screen__header';
    header.textContent = isSignUp ? 'DEVQUEST SIGN UP' : 'DEVQUEST LOGIN';

    const form = document.createElement('form');
    form.className = 'auth-screen__form';

    const formFields = document.createElement('div');
    formFields.className = 'auth-screen__form-fields';
    form.appendChild(formFields);

    let usernameField: ReturnType<typeof createInputGroup> | null = null;

    if (isSignUp) {
      usernameField = createInputGroup('username', 'USER NAME:', 'text', 'ivan_ivanov');
      formFields.appendChild(usernameField.group);
    }
    const emailField = createInputGroup('email', 'EMAIL:', 'email', 'name@example.com');
    const passField = createInputGroup('password', 'PASSWORD:', 'password', '••••••');
    formFields.append(emailField.group, passField.group);

    // --- render avatar picker ---
    if (isSignUp) {
      const avatarPicker = renderAvatarPicker(AVATARS, selectedAvatar, (avatar) => {
        selectedAvatar = avatar;
      });
      formFields.appendChild(avatarPicker);
    }

    const formGroupSubmit = document.createElement('div');
    formGroupSubmit.className = 'auth-screen__form-submit';
    form.appendChild(formGroupSubmit);

    const submitBtn = createButton({
      label: isSignUp ? 'SIGN UP' : 'SIGN IN',
      variant: 'terminal',
      onClick: () => {},
    });
    submitBtn.type = 'submit';
    submitBtn.classList.add('auth-screen__submit-btn');
    submitBtn.disabled = true;
    formGroupSubmit.append(submitBtn);

    const runValidation = setupFormValidation(
      isSignUp,
      emailField,
      passField,
      submitBtn,
      usernameField,
    );

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (isLoading) return;

      isLoading = true;
      submitBtn.disabled = true;

      const formData = new FormData(form);
      const email = String(formData.get('email'));
      const pass = String(formData.get('password'));

      try {
        if (isSignUp) {
          const name = String(formData.get('username'));
          await handlers.onSignUp(name, email, pass, selectedAvatar);
        } else {
          await handlers.onSignIn(email, pass);
        }
      } finally {
        isLoading = false;
        runValidation();
      }
    });

    const toggleWrapper = createToggleSection(isSignUp, () => {
      isSignUp = !isSignUp;
      renderCardContent();
    });

    card.append(header, form, toggleWrapper);
  }

  renderCardContent();
  return screen;
}
