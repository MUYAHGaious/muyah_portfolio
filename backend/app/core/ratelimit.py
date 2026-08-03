"""A fixed-window rate limiter held in process memory.

Deliberately not Redis-backed: the deployment runs a single API container, so a
shared store would add an service for no gain. The trade-off is that counters
reset when the container restarts, which is acceptable for login throttling and
contact-form abuse but would not be for billing or quotas.
"""

import time
from collections import defaultdict, deque
from threading import Lock


class RateLimiter:
    def __init__(self, max_events: int, window_seconds: int) -> None:
        self.max_events = max_events
        self.window_seconds = window_seconds
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def check(self, key: str) -> bool:
        """Record an attempt. Returns False when the caller is over the limit."""
        now = time.monotonic()
        cutoff = now - self.window_seconds
        with self._lock:
            events = self._events[key]
            while events and events[0] < cutoff:
                events.popleft()
            if len(events) >= self.max_events:
                return False
            events.append(now)
            return True

    def retry_after(self, key: str) -> int:
        """Seconds until the caller's oldest recorded attempt falls out of the window."""
        with self._lock:
            events = self._events[key]
            if not events:
                return 0
            return max(0, int(self.window_seconds - (time.monotonic() - events[0])) + 1)

    def reset(self, key: str | None = None) -> None:
        with self._lock:
            if key is None:
                self._events.clear()
            else:
                self._events.pop(key, None)
