import { useEffect, useState } from "react";
import { fetchNotifications } from "../api/notifications";
import { buildPriorityInbox } from "../utils/priorityInbox";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchNotifications();
      const inbox = buildPriorityInbox(data.notifications ?? data.data ?? [], 10);
      setNotifications(inbox);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { notifications, loading, error, refresh: load };
}
