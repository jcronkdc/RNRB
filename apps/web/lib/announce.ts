/**
 * Announce message via SR-only region (for a11y feedback).
 * Relies on existence of <div id="a11y-announcer" aria-live="polite" class="sr-only" /> in app layout.
 * Falls back to console.info if not found.
 */
export function announce(message: string) {
  const node = document.getElementById('a11y-announcer');
  if (node) {
    node.textContent = '';
    // A tick later, set to trigger region update
    setTimeout(() => {
      node.textContent = message;
    }, 10);
  } else {
    console.info('[announce]', message);
  }
}
