## Stage 1

Notification System Design

This is a simple REST API design for showing notifications to a logged-in user.

Base API
/notifications

Headers

Request
Content-Type: application/json
Authorization: Bearer token

Response
Content-Type: application/json

1. Get All Notifications

Method: GET
Endpoint: /notifications
Request: No body

Response:
{
  "success": true,
  "notifications": [
    {
      "id": "d146095a-ed86-4a34-9e69-3900a14576bc",
      "type": "Result",
      "message": "mid-sem",
      "timestamp": "2026-04-22 17:51:30"
    },
    {
      "id": "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
      "type": "Placement",
      "message": "CSX Corporation hiring",
      "timestamp": "2026-04-22 17:51:18"
    },
    {
      "id": "81589ada-da3d-4f77-9554-f52fb558e09d",
      "type": "Event",
      "message": "Farewell",
      "timestamp": "2026-04-22 17:51:06"
    }
  ]
}

2. Create Notification

Method: POST
Endpoint: /notifications
Request:
{
  "type": "Result",
  "message": "project review"
}

Response:
{
  "success": true,
  "message": "Notification created"
}

3. Mark Notification as Read

Method: PATCH
Endpoint: /notifications/:id/read
Request: No body

Response:
{
  "success": true,
  "message": "Marked as read"
}

4. Delete Notification

Method: DELETE
Endpoint: /notifications/:id
Request: No body

Response:
{
  "success": true,
  "message": "Notification deleted"
}

5. Get Unread Notifications

Method: GET
Endpoint: /notifications/unread
Request: No body

Response:
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
      "type": "Placement",
      "message": "CSX Corporation hiring"
    },
    {
      "id": "ea836726-c25e-4f21-a72f-544a6af8a37f",
      "type": "Result",
      "message": "project-review"
    }
  ]
}

Notification Object
{
  "id": "d146095a-ed86-4a34-9e69-3900a14576bc",
  "type": "Result",
  "message": "mid-sem",
  "timestamp": "2026-04-22 17:51:30",
  "isRead": false
}

Real-Time Notification

For real-time updates, WebSocket can be used.

Flow
User login
Frontend connects to WebSocket
Backend sends new notification
Frontend receives it
Notification badge updates

Status Codes
200 OK
201 Created
400 Bad Request
401 Unauthorized
404 Not Found
500 Internal Server Error

Assumptions
User is already logged in.
Notifications are shown in latest first order.
All responses are in JSON format.
