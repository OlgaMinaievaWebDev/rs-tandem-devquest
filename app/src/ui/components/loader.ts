import '../../styles/components/loader.scss';

export class Loader {
  private element: HTMLElement;
  private messageElement: HTMLElement;
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('loader__container', 'loader__container--hidden');

    this.messageElement = document.createElement('div');
    this.messageElement.classList.add('loader__message');

    const wrap = document.createElement('div');
    wrap.classList.add('loader__wrapp');
    const spinner = document.createElement('div');
    spinner.classList.add('loader__spinner');
    wrap.append(spinner, this.messageElement);
    this.element.append(wrap);
  }

  public show(text: string = 'Loading...'): void {
    this.messageElement.textContent = text;
    this.element.classList.remove('loader__container--hidden');
  }

  public hide(): void {
    this.element.classList.add('loader__container--hidden');
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}
