import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type Props = {
  timeEnd: number;
  autoStart?: boolean;
  onComplete?: () => void;
};

export type CountDownRef = {
  start: () => void;
  stop: () => void;
};

const CountDown = forwardRef<CountDownRef, Props>(
  ({ timeEnd, autoStart = true, onComplete }, ref) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [timeLeft, setTimeLeft] = useState(
      Math.max(0, Math.floor((timeEnd - Date.now()) / 1000))
    );

    const clearTimer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const tick = useCallback(() => {
      const diff = Math.max(0, Math.floor((timeEnd - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        clearTimer();
        onComplete?.();
      }
    }, [timeEnd, onComplete]);

    const run = useCallback(() => {
      clearTimer();
      tick();
      intervalRef.current = setInterval(tick, 1000);
    }, [tick]);

    useImperativeHandle(ref, () => ({
      start() {
        if (!intervalRef.current) {
          run();
        }
      },
      stop() {
        clearTimer();
      },
    }));

    useEffect(() => {
      if (autoStart) {
        run();
      }
      return () => clearTimer();
    }, [autoStart, run]);

    return <span>{timeLeft}</span>;
  }
);

export default CountDown;
