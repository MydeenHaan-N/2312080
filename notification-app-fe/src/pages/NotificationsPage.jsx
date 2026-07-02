import { useNotifications } from "../hooks/useNotifications";

export function NotificationsPage() {
  const { notifications, loading, error, refresh } = useNotifications();

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Priority Inbox</h1>
      <button onClick={refresh}>Refresh</button>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <ul>
          {notifications.map((item) => (
            <li key={item.id}>
              <strong>{item.type}</strong> - {item.message} - {item.createdAt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
