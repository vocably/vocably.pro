import { useCallback, useEffect, useState } from 'react';

/**
 * Counts down before another code may be requested. Cognito throttles code
 * emails, so letting the user hammer the button only ends in
 * LimitExceededException.
 */
export const useResendCooldown = (seconds = 60) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }

    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  const start = useCallback(() => setRemaining(seconds), [seconds]);

  return { remaining, start };
};
