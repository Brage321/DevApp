import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import type { Blocker } from 'react-router-dom';

/**
 * Warns before navigating away (in-app via router blocker) or closing
 * the tab (beforeunload) when there are unsaved changes.
 */
export function useUnsavedGuard(dirty: boolean): Blocker | null {
  let blocker: Blocker | null = null;
  try {
    // useBlocker must be called unconditionally — wrap result, not the call.
    blocker = useBlocker(
      ({ currentLocation, nextLocation }) =>
        dirty && currentLocation.pathname !== nextLocation.pathname
    );
  } catch {
    blocker = null; // outside a data router context (should not happen)
  }

  useEffect(() => {
    if (blocker?.state === 'blocked') {
      const proceed = window.confirm(
        'You have unsaved changes. Leave without saving?\n\nClick OK to discard changes or Cancel to stay.'
      );
      if (proceed) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  return blocker;
}
