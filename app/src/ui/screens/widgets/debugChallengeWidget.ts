import { eventBus } from '../../../core/EventBus';
import { createButton } from '../../components/button';
import '../../../styles/widgets/debugChallengeWidget.scss';

interface DebugChallenge {
  description: string;
  codeSnippet: string;
  expectedOutputs: string[];
}

const CHALLENGES: DebugChallenge[] = [
  {
    description: 'A mix of sync, microtask, and macrotask logs.',
    codeSnippet: `
console.log('Start');

setTimeout(() => console.log('Timeout'), 0);

Promise.resolve().then(() => console.log('Promise'));

console.log('End');
    `.trim(),
    expectedOutputs: ['Start', 'End', 'Promise', 'Timeout'],
  },
  {
    description: 'Nested promises and multiple timeouts.',
    codeSnippet: `
console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve()
  .then(() => {
    console.log('C');
    return Promise.resolve();
  })
  .then(() => console.log('D'));

console.log('E');
    `.trim(),
    expectedOutputs: ['A', 'E', 'C', 'D', 'B'],
  },
];

export default class DebugChallengeWidget {
  private container: HTMLElement;
  private gameId: string;
  private day: number;

  private challenge!: DebugChallenge;
  private shuffledOutputs: string[] = [];
  private playerOrder: string[] = [];

  private dropZone: HTMLElement | undefined;
  private dropItems: HTMLElement[] | undefined;

  constructor(container: HTMLElement, gameId: string, day: number) {
    this.container = container;
    this.gameId = gameId;
    this.day = day;

    this.dropItems = [];
  }

  public start(): void {
    const randomIndex = Math.floor(Math.random() * CHALLENGES.length);
    this.challenge = CHALLENGES[randomIndex];
    this.shuffledOutputs = [...this.challenge.expectedOutputs].sort(() => Math.random() - 0.5);
    this.playerOrder = [];

    eventBus.emit('TASK_STARTED', { gameId: this.gameId, duration: 180 });

    this.render();
  }

  private render(): void {
    const wrapper = document.createElement('div');
    wrapper.className = 'debug-challenge';

    const desc = document.createElement('p');
    desc.className = 'debug-challenge__desc';
    desc.textContent = this.challenge.description;
    wrapper.appendChild(desc);

    const codeBlock = document.createElement('pre');
    codeBlock.className = 'debug-challenge__code';
    codeBlock.textContent = this.challenge.codeSnippet;
    wrapper.appendChild(codeBlock);

    const instruction = document.createElement('p');
    instruction.className = 'debug-challenge__instruction';
    instruction.textContent = 'Drag the console outputs into the correct order (top = first)';
    wrapper.appendChild(instruction);

    this.dropZone = document.createElement('ol');
    this.dropZone.className = 'debug-challenge__dropzone';
    this.dropZone.id = 'debug-dropzone';
    wrapper.appendChild(this.dropZone);

    const dragContainer = document.createElement('div');
    dragContainer.className = 'debug-challenge__drag-items';

    this.shuffledOutputs.forEach((text) => {
      const item = this.createDraggableItem(text);

      dragContainer.appendChild(item);

      if (typeof this.dropItems !== 'undefined') {
        this.dropItems.push(item);
      }
    });
    wrapper.appendChild(dragContainer);

    const submitBtn = createButton({
      label: 'Submit Order',
      onClick: () => this.evaluate(),
    });
    wrapper.appendChild(submitBtn);

    this.container.appendChild(wrapper);
    this.setupDragAndDrop();
  }

  private createDraggableItem(text: string): HTMLElement {
    const div = document.createElement('div');
    div.className = 'debug-challenge__drag-item';
    div.textContent = text;
    div.setAttribute('draggable', 'true');
    div.setAttribute('data-value', text);
    return div;
  }

  private setupDragAndDrop(): void {
    // const items = document.querySelectorAll('.debug-challenge__drag-item');

    console.log(this.dropItems);

    if (typeof this.dropItems === 'undefined') return;

    this.dropItems.forEach((item) => {
      item.addEventListener('dragstart', (e) => {
        const dt = (e as DragEvent).dataTransfer;
        dt?.setData('text/plain', (item as HTMLElement).dataset.value || '');
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });

    console.log(this.dropZone);

    if (typeof this.dropZone === 'undefined') return;

    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();

      if (typeof this.dropZone === 'undefined') return;

      this.dropZone.classList.add('drag-over');
    });
    this.dropZone.addEventListener('dragleave', () => {
      if (typeof this.dropZone === 'undefined') return;

      this.dropZone.classList.remove('drag-over');
    });
    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (typeof this.dropZone === 'undefined') return;

      this.dropZone.classList.remove('drag-over');
      const value = (e as DragEvent).dataTransfer?.getData('text/plain');
      if (!value) return;

      // Add to player order and create a placeholder in drop zone
      this.playerOrder.push(value);
      const li = document.createElement('li');
      li.textContent = value;
      li.className = 'debug-challenge__drop-item';
      this.dropZone.appendChild(li);

      // Remove the draggable item from the pool
      // const source = Array.from(items).find((el) => (el as HTMLElement).dataset.value === value);
      // if (source) source.remove();

      // If all items used, disable further drops (optional)
      if (this.playerOrder.length === this.challenge.expectedOutputs.length) {
        this.dropZone.removeEventListener('dragover', () => {});
      }
    });
  }

  private evaluate(): void {
    const isCorrect =
      this.playerOrder.length === this.challenge.expectedOutputs.length &&
      this.playerOrder.every((val, idx) => val === this.challenge.expectedOutputs[idx]);

    const outcome = isCorrect ? 'correct' : 'wrong';
    const answerString = this.playerOrder.join(' → ');

    eventBus.emit('TASK_FINISHED', {
      gameId: this.gameId,
      outcome,
      userAnswer: answerString,
    });
  }
}
