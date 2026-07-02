import { useEffect, useMemo, useState } from "react";

import { useNotifications } from "../hooks/useNotifications";

const notificationTypes = ["", "Placement", "Result", "Event"];
const storageKey = "notification-viewed-ids";

function readViewedIds() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

function saveViewedIds(viewedIds) {
  window.localStorage.setItem(storageKey, JSON.stringify([...viewedIds]));
}

export function NotificationsPage() {
  const [view, setView] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [notificationType, setNotificationType] = useState("");
  const [viewedIds, setViewedIds] = useState(() => readViewedIds());

  const priorityMode = view === "priority";
  const { notifications, loading, error, refresh } = useNotifications({
    page,
    limit,
    notificationType,
    priorityMode,
  });

  useEffect(() => {
    setPage(1);
  }, [view, notificationType, limit]);

  useEffect(() => {
    saveViewedIds(viewedIds);
  }, [viewedIds]);

  const visibleNotifications = useMemo(() => {
    return priorityMode ? notifications.slice(0, limit) : notifications;
  }, [notifications, priorityMode, limit]);

  function markViewed(id) {
    setViewedIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }

  function handleNextPage() {
    setPage((current) => current + 1);
  }

  function handlePreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  return (
    <div className="page">
      <div className="shell">
        <header className="header">
          <div>
            <p className="eyebrow">Stage 7</p>
            <h1>Notifications</h1>
            <p className="subtitle">
              All notifications and priority inbox with simple viewed state
            </p>
          </div>
          <button className="button" onClick={refresh} type="button">
            Refresh
          </button>
        </header>

        <div className="tabs">
          <button
            className={view === "all" ? "tab tab-active" : "tab"}
            type="button"
            onClick={() => setView("all")}
          >
            All Notifications
          </button>
          <button
            className={view === "priority" ? "tab tab-active" : "tab"}
            type="button"
            onClick={() => setView("priority")}
          >
            Priority Notifications
          </button>
        </div>

        <section className="panel">
          <div className="controls">
            <div className="control-group">
              <span>Type:</span>
              <div className="chip-row">
                {notificationTypes.map((type) => (
                  <button
                    key={type || "all"}
                    type="button"
                    className={notificationType === type ? "chip chip-active" : "chip"}
                    onClick={() => setNotificationType(type)}
                  >
                    {type || "All"}
                  </button>
                ))}
              </div>
            </div>

            <label className="control-group">
              <span>Limit:</span>
              <input
                className="input"
                type="number"
                min="1"
                max="50"
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value) || 1)}
              />
            </label>
          </div>

          <div className="controls controls-bottom">
            <div className="stats">
              Page {page} | Total shown {visibleNotifications.length} | Viewed{" "}
              {visibleNotifications.filter((item) => viewedIds.has(item.id)).length}
            </div>
            <div className="pager">
              <button className="button button-secondary" onClick={handlePreviousPage} type="button">
                Previous
              </button>
              <button className="button button-secondary" onClick={handleNextPage} type="button">
                Next
              </button>
            </div>
          </div>
        </section>

        {loading && <p className="message">Loading...</p>}
        {error && <p className="message message-error">{error}</p>}

        {!loading && !error && visibleNotifications.length === 0 && (
          <p className="message">No notifications found.</p>
        )}

        {!loading && !error && visibleNotifications.length > 0 && (
          <div className="list">
            {visibleNotifications.map((item) => {
              const isViewed = viewedIds.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={isViewed ? "notification viewed" : "notification new"}
                  onClick={() => markViewed(item.id)}
                >
                  <div className="notification-top">
                    <strong>{item.type}</strong>
                    <span>{isViewed ? "Viewed" : "New"}</span>
                  </div>
                  <p>{item.message}</p>
                  <small>{item.createdAt}</small>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
