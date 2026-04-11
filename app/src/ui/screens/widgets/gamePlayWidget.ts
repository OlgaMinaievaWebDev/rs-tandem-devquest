import '../../../styles/widgets/gamePlayWidget.scss';

import avatarBoss from '../../../assets/system/avatar-boss.png';
import paperPlaneIcon from '../../../assets/icons/paper-plane-icon.svg';
import { store } from '../../../core/store';
import { afterRender, scrollToBottom, shouldScrollToBottom } from '../../../utils/scrollUtils';
import renderMessageContent from '../../../utils/renderMessage';
import { eventBus } from '../../../core/EventBus';
import { AIService, type BugfixTask } from '../../../services/aiService';
import { showError } from '../../components/toast';

export type GamePlayWidgetProps = {
  day: number;
  gameId: 'bugfix' | 'quiz' | 'debug';
};

export default class GamePlayWidget {
  private container: HTMLElement;

  private gameId: string;

  private day: number;

  private messages: Array<{ type: 'boss' | 'user'; content: string }> = [];

  private isTyping = false;

  private chatMessages!: HTMLElement;

  private chatTextArea!: HTMLTextAreaElement;

  private chatSendBtn!: HTMLButtonElement;

  private typingIndicator!: HTMLElement;

  private bugfixTask: BugfixTask | null = null;

  private isWaitingForBugfixAnswer: boolean = false;

  constructor(container: HTMLElement, { day, gameId }: GamePlayWidgetProps) {
    this.container = container;
    this.day = day;
    this.gameId = gameId;

    this.typingIndicator = this.createTypingIndicator();
  }

  public start(): void {
    this.renderChat();
    this.initEventListeners();

    eventBus.emit('TASK_STARTED', {
      gameId: this.gameId,
      duration: 180,
    });

    this.fetchBugfixTask();
  }

  private async fetchBugfixTask() {
    this.showTypingIndicator();

    try {
      const state = store.getState();
      const skill = state.game.selectedSkills[0] || 'JavaScript';
      const task = await AIService.getBugfixTask(this.day, skill);
      this.bugfixTask = task;
      this.isWaitingForBugfixAnswer = true;

      let display = `**🐞 Bug Fix Challenge – Day ${this.day}**\n\n`;
      display += `*${task.description}*\n\n`;
      display += `**Buggy Code:**\n\`\`\`javascript\n${task.buggyCode}\n\`\`\``;
      if (task.hint) {
        display += `\n\n*Hint: ${task.hint}*`;
      }
      display += `\n\nPlease provide the corrected code or explain the fix.`;

      this.addMessage('boss', display);
    } catch (error) {
      console.error('Failed to fetch bugfix task:', error);
      this.addMessage('boss', '⚠️ Unable to generate a task. Please try again.');
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

      return typingDot;
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
    } else if (wasNearBottom) {
      afterRender(() => {
        scrollToBottom(this.chatMessages);
      });
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

    if (this.gameId === 'bugfix' && this.isWaitingForBugfixAnswer && this.bugfixTask) {
      this.isWaitingForBugfixAnswer = false;
      this.showTypingIndicator();

      try {
        const evaluation = await AIService.evaluateBugfixAnswer(this.bugfixTask, text);
        this.hideTypingIndicator();

        let feedbackMessage = evaluation.feedback;
        if (evaluation.isCorrect) {
          feedbackMessage += `\n\n✅ **Well done!** The bug has been fixed.`;
          this.addMessage('boss', feedbackMessage);
          this.finishTask('correct', text);
        } else {
          feedbackMessage += `\n\n❌ Not quite right. Review the feedback and try again.`;
          this.addMessage('boss', feedbackMessage);
          this.isWaitingForBugfixAnswer = true;
        }
      } catch (error) {
        this.hideTypingIndicator();
        this.addMessage('boss', "Sorry, I couldn't evaluate your answer. Please try again.");
        this.isWaitingForBugfixAnswer = true;
        if (typeof error === 'string') {
          showError(error);
        }
      }
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

  public finishTask(outcome: 'correct' | 'wrong' | 'timeout', userAnswer: string = '') {
    eventBus.emit('TASK_FINISHED', {
      gameId: this.gameId,
      outcome,
      userAnswer,
    });
  }
}
