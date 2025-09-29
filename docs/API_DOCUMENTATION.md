# Linksy API Documentation

## Overview
Linksy is a branded short link service that gates destinations behind social task verification. This document provides comprehensive API documentation for manual testing and integration.

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`

## Authentication
Most endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Rate Limiting
Public endpoints are rate-limited to 20 requests per minute per IP address.

## Common Response Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid JWT)
- `402` - Payment Required (plan limit reached)
- `404` - Not Found
- `405` - Method Not Allowed
- `409` - Conflict (slug already taken)
- `429` - Too Many Requests (rate limited)

---

## Public Endpoints

### Hello
**GET** `/api/hello`
- **Description**: Simple health check endpoint
- **Auth**: None required
- **Response**: `{ "message": "Hello from Linksy API" }`

### Get Public Link
**GET** `/api/links/slug/{slug}`
- **Description**: Retrieve public link data and tasks
- **Auth**: None required
- **Rate Limited**: Yes (20/min)
- **Response**: Link object with tasks array

### Record Visit
**POST** `/api/visits`
- **Description**: Track a visit to a link
- **Auth**: None required
- **Rate Limited**: Yes (20/min)
- **Body**:
  ```json
  {
    "link_id": "uuid"
  }
  ```
- **Response**: `{ "id": "visit_uuid" }`

### Verify Task
**POST** `/api/verify/{taskId}`
- **Description**: Record a task verification attempt
- **Auth**: None required
- **Rate Limited**: Yes (20/min)
- **Body**:
  ```json
  {
    "visit_id": "uuid",
    "method": "redirect_check",
    "status": "success",
    "meta": {}
  }
  ```
- **Response**: `{ "id": "completion_uuid", "status": "success" }`

### Submit Manual Claim
**POST** `/api/claims`
- **Description**: Submit a manual completion claim
- **Auth**: None required
- **Body**:
  ```json
  {
    "visit_id": "uuid",
    "task_id": "uuid",
    "proof_url": "https://example.com/proof.png",
    "meta": {}
  }
  ```
- **Response**: `{ "id": "completion_uuid", "status": "pending" }`

### Webhook Callback
**POST** `/api/webhooks/social-callback`
- **Description**: Receive platform webhooks for verification
- **Auth**: None required
- **Body**:
  ```json
  {
    "visit_id": "uuid",
    "task_id": "uuid",
    "status": "success",
    "meta": {
      "platform": "youtube",
      "channel_id": "UC1234567890"
    }
  }
  ```
- **Response**: `{ "id": "completion_uuid" }`

---

## Authenticated Endpoints

### Create Link
**POST** `/api/links`
- **Description**: Create a new branded short link
- **Auth**: Required
- **Body**:
  ```json
  {
    "slug": "my-awesome-link",
    "title": "My Awesome Link",
    "destination": "https://example.com",
    "brandColor": "#3b82f6",
    "logoUrl": "https://example.com/logo.png"
  }
  ```
- **Response**: `{ "id": "link_uuid", "slug": "my-awesome-link" }`
- **Errors**: `402` if free plan limit (10 links) reached

### List Links
**GET** `/api/links`
- **Description**: Get all user's links
- **Auth**: Required
- **Response**: Array of link objects

### Get Link
**GET** `/api/links/{id}`
- **Description**: Get specific link with tasks
- **Auth**: Required
- **Response**: Link object with tasks array

### Update Link
**PATCH** `/api/links/{id}`
- **Description**: Update link properties
- **Auth**: Required
- **Body**:
  ```json
  {
    "title": "Updated Title",
    "destination": "https://updated-example.com",
    "brandColor": "#10b981",
    "logoUrl": "https://updated-example.com/logo.png"
  }
  ```
- **Response**: Updated link object

### Delete Link
**DELETE** `/api/links/{id}`
- **Description**: Soft-delete a link
- **Auth**: Required
- **Response**: `204 No Content`

### Create Task
**POST** `/api/links/{id}/tasks`
- **Description**: Add a task to a link
- **Auth**: Required
- **Body**:
  ```json
  {
    "type": "youtube",
    "target": "https://youtube.com/channel/UC1234567890",
    "label": "Subscribe to our YouTube channel",
    "required": true
  }
  ```
- **Response**: Created task object

### Update Task
**PATCH** `/api/links/{id}/tasks/{taskId}`
- **Description**: Update task properties
- **Auth**: Required
- **Body**:
  ```json
  {
    "label": "Updated task label",
    "required": false
  }
  ```
- **Response**: Updated task object

### Delete Task
**DELETE** `/api/links/{id}/tasks/{taskId}`
- **Description**: Delete a task
- **Auth**: Required
- **Response**: `204 No Content`

### Get Analytics
**GET** `/api/analytics/{linkId}`
- **Description**: Get link analytics and metrics
- **Auth**: Required
- **Response**:
  ```json
  {
    "linkId": "uuid",
    "totalVisits": 150,
    "totalCompletions": 45,
    "conversionRate": 30.0,
    "chartData": [
      { "date": "2024-01-01", "visits": 10 },
      { "date": "2024-01-02", "visits": 15 }
    ]
  }
  ```

---

## Admin Endpoints

### Mark Completion Success
**PATCH** `/api/admin/completions/{completionId}`
- **Description**: Admin endpoint to mark manual claims as successful
- **Auth**: Service role key required
- **Headers**: `Authorization: Bearer <SERVICE_ROLE_KEY>`
- **Body**:
  ```json
  {
    "status": "success"
  }
  ```
- **Response**: Updated completion object

---

## Testing with cURL

### Get JWT Token
First, sign in through the web interface and extract the JWT from browser dev tools.

### Create a Link
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-link",
    "title": "Test Link",
    "destination": "https://example.com",
    "brandColor": "#3b82f6"
  }'
```

### Record a Visit
```bash
curl -X POST http://localhost:3000/api/visits \
  -H "Content-Type: application/json" \
  -d '{"link_id": "YOUR_LINK_ID"}'
```

### Get Analytics
```bash
curl -X GET http://localhost:3000/api/analytics/YOUR_LINK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Postman Collection
Import the `docs/postman_collection.json` file into Postman for easy testing with pre-configured requests and variables.

## Environment Variables
Set these variables in Postman or your testing environment:
- `BASE_URL`: `http://localhost:3000`
- `JWT_TOKEN`: Your authentication token
- `LINK_ID`: A valid link ID for testing
- `TASK_ID`: A valid task ID for testing
- `SERVICE_ROLE_KEY`: Admin service role key (for admin endpoints)

