import * as React from "react";

export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean) {
  React.useEffect(() => {
    if (!active || !ref.current) return;
    const node = ref.current;
    const focusable = node.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Tab" || focusable.length === 0) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [active, ref]);
}
