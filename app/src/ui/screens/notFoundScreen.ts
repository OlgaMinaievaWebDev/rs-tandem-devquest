import { createButton } from '../components/button';
import '../../styles/screens/notFoundScreen.scss';

type NotFoundScreenProps = {
  onBackHome: () => void;
};

export default function renderNotFoundScreen({ onBackHome }: NotFoundScreenProps): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'not-found-screen';

  const title = document.createElement('h1');
  title.textContent = '404';

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Page not found';

  const backButton = createButton({
    label: 'Go to dashboard',
    onClick: () => onBackHome(),
    variant: 'terminal',
    ariaLabel: 'Go back to dashboard',
    icon: '↩',
    className: 'not-found-screen__button',
  });

  container.append(title, subtitle, backButton);

  return container;
}
