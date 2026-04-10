export const shouldScrollToBottom = (element: HTMLElement, threshold: number = 150): boolean => {
  const { scrollHeight, scrollTop, clientHeight } = element;

  return scrollHeight - scrollTop - clientHeight < threshold;
};

let scheduled = false;

export const scrollToBottom = (container: HTMLElement, smooth: boolean = true): void => {
  if (scheduled) return;
  scheduled = true;

  requestAnimationFrame(() => {
    if (smooth) {
      const last = container.lastElementChild as HTMLElement | null;

      if (last) {
        last.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }
    } else {
      container.scrollTop = container.scrollHeight;
    }

    scheduled = false;
  });
};

export const afterRender = (cb: () => void) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
};
