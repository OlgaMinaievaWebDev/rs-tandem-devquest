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
      const randomIndex = Math.floor(Math.random() * CHALLENGES.length);
      // this.challenge = CHALLENGES[randomIndex];

      this.challenge = await AIService.getDebugChallenge(this.day);

      console.log(this.challenge);

      this.challengeElementsAmount = this.challenge.expectedOutputs.length;

      this.shuffledOutputs = [...this.challenge.expectedOutputs].sort(() => Math.random() - 0.5);
      this.playerOrder = [];

      eventBus.emit('TASK_STARTED', { gameId: this.gameId, duration: 1180 });

      this.render();
    } catch (e) {
      showError(getErrorMessage(e, 'Failed to create a debug challenge'));
    } finally {
      this.loader.hide();
    }
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

    console.log(outcome, answerString);

    console.log(outcome, answerString);
    eventBus.emit('TASK_FINISHED', {
      gameId: this.gameId,
      outcome,
      userAnswer: answerString,
    });
  }
}
