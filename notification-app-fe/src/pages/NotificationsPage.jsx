import { useEffect, useMemo, useState } from "react";

import { useNotifications } from "../hooks/useNotifications";

const viewedKey = "notification-viewed-ids";

function readViewedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(viewedKey) || "[]"));
  } catch {
    return new Set();
  }
}

export function NotificationsPage() {
  const [mode, setMode] = useState("all");
  const [type, setType] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [viewedIds, setViewedIds] = useState(() => readViewedIds());

  const { notifications, loading, error, refresh } = useNotifications({
    page,
    limit,
    notificationType: type,
    priorityMode: mode === "priority",
  });

  useEffect(() => {
    localStorage.setItem(viewedKey, JSON.stringify([...viewedIds]));
  }, [viewedIds]);

  const items = useMemo(() => notifications.slice(0, limit), [notifications, limit]);

  function markViewed(id) {
    setViewedIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h2>Notifications</h2>

      <div>
        <button onClick={() => setMode("all")} type="button">
          All
        </button>
        <button onClick={() => setMode("priority")} type="button">
          Priority
        </button>
        <button onClick={refresh} type="button">
          Refresh
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>
          Type{" "}
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">All</option>
            <option value="Placement">Placement</option>
            <option value="Result">Result</option>
            <option value="Event">Event</option>
          </select>
        </label>

        <label style={{ marginLeft: 12 }}>
          Limit{" "}
          <input
            type="number"
            min="1"
            max="50"
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value) || 1)}
            style={{ width: 60 }}
          />
        </label>
      </div>

      <p>
        Page {page}{" "}
        <button onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">
          -
        </button>
        <button onClick={() => setPage((current) => current + 1)} type="button">
          +
        </button>
      </p>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && items.length === 0 && <p>No notifications</p>}

      {!loading && !error && items.length > 0 && (
        <ul>
          {items.map((item) => {
            const viewed = viewedIds.has(item.id);
            return (
              <li key={item.id} onClick={() => markViewed(item.id)}>
                {viewed ? "Viewed" : "New"} - {item.type} - {item.message} - {item.createdAt}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
