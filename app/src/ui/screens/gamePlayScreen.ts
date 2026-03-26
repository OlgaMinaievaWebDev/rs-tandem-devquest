import '../../styles/screens/gamePlayScreen.scss';

import avatarBoss from '../../assets/avatars/avatar-boss.png';
import paperPlaneIcon from '../../assets/icons/paper-plane-icon.svg';
import { store } from '../../core/store';
import { scrollToBottom, shouldScrollToBottom } from '../../utils/scrollUtils';

export type GamePlayScreenProps = {
  day: number;
  gameId: 'bugfix' | 'quiz' | 'debug';
};

export function createGamePlayScreen({ day, gameId }: GamePlayScreenProps): HTMLElement {
  const chat = document.createElement('div');
  chat.className = 'chat';

  const chatMessages = document.createElement('div');
  chatMessages.className = 'chat__messages';

  const chatInputArea = document.createElement('div');
  chatInputArea.className = 'chat__input-area';

  const chatTextArea = document.createElement('textarea');
  chatTextArea.className = 'chat__textarea';
  chatTextArea.placeholder = 'Type your answer or code here... (Ctrl+Enter to send)';
  // TODO: REMOVE (ONLY FOR TESTS)
  chatTextArea.textContent = `Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.`;

  const chatSendBtn = document.createElement('button');
  chatSendBtn.className = 'btn btn--terminal chat__send-btn';

  const chatSendBtnIcon = document.createElement('img');
  chatSendBtnIcon.className = 'chat__send-btn-icon';
  chatSendBtnIcon.src = paperPlaneIcon;

  chatSendBtn.append(chatSendBtnIcon);
  chatInputArea.append(chatTextArea, chatSendBtn);
  chat.append(chatMessages, chatInputArea);

  let messages: Array<{ type: 'boss' | 'user'; content: string }> = [];

  function addMessage(type: 'boss' | 'user', content: string) {
    messages.push({ type, content });

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message--${type}`;

    if (type === 'boss') {
      const messageAvatar = document.createElement('img');
      messageAvatar.className = 'message__avatar';
      messageAvatar.src = avatarBoss;

      const messageBubble = document.createElement('div');
      messageBubble.className = 'message__bubble';

      const messageLabel = document.createElement('span');
      messageLabel.className = 'message__label';
      messageLabel.textContent = 'BOSS';

      const messageContent = document.createElement('div');
      messageContent.className = 'message__content';

      messageContent.textContent = `${content}`;

      messageBubble.append(messageLabel, messageContent);
      messageDiv.append(messageAvatar, messageBubble);
    }

    if (type === 'user') {
      const data = store.getState();
      const userAvatar = data.user?.avatarId;
      const userName = data.user?.name;

      const messageAvatar = document.createElement('img');
      messageAvatar.className = 'message__avatar';

      if (typeof userAvatar === 'string') {
        messageAvatar.src = userAvatar;
      }

      const messageBubble = document.createElement('div');
      messageBubble.className = 'message__bubble';

      const messageLabel = document.createElement('span');
      messageLabel.className = 'message__label';
      messageLabel.textContent = `${userName}`;

      const messageContent = document.createElement('div');
      messageContent.className = 'message__content';

      messageContent.textContent = `${content}`;

      messageBubble.append(messageLabel, messageContent);
      messageDiv.append(messageAvatar, messageBubble);
    }

    chatMessages.appendChild(messageDiv);

    const isUserMessage = type === 'user';
    const isNearBottom = shouldScrollToBottom(chatMessages);

    if (isUserMessage || isNearBottom) {
      scrollToBottom(chatMessages);
    }
  }

  const sendMessage = (): void => {
    const text = chatTextArea.value.trim();
    if (!text) return;

    addMessage('user', text);
    chatTextArea.value = '';

    // Fake AI response for tests
    setTimeout(() => {
      const responses = [
        'Interesting approach. Can you show me the code?',
        'Not bad. But we should also handle the edge case.',
        "Good thinking. Now let's test it.",
        'I like where this is going. Continue.',
      ];

      addMessage('boss', responses[Math.floor(Math.random() * responses.length)]);
    }, 700);
  };

  chatSendBtn.addEventListener('click', sendMessage);

  chatTextArea.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Initial boss message
  setTimeout(() => {
    addMessage(
      'boss',
      `Welcome to Day ${day} — ${getGameTitle(gameId)}.\n Let's begin. What is your first step?`,
    );
  }, 400);

  return chat;
}

function getGameTitle(gameId: string): string {
  switch (gameId) {
    case 'bugfix':
      return 'Fix the Bug';
    case 'quiz':
      return 'JS Quiz';
    case 'debug':
      return 'Debug Challenge';
    default:
      return 'Mission';
  }
}
