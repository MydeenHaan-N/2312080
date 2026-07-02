const priorityOrder = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function normalizeNotification(notification) {
  return {
    id: notification.ID || notification.id || "",
    type: notification.Type || notification.type || "Event",
    message: notification.Message || notification.message || "",
    createdAt: notification.Timestamp || notification.createdAt || "",
    isRead: notification.isRead === true || notification.status === "read",
  };
}

export function buildPriorityInbox(notifications, limit = 10) {
  return notifications
    .map(normalizeNotification)
    .sort((left, right) => {
      const priorityDiff = (priorityOrder[right.type] || 0) - (priorityOrder[left.type] || 0);
      if (priorityDiff !== 0) return priorityDiff;

      const leftTime = new Date(left.createdAt).getTime() || 0;
      const rightTime = new Date(right.createdAt).getTime() || 0;
      return rightTime - leftTime;
    })
    .slice(0, limit);
}
