import '../../styles/screens/gamePlayScreen.scss';

import avatarBoss from '../../assets/system/avatar-boss.png';
import paperPlaneIcon from '../../assets/icons/paper-plane-icon.svg';
import { store } from '../../core/store';
import { afterRender, scrollToBottom, shouldScrollToBottom } from '../../utils/scrollUtils';
import { renderMessageContent } from '../../utils/renderMessage';

export type GamePlayScreenProps = {
  day: number;
  gameId: 'bugfix' | 'quiz' | 'debug';
};

const createTypingIndicator = () => {
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message message--boss typing-indicator';
  typingIndicator.style.display = 'none';

  const typingAvatar = document.createElement('img');
  typingAvatar.className = 'message__avatar';
  typingAvatar.src = avatarBoss;

  const typingBubble = document.createElement('div');
  typingBubble.className = 'message__bubble';

  const typingLabel = document.createElement('span');
  typingLabel.className = 'message__label';
  typingLabel.textContent = 'BOSS';

  const typingContent = document.createElement('div');
  typingContent.className = 'message__content typing-content';

  const typingDotsContainer = document.createElement('span');
  typingDotsContainer.className = 'typing-dots';

  Array.from({ length: 3 }, () => {
    const typingDot = document.createElement('span');
    typingDot.className = 'typing-dot';
    typingDotsContainer.append(typingDot);
  });

  const typingText = document.createElement('span');
  typingText.className = 'typing-text';
  typingText.textContent = 'Boss is typing';

  typingContent.append(typingDotsContainer);
  typingContent.append(typingText);
  typingBubble.append(typingLabel, typingContent);
  typingIndicator.append(typingAvatar, typingBubble);

  return typingIndicator;
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
  chatTextArea.placeholder =
    'Type your answer or code here... Use ```js for code blocks (Ctrl+Enter to send)';
  // TODO: REMOVE (ONLY FOR TESTS)
  chatTextArea.textContent = `Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
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

  const addMessage = (type: 'boss' | 'user', content: string) => {
    const wasNearBottom = shouldScrollToBottom(chatMessages);

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

      messageContent.innerHTML = renderMessageContent(content);

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

      messageContent.innerHTML = renderMessageContent(content);

      messageBubble.append(messageLabel, messageContent);
      messageDiv.append(messageAvatar, messageBubble);
    }

    chatMessages.appendChild(messageDiv);

    const isUserMessage = type === 'user';

    if (isUserMessage) {
      afterRender(() => {
        scrollToBottom(chatMessages);
      });
    } else {
      if (wasNearBottom) {
        afterRender(() => {
          scrollToBottom(chatMessages);
        });
      }
    }
  };

  let isTyping = false;

  const typingIndicator = createTypingIndicator();

  const showTypingIndicator = () => {
    chatMessages.append(typingIndicator);

    typingIndicator.style.display = 'flex';

    isTyping = true;
    chatTextArea.disabled = true;
    chatSendBtn.disabled = true;

    afterRender(() => {
      scrollToBottom(chatMessages);
    });
  };

  const hideTypingIndicator = () => {
    typingIndicator.style.display = 'none';

    isTyping = false;
    chatTextArea.disabled = false;
    chatSendBtn.disabled = false;

    chatTextArea.focus();
  };

  const sendMessage = (): void => {
    const text = chatTextArea.value.trim();
    if (!text) return;

    addMessage('user', text);
    chatTextArea.value = '';

    showTypingIndicator();

    // Fake AI response for tests
    setTimeout(() => {
      hideTypingIndicator();

      const responses = [
        `Good start! But we need to handle the edge case when the array is empty.

\`\`\`javascript
function fixArrayBug(items) {
  if (!items || items.length === 0) {
    console.warn('Received empty array');
    return [];
  }

  return items.map(item => {
    if (item.status === 'broken') {
      item.status = 'fixed';
      item.fixedAt = new Date().toISOString();
    }
    return item;
  });
}
\`\`\``,

        `I see an issue with the error handling. Let's improve it:

\`\`\`typescript
function processItems(items: any[]): any[] {
  if (!Array.isArray(items)) {
    throw new Error('Input must be an array');
  }

  return items.map(item => {
    if (item.status === 'broken') {
      item.status = 'fixed';
    }
    return item;
  });
}
\`\`\``,

        `Performance can be improved by filtering broken items first:

\`\`\`javascript
const optimizedFix = (items) =>
  items?.filter(item => item.status === 'broken')
       .map(item => ({ ...item, status: 'fixed', fixedAt: new Date().toISOString() })) || [];
\`\`\``,

        `Here's a cleaner functional approach:

\`\`\`javascript
function fixBug(data) {
  return {
    ...data,
    status: data.status === 'broken' ? 'fixed' : data.status,
    lastUpdated: new Date().toISOString(),
  };
}
\`\`\``,

        `Remember to handle nested structures carefully:

\`\`\`javascript
function deepFix(items) {
  return items.map(item => {
    if (item.status === 'broken') {
      item.status = 'fixed';
    }
    if (item.children) {
      item.children = deepFix(item.children);
    }
    return item;
  });
}
\`\`\``,
      ];

      addMessage('boss', responses[Math.floor(Math.random() * responses.length)]);
    }, 3000);
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
