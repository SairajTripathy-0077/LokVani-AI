/**
 * Toast.jsx
 * Self-dismissing toast notification component.
 * Rendered in a fixed portal region at bottom-right of the viewport.
 *
 * Accessibility: Uses aria-live="polite" so screen readers announce the message
 * without interrupting the current reading flow.
 *
 * Props:
 *   - message {string}           — Text content of the toast
 *   - type    {'success'|'error'} — Visual style variant
 *   - onDismiss {() => void}     — Called after the auto-dismiss timeout (3s)
 *
 * Commit: feat(community): add Toast notification component
 */

import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={18} aria-hidden="true" />,
  error:   <AlertCircle  size={18} aria-hidden="true" />,
};

const AUTO_DISMISS_MS = 3000;

export default function Toast({ message, type = 'success', onDismiss }) {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    /*
     * aria-live="polite" — screen readers will announce this toast
     * after finishing the current task (non-interruptive).
     */
    <div aria-live="polite" role="status" className="community-int__toast-region">
      <div className={`community-int__toast community-int__toast--${type}`}>
        {ICONS[type]}
        <span>{message}</span>
      </div>
    </div>
  );
}
