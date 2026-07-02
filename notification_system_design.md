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

                         Stage 1 ends here.

## Stage 2

Database Choice

I would suggest MySQL for this notification system.

Reason
It is simple to use, supports SQL queries properly, and is good for structured data like notifications, users, status, timestamp, and type.
It is also easier to keep data consistent when we need to mark a notification as read or fetch unread notifications.

Database Schema

Table name: notifications

id
uuid
primary key

user_id
uuid
not null

type
varchar(30)
not null

message
text
not null

status
varchar(20)
default unread

created_at
timestamp
default current_timestamp

read_at
timestamp
nullable

target_url
text
nullable

priority
varchar(20)
nullable

Indexes

Create index on user_id
Create index on status
Create index on created_at

SQL Table Query

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(30) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  target_url TEXT NULL,
  priority VARCHAR(20) NULL
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

Problems when data increases

1. Fetching notifications may become slow if the table grows too much.
2. Unread count query may take more time.
3. Insert and update operations can increase a lot.
4. Old notifications will keep piling up and make the table large.

Solutions

1. Use proper indexes on user_id, status, and created_at.
2. Use pagination with limit and offset or cursor based pagination.
3. Archive old notifications after some time.
4. Use partitioning if the table becomes very large.
5. Cache unread count in Redis if needed(I alraedy used this in my old projects).

SQL Queries Based on APIs

1. Get all notifications

SELECT id, type, message, status, created_at, read_at, target_url, priority
FROM notifications
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC
LIMIT 20;

2. Get unread notifications

SELECT id, type, message, created_at
FROM notifications
WHERE user_id = 'user-id-here' AND status = 'unread'
ORDER BY created_at DESC;

3. Get unread count

SELECT COUNT(*) AS unread_count
FROM notifications
WHERE user_id = 'user-id-here' AND status = 'unread';

4. Mark one notification as read

UPDATE notifications
SET status = 'read',
    read_at = CURRENT_TIMESTAMP
WHERE id = 'notification-id-here' AND user_id = 'user-id-here';

5. Delete notification

DELETE FROM notifications
WHERE id = 'notification-id-here' AND user_id = 'user-id-here';

6. Create notification

INSERT INTO notifications (id, user_id, type, message, status, created_at, target_url, priority)
VALUES (
  'new-notification-id',
  'user-id-here',
  'Result',
  'project review',
  'unread',
  CURRENT_TIMESTAMP,
  '/results/123',
  'normal'
);

How it connects with REST APIs

GET /notifications
This will use the first SELECT query.

GET /notifications/unread
This will use the unread notifications query.

PATCH /notifications/:id/read
This will use the UPDATE query.

DELETE /notifications/:id
This will use the DELETE query.

POST /notifications
This will use the INSERT query.

NoSQL option

If the system becomes very large in future, MongoDB can also be used.
But for this stage, MySQL is better because the data is simple and structured.

                            Stage 2 ends here.

## Stage 3

The query is not fully accurate for a large table because it can become slow.

SELECT * reads all columns, so it takes more time than needed.
WHERE studentID = 1042 AND isRead = false becomes expensive if the table is large and there is no proper index.
ORDER BY createdAt ASC also adds extra work because the database may need to sort many rows.

This is slow mainly because of full table scan and sorting.
If the table has 50,000 students and 5,00,000 notifications, the database may check a lot of rows before giving the result.

I would change the query to return only the needed columns and add a proper index.

Better query

SELECT id, studentID, notificationType, message, createdAt
FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;

Best index for this query

CREATE INDEX idx_notifications_student_read_created
ON notifications (studentID, isRead, createdAt);

Adding index on every column is not a good idea.
It will increase storage and slow down insert, update, and delete operations.
So we should add only useful indexes based on the common queries.

If the same unread query is used very often, a composite index is better than many single column indexes.

Likely computation cost

Without index, the cost is high because the database may scan the whole table.
With a proper composite index, the query becomes much faster.

Query to find all students who got a placement notification in the last 7 days

SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL 7 DAY;

If student names are needed, we can join the students table with notifications.

Example

SELECT DISTINCT s.studentID, s.name
FROM students s
JOIN notifications n ON s.studentID = n.studentID
WHERE n.notificationType = 'Placement'
AND n.createdAt >= NOW() - INTERVAL 7 DAY;

                            Stage 3 ends here.
