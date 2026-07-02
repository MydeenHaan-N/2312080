const API_URL = "http://4.224.186.213/evaluation-service/notifications";
const AUTH_URL = "http://4.224.186.213/evaluation-service/auth";

const authPayload = {
  email: "2312080@nec.edu.in",
  name: "mydeen haan n",
  rollNo: "2312080",
  accessCode: "ERzUyx",
  clientID: "16a1bee9-f6f1-43da-8ee6-3d6a7a9cbbd4",
  clientSecret: "cZWxDYhMXXFNTDDu",
};

let cachedToken = "";

async function getAccessToken() {
  if (cachedToken) {
    return cachedToken;
  }

  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authPayload),
  });

  if (!response.ok) {
    throw new Error(`Auth failed with status ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token || "";

  if (!cachedToken) {
    throw new Error("Auth token missing in response");
  }

  return cachedToken;
}

function buildUrl({ page = 1, limit = 10, notificationType = "" } = {}) {
  const url = new URL(API_URL);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  if (notificationType) {
    url.searchParams.set("notification_type", notificationType);
  }

  return url.toString();
}

export async function fetchNotifications(options = {}) {
  const token = await getAccessToken();
  const response = await fetch(buildUrl(options), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
