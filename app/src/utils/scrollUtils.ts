export const shouldScrollToBottom = (element: HTMLElement, threshold: number = 150): boolean => {
  return element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
};

export const scrollToBottom = (
  element: HTMLElement,
  smooth: boolean = true,
  delay: number = 10,
): void => {
  setTimeout(() => {
    requestAnimationFrame(() => {
      const targetScroll = element.scrollHeight;

      if (smooth) {
        element.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      } else {
        element.scrollTop = targetScroll;
      }
    });
  }, delay);
};
