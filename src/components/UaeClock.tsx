"use client";

import { useSyncExternalStore } from "react";

const PLACEHOLDER = "--:--:--";
const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
let snapshot = PLACEHOLDER;

function tick() {
  snapshot = formatter.format(new Date());
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(tick, 1000);
    tick();
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => PLACEHOLDER;

type UaeClockProps = {
  className?: string;
};

/** Live Asia/Dubai time; every instance shares one interval. */
export function UaeClock({ className = "" }: UaeClockProps) {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <p className={`label ${className}`}>
      <span className="block">UAE local time</span>
      <span className="block tabular-nums">
        <time aria-live="off">{time}</time> (GMT+4)
      </span>
    </p>
  );
}
