import { useCallback, useEffect, useState } from "react";
import { fetchNotifications } from "../api/notifications";
import { buildPriorityInbox } from "../utils/priorityInbox";

export function useNotifications({ page = 1, limit = 10, notificationType = "", priorityMode = false } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchNotifications({ page, limit, notificationType });
      const items = data.notifications ?? data.data ?? [];
      const inbox = priorityMode ? buildPriorityInbox(items, limit) : items;
      setNotifications(inbox);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [page, limit, notificationType, priorityMode]);

  useEffect(() => {
    load();
  }, [load]);

  return { notifications, loading, error, refresh: load };
}
