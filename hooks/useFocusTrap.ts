import { useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const useFocusTrap = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const trapRef = ref.current;
    if (!trapRef) return;

    const focusableElements = Array.from(
      trapRef.querySelectorAll(FOCUSABLE_ELEMENTS)
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Automatically focus the first element when the trap activates
    firstElement.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };

    trapRef.addEventListener('keydown', handleKeyDown);

    return () => {
      trapRef.removeEventListener('keydown', handleKeyDown);
    };
  // CRITICAL FIX: Changed dependency array from [ref.current] to [].
  // The effect should only run once when the component mounts.
  // A ref change doesn't trigger re-renders, so the previous dependency
  // was ineffective and incorrect. This ensures stable and predictable behavior.
  }, []); 

  return ref;
};