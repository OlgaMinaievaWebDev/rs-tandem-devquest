import { createButton } from '../components/button';
import '../../styles/screens/authScreen.scss';

export type AuthScreenHandlers = {
  onSignIn: (email: string, pass: string) => void;
  onSignUp: (name: string, email: string, pass: string, avatar: string) => void;
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
): HTMLDivElement {
  const group = document.createElement('div');
  group.className = 'auth-screen__form-group';

  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = labelText;

  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.name = id;
  input.placeholder = placeholder;
  input.className = 'auth-screen__input';
  input.required = true;
  group.append(label, input);
  return group;
}

export function renderAuthScreen(handlers: AuthScreenHandlers): HTMLElement {
  let isSignUp = false;
  let selectedAvatar = AVATARS[0];

  const screen = document.createElement('section');
  screen.className = 'auth-screen';

  const card = document.createElement('div');
  card.className = 'auth-screen__card';
  screen.appendChild(card);

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

    if (isSignUp) {
      formFields.appendChild(createInputGroup('username', 'USER NAME:', 'text', 'ivan_ivanov'));
    }
    formFields.appendChild(createInputGroup('email', 'EMAIL:', 'email', 'name@example.com'));
    formFields.appendChild(createInputGroup('password', 'PASSWORD:', 'password', ''));

    // --- render avatar picker ---
    if (isSignUp) {
      const avatarPicker = document.createElement('fieldset');
      avatarPicker.className = 'auth-screen__avatar-picker';

      const legend = document.createElement('legend');
      legend.className = 'auth-screen__avatar-title';
      legend.textContent = 'Choose your avatar:';
      avatarPicker.appendChild(legend);

      const avatarButtons: HTMLButtonElement[] = [];

      const avatarlist = document.createElement('div');
      avatarlist.className = 'auth-screen__avatar-list';

      AVATARS.forEach((src) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `auth-screen__avatar-btn ${selectedAvatar === src ? 'is-selected' : ''}`;

        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Avatar';
        img.className = 'auth-screen__avatar-img';

        btn.appendChild(img);
        btn.addEventListener('click', () => {
          selectedAvatar = src;
          avatarButtons.forEach((b) => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
        });

        avatarButtons.push(btn);
        avatarlist.appendChild(btn);
      });
      avatarPicker.appendChild(avatarlist);
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
    formGroupSubmit.appendChild(submitBtn);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const email = String(formData.get('email'));
      const pass = String(formData.get('password'));

      if (isSignUp) {
        const name = String(formData.get('username'));
        handlers.onSignUp(name, email, pass, selectedAvatar);
      } else {
        handlers.onSignIn(email, pass);
      }
    });

    const toggleWrapper = document.createElement('div');
    toggleWrapper.className = 'auth-screen__toggle';

    const toggleText = document.createElement('span');
    toggleText.textContent = isSignUp ? 'Already have an account? ' : "Don't have an account? ";

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'auth-screen__toggle-btn';
    toggleBtn.textContent = isSignUp ? 'Log In' : 'Sign Up';

    toggleBtn.addEventListener('click', () => {
      isSignUp = !isSignUp;
      renderCardContent();
    });

    toggleWrapper.append(toggleText, toggleBtn);
    card.append(header, form, toggleWrapper);
  }

  renderCardContent();
  return screen;
}
