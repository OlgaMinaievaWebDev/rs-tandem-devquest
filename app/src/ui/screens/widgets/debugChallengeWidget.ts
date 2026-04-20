import { eventBus } from '../../../core/EventBus';
import { createButton } from '../../components/button';
import '../../../styles/widgets/debugChallengeWidget.scss';

import { AIService } from '../../../services/aiService.ts';
import { showError } from '../../components/toast.ts';
import getErrorMessage from '../../../utils/getErrorMessage.ts';
import Loader from '../../components/loader.ts';

export interface DebugChallenge {
  description: string;
  codeSnippet: string;
  expectedOutputs: string[];
}

const CHALLENGES: DebugChallenge[] = [
  {
    description:
      'Basic event loop order: synchronous code, Promise microtask, setTimeout macrotask.',
    codeSnippet: `
console.log('Start');
setTimeout(() => console.log('Timeout'), 0);
Promise.resolve().then(() => console.log('Promise'));
console.log('End');
    `.trim(),
    expectedOutputs: ['Start', 'End', 'Promise', 'Timeout'],
  },
  {
    description:
      'Two Promise microtasks execute before any macrotask, even if macrotask is queued first.',
    codeSnippet: `
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
Promise.resolve().then(() => console.log('D'));
console.log('E');
    `.trim(),
    expectedOutputs: ['A', 'E', 'C', 'D', 'B'],
  },
  {
    description:
      'A Promise created inside a setTimeout – the microtask runs before the next macrotask, but after current macrotask completes.',
    codeSnippet: `
console.log('1');
setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
}, 0);
Promise.resolve().then(() => console.log('4'));
console.log('5');
    `.trim(),
    expectedOutputs: ['1', '5', '4', '2', '3'],
  },
  {
    description:
      'setTimeout with delay 0 vs 100ms – order respects the timer delay (0ms runs first, then 100ms).',
    codeSnippet: `
console.log('Start');
setTimeout(() => console.log('Fast'), 0);
setTimeout(() => console.log('Slow'), 100);
Promise.resolve().then(() => console.log('Micro'));
console.log('End');
    `.trim(),
    expectedOutputs: ['Start', 'End', 'Micro', 'Fast', 'Slow'],
  },
  {
    description:
      'async/await behaves like Promise.then – await suspends the async function but the microtask is queued immediately.',
    codeSnippet: `
console.log('A');
async function test() {
  console.log('B');
  await Promise.resolve();
  console.log('C');
}
test();
setTimeout(() => console.log('D'), 0);
console.log('E');
    `.trim(),
    expectedOutputs: ['A', 'B', 'E', 'C', 'D'],
  },
  {
    description:
      'Complex nesting: a macrotask that spawns a microtask, and a microtask that spawns a macrotask. Order follows event loop phases.',
    codeSnippet: `
console.log('1');
setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
}, 0);
Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => console.log('5'), 0);
});
console.log('6');
    `.trim(),
    expectedOutputs: ['1', '6', '4', '2', '3', '5'],
  },
  {
    description:
      'Event loop edge cases: queueMicrotask, rejected Promise with .catch, and a recursive microtask that defers a macrotask.',
    codeSnippet: `
console.log('Start');
setTimeout(() => console.log('Timeout'), 0);
queueMicrotask(() => console.log('Microtask'));
Promise.reject('Reject').catch(() => console.log('Catch'));
(async () => {
  console.log('Async start');
  await null;
  console.log('Async end');
})();
console.log('End');
    `.trim(),
    expectedOutputs: ['Start', 'Async start', 'End', 'Microtask', 'Catch', 'Async end', 'Timeout'],
  },
];

export default class DebugChallengeWidget {
  private container: HTMLElement;

  private loader: Loader;

  private gameId: string;

  private day: number;

  private challenge!: DebugChallenge;

  private challengeElementsAmount!: number;

  private shuffledOutputs: string[] = [];

  private playerOrder: string[] = [];

  private dropZone: HTMLElement | undefined;

  private dropItems: HTMLElement[] | undefined;

  private dropZoneCells: HTMLElement[] | undefined;

  constructor(container: HTMLElement, gameId: string, day: number) {
    this.container = container;
    this.gameId = gameId;
    this.day = day;

    this.dropItems = [];
    this.dropZoneCells = [];

    this.loader = new Loader();
  }

