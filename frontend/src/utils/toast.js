/**
 * Minimal non-blocking toast notification helper.
 * Creates a temporary DOM element, shows it for a few seconds, then removes it.
 */
export function showToast(message, type = 'info') {
  if (typeof document === 'undefined') return;

  const el = document.createElement('div');
  el.textContent = message;
  el.style.position = 'fixed';
  el.style.bottom = '24px';
  el.style.left = '50%';
  el.style.transform = 'translateX(-50%)';
  el.style.zIndex = '9999';
  el.style.padding = '12px 24px';
  el.style.borderRadius = '8px';
  el.style.fontSize = '14px';
  el.style.fontWeight = '500';
  el.style.color = '#fff';
  el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  el.style.transition = 'opacity 0.3s ease';
  el.style.opacity = '0';

  if (type === 'error') {
    el.style.background = '#ef4444';
  } else if (type === 'success') {
    el.style.background = '#22c55e';
  } else {
    el.style.background = '#3b82f6';
  }

  document.body.appendChild(el);

  // Trigger reflow for transition
  void el.offsetWidth;
  el.style.opacity = '1';

  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  }, 3000);
}
