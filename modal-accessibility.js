/**
 * Accessibility helpers for future modal/filter components.
 *
 * - Traps focus while a dialog is open.
 * - Restores focus to the opener when closed.
 * - Enables keyboard navigation for arrow-key based filter lists.
 * - Applies recommended ARIA labels at runtime where needed.
 */

export function getFocusableElements(container) {
  return [...container.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  )].filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
}

export function trapFocus(container, event) {
  if (event.key !== 'Tab') return;

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function handleListArrowNavigation(items, event) {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

  const currentIndex = items.findIndex((item) => item === document.activeElement);
  if (currentIndex === -1) return;

  event.preventDefault();

  if (event.key === 'Home') return items[0].focus();
  if (event.key === 'End') return items[items.length - 1].focus();

  const delta = event.key === 'ArrowDown' ? 1 : -1;
  const nextIndex = (currentIndex + delta + items.length) % items.length;
  items[nextIndex].focus();
}

export function initializeModalAccessibility(modalElement, triggerElement, closeButton) {
  modalElement.setAttribute('role', 'dialog');
  modalElement.setAttribute('aria-modal', 'true');
  modalElement.setAttribute('aria-label', modalElement.getAttribute('aria-label') || 'Filter options');

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      modalElement.hidden = true;
      triggerElement?.focus();
      return;
    }

    trapFocus(modalElement, event);
  };

  modalElement.addEventListener('keydown', onKeyDown);
  closeButton?.addEventListener('click', () => {
    modalElement.hidden = true;
    triggerElement?.focus();
  });

  return () => modalElement.removeEventListener('keydown', onKeyDown);
}