  public async start(): Promise<void> {
    this.container.append(this.loader.getElement());
    this.loader.show('AI Lead is creating a debug challenge...');

    try {
      const aiChallenge = await AIService.getDebugChallenge(this.day);

      if (this.isValidChallenge(aiChallenge)) {
        this.challenge = aiChallenge;
      } else {
        showError('Invalid AI response, using fallback challenge');
        this.challenge = this.getFallbackChallenge();
      }
    } catch (e) {
      showError(getErrorMessage(e, 'Failed to create AI challenge, using default'));
      this.challenge = this.getFallbackChallenge();
    } finally {
      this.loader.hide();
    }

    this.challengeElementsAmount = this.challenge.expectedOutputs.length;
    this.shuffledOutputs = [...this.challenge.expectedOutputs].sort(() => Math.random() - 0.5);
    this.playerOrder = [];

    eventBus.emit('TASK_STARTED', { gameId: this.gameId, duration: 1180 });

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

    this.dropZone = document.createElement('div');
    this.dropZone.className = 'debug-challenge__dropzone';
    this.dropZone.id = 'debug-dropzone';
    wrapper.appendChild(this.dropZone);

    Array.from({ length: this.challengeElementsAmount }).forEach((_) => {
      const dropZoneItem = document.createElement('div');
      dropZoneItem.className = 'debug-challenge__dropzone-cell';
      this.dropZoneCells?.push(dropZoneItem);

      this.dropZone?.append(dropZoneItem);
    });

    const dragContainer = document.createElement('div');
    dragContainer.className = 'debug-challenge__drag-items';

    this.shuffledOutputs.forEach((text) => {
      const item = this.createDraggableItem(text);

      dragContainer.appendChild(item);

      this.dropItems?.push(item);
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

  private isValidChallenge(challenge: DebugChallenge) {
    return (
      challenge &&
      typeof challenge.description === 'string' &&
      typeof challenge.codeSnippet === 'string' &&
      Array.isArray(challenge.expectedOutputs) &&
      challenge.expectedOutputs.length > 0 &&
      challenge.expectedOutputs.every((item) => typeof item === 'string')
    );
  }

  private getFallbackChallenge(): DebugChallenge {
    return CHALLENGES[this.day];
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
    let draggedNode: HTMLElement | null = null;
    let draggetNodeParent: HTMLElement | null = null;

    this.dropItems?.forEach((item) => {
      item.addEventListener('dragstart', (e) => {
        draggedNode = item;
        draggetNodeParent = item.parentElement;

        if (e.dataTransfer !== null) {
          e.dataTransfer.setData('text/plain', 'moving');
          e.dataTransfer.effectAllowed = 'move';
        }

        this.dropZoneCells?.forEach((item) => {
          item.classList.add('drop-avaliable');
        });

        item.classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
        this.dropZoneCells?.forEach((item) => {
          item.classList.remove('drop-avaliable');
        });

        item.classList.remove('dragging');
      });
    });

    this.dropZoneCells?.forEach((item) => {
      item.addEventListener('dragover', (e) => {
        e.preventDefault();

        if (e.dataTransfer !== null) {
          e.dataTransfer.dropEffect = 'move';
        }

        if (!item.classList.contains('drag-over')) {
          item?.classList.add('drag-over');
        }
      });

      item.addEventListener('dragleave', (e) => {
        const related = e.relatedTarget as HTMLElement | null;

        if (related && item.contains(related)) {
          return;
        }

        item?.classList.remove('drag-over');
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();

        const existingItem = item.children[0];

        if (existingItem && existingItem !== draggetNodeParent) {
          existingItem.remove();

          draggetNodeParent?.append(existingItem);
        }

        if (draggedNode) {
          item.appendChild(draggedNode);
          item?.classList.remove('drag-over');
          draggedNode = null;
        }
      });
    });
  }

  private evaluate(): void {
    this.dropZoneCells?.forEach((item) => {
      const cellDragItem = item.querySelector('.debug-challenge__drag-item') as HTMLElement;

      const itemValue = cellDragItem?.dataset.value;

      console.log(item, 'item');

      console.log(itemValue);

      if (typeof itemValue === 'string') {
        this.playerOrder.push(itemValue);
      }
    });

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
