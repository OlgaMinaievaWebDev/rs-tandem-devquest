import '../../styles/screens/gamePlayScreen.scss';

import avatarBoss from '../../assets/avatars/avatar-boss.png';
import paperPlaneIcon from '../../assets/icons/paper-plane-icon.svg';

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

  const messagesArea = chat.querySelector('.chat__messages') as HTMLDivElement;
  const textarea = chat.querySelector('.chat__textarea') as HTMLTextAreaElement;
  const sendBtn = chat.querySelector('.chat__send-btn') as HTMLButtonElement;

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
      // TODO: Get data from storage
      const data = JSON.parse(localStorage.getItem('sb-hfetbhicznyhfynbgseh-auth-token') as any);
      const userAvatar = data.user.user_metadata.avatar;
      const userName = data.user.user_metadata.name;

      const messageAvatar = document.createElement('img');
      messageAvatar.className = 'message__avatar';
      messageAvatar.src = userAvatar;

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

    messagesArea.appendChild(messageDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function sendMessage() {
    const text = textarea.value.trim();
    if (!text) return;

    addMessage('user', text);
    textarea.value = '';

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
  }

  sendBtn.addEventListener('click', sendMessage);

  textarea.addEventListener('keydown', (e) => {
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
