import '../../../styles/widgets/gamePlayWidget.scss';

import avatarBoss from '../../../assets/system/avatar-boss.png';
import paperPlaneIcon from '../../../assets/icons/paper-plane-icon.svg';
import { store } from '../../../core/store';
import { afterRender, scrollToBottom, shouldScrollToBottom } from '../../../utils/scrollUtils';
import { renderMessageContent } from '../../../utils/renderMessage';
import { eventBus } from '../../../core/EventBus';
import { AIService } from '../../../services/aiService';

export type GamePlayWidgetProps = {
  day: number;
  gameId: 'bugfix' | 'quiz' | 'debug';
  onBack: () => void;
};

export default class GamePlayWidget {
  private container: HTMLElement;
  private gameId: string;
  private day: number;
  private onBack: () => void;

  private messages: Array<{ type: 'boss' | 'user'; content: string }> = [];
  private isTyping = false;

  private chatMessages!: HTMLElement;
  private chatTextArea!: HTMLTextAreaElement;
  private chatSendBtn!: HTMLButtonElement;
  private typingIndicator!: HTMLElement;

  constructor(container: HTMLElement, { day, gameId, onBack }: GamePlayWidgetProps) {
    this.container = container;
    this.day = day;
    this.gameId = gameId;
    this.onBack = onBack;

    this.typingIndicator = this.createTypingIndicator();
  }

  public start(): void {
    this.renderChat();
    this.initEventListeners();

    eventBus.emit('TASK_STARTED', {
      gameId: this.gameId,
      duration: 180,
    });

    this.sendWelcomeMessage();
  }

  private async sendWelcomeMessage() {
    this.showTypingIndicator();

    try {
      const bossData = await AIService.getAILeadResponse(
        this.gameId as 'bugfix' | 'debug',
        this.day,
        "Hello, I'm ready for today's task.",
      );

      console.log(bossData);

      let welcomeText = bossData.seniorLeadResponse;

      if (bossData.codeExample) {
        welcomeText += `\n\n\`\`\`javascript\n${bossData.codeExample}\n\`\`\``;
      }

      this.addMessage('boss', welcomeText);
    } catch (e) {
      this.addMessage(
        'boss',
        `Day ${this.day} — ${this.getGameTitle()}. I'm waiting for your plan.`,
      );
    } finally {
      this.hideTypingIndicator();
    }
  }

  private renderChat(): void {
    this.container.innerHTML = '';

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

    const chatSendBtn = document.createElement('button');
    chatSendBtn.className = 'btn btn--terminal chat__send-btn';

    const sendIcon = document.createElement('img');
    sendIcon.src = paperPlaneIcon;
    sendIcon.className = 'chat__send-btn-icon';
    chatSendBtn.appendChild(sendIcon);

    chatInputArea.append(chatTextArea, chatSendBtn);
    chat.append(chatMessages, chatInputArea);

    this.container.appendChild(chat);

    this.chatMessages = chatMessages;
    this.chatTextArea = chatTextArea;
    this.chatSendBtn = chatSendBtn;

    this.createTypingIndicator();
  }

  createTypingIndicator = (): HTMLElement => {
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
    typingLabel.textContent = 'AI Lead';

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
    typingText.textContent = 'AI Lead is typing';

    typingContent.append(typingDotsContainer);
    typingContent.append(typingText);
    typingBubble.append(typingLabel, typingContent);
    typingIndicator.append(typingAvatar, typingBubble);

    return typingIndicator;
  };

  addMessage = (type: 'boss' | 'user', content: string) => {
    const wasNearBottom = shouldScrollToBottom(this.chatMessages);

    this.messages.push({ type, content });

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
      messageLabel.textContent = 'AI Lead';

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

    this.chatMessages.appendChild(messageDiv);

    const isUserMessage = type === 'user';

    if (isUserMessage) {
      afterRender(() => {
        scrollToBottom(this.chatMessages);
      });
    } else {
      if (wasNearBottom) {
        afterRender(() => {
          scrollToBottom(this.chatMessages);
        });
      }
    }
  };

  showTypingIndicator = () => {
    this.chatMessages.append(this.typingIndicator);

    this.typingIndicator.style.display = 'flex';

    this.isTyping = true;
    this.chatTextArea.disabled = true;
    this.chatSendBtn.disabled = true;

    afterRender(() => {
      scrollToBottom(this.chatMessages);
    });
  };

  hideTypingIndicator = () => {
    this.typingIndicator.style.display = 'none';

    this.isTyping = false;
    this.chatTextArea.disabled = false;
    this.chatSendBtn.disabled = false;

    this.chatTextArea.focus();
  };

  sendMessage = async (): Promise<void> => {
    if (this.isTyping) return;

    const text = this.chatTextArea.value.trim();
    if (!text) return;

    this.addMessage('user', text);
    this.chatTextArea.value = '';

    this.showTypingIndicator();

    try {
      const bossData = await AIService.getAILeadResponse(
        this.gameId as 'bugfix' | 'debug',
        this.day,
        text,
      );

      this.hideTypingIndicator();

      let displayText = bossData.seniorLeadResponse;

      if (bossData.codeExample) {
        displayText += `\n\n\`\`\`javascript\n${bossData.codeExample}\n\`\`\``;
      }

      if (bossData.codeExplanation) {
        displayText += `\n\n${bossData.codeExplanation}`;
      }

      if (bossData.feedback) {
        displayText += `\n\n**Feedback:** ${bossData.feedback}`;
      }

      this.addMessage('boss', displayText);
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('boss', "Sorry, I didn't get that. Can you explain your solution again?");
    }
  };

  initEventListeners = () => {
    this.chatSendBtn.addEventListener('click', () => this.sendMessage());

    this.chatTextArea.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  };

  private getGameTitle(): string {
    switch (this.gameId) {
      case 'bugfix':
        return 'Fix the Bug';
      case 'debug':
        return 'Debug Challenge';
      default:
        return 'Mission';
    }
  }

  public finishTask(outcome: 'correct' | 'wrong' | 'timeout', userAnswer: string = '') {
    eventBus.emit('TASK_FINISHED', {
      gameId: this.gameId,
      outcome,
      userAnswer,
    });
  }

  private addBackButton() {}
}
