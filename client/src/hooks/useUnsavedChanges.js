import { useState, useEffect, useCallback } from "react";
import { useBlocker } from "react-router-dom";

export function useUnsavedChanges(isDirty) {
  const [showPrompt, setShowPrompt] = useState(false);

  const blocker = useBlocker(
    useCallback(({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
    [isDirty])
  );

  useEffect(() => {
    if (blocker.state === "blocked") setShowPrompt(true);
  }, [blocker.state]);

  function confirmLeave() {
    setShowPrompt(false);
    blocker.proceed?.();
  }

  function cancelLeave() {
    setShowPrompt(false);
    blocker.reset?.();
  }

  return { showPrompt, confirmLeave, cancelLeave };
}
