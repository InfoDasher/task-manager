# Task Manager API Documentation

This document provides comprehensive documentation for all API endpoints in the Task Manager application.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints (except registration) require authentication via session cookies managed by NextAuth.js.

### Headers

```
Cookie: next-auth.session-token=<session_token>
```

---

## Auth Endpoints

### Register a New User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

| Field    | Type   | Required | Description                         |
| -------- | ------ | -------- | ----------------------------------- |
| email    | string | Yes      | Valid email address                 |
| password | string | Yes      | 8-100 characters                    |
| name     | string | No       | User's display name (max 100 chars) |

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-19T10:30:00.000Z"
  }
}
```

**Error Response (400 - Validation):**

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

**Error Response (409 - Conflict):**

```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

---

### Login

Authenticate a user (handled by NextAuth.js).

**Endpoint:** `POST /api/auth/callback/credentials`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

> Note: Login is typically handled via NextAuth.js `signIn()` function on the client side.

---

## Projects Endpoints

### List All Projects

Retrieve a paginated list of projects for the authenticated user.

**Endpoint:** `GET /api/projects`

**Query Parameters:**

| Parameter | Type   | Default   | Description                                         |
| --------- | ------ | --------- | --------------------------------------------------- |
| page      | number | 1         | Page number (positive integer)                      |
| limit     | number | 10        | Items per page (1-100)                              |
| search    | string | -         | Search by project name                              |
| status    | string | -         | Filter by status: `ACTIVE`, `ARCHIVED`, `COMPLETED` |
| sortBy    | string | createdAt | Sort field: `createdAt`, `updatedAt`, `name`        |
| sortOrder | string | desc      | Sort direction: `asc`, `desc`                       |

**Example Request:**

```
GET /api/projects?page=1&limit=10&status=ACTIVE&search=website
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      "name": "Website Redesign",
      "description": "Redesign the company website",
      "status": "ACTIVE",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-19T14:30:00.000Z",
      "_count": {
        "tasks": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

---

### Get Single Project

Retrieve a specific project with its tasks.

**Endpoint:** `GET /api/projects/:id`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    "name": "Website Redesign",
    "description": "Redesign the company website with modern UI",
    "status": "ACTIVE",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-19T14:30:00.000Z",
    "tasks": [
      {
        "id": "clyyyyyyyyyyyyyyyyyyyyyyyyy",
        "title": "Create wireframes",
        "description": "Design initial wireframes for homepage",
        "status": "DONE",
        "priority": "HIGH",
        "dueDate": "2025-01-20T00:00:00.000Z",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-18T09:00:00.000Z"
      }
    ]
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Project not found"
}
```

---

### Create Project

Create a new project.

**Endpoint:** `POST /api/projects`

**Request Body:**

```json
{
  "name": "New Marketing Campaign",
  "description": "Q1 2025 marketing campaign planning",
  "status": "ACTIVE"
}
```

| Field       | Type   | Required | Description                                 |
| ----------- | ------ | -------- | ------------------------------------------- |
| name        | string | Yes      | Project name (1-255 chars)                  |
| description | string | No       | Project description (max 1000 chars)        |
| status      | string | No       | `ACTIVE` (default), `ARCHIVED`, `COMPLETED` |

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    "name": "New Marketing Campaign",
    "description": "Q1 2025 marketing campaign planning",
    "status": "ACTIVE",
    "userId": "clzzzzzzzzzzzzzzzzzzzzzzzzz",
    "createdAt": "2025-01-19T15:00:00.000Z",
    "updatedAt": "2025-01-19T15:00:00.000Z"
  }
}
```

---

### Update Project

Update an existing project.

**Endpoint:** `PUT /api/projects/:id`

**Request Body:**

```json
{
  "name": "Updated Project Name",
  "description": "New description",
  "status": "COMPLETED"
}
```

All fields are optional. Only include fields you want to update.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    "name": "Updated Project Name",
    "description": "New description",
    "status": "COMPLETED",
    "userId": "clzzzzzzzzzzzzzzzzzzzzzzzzz",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-19T16:00:00.000Z"
  }
}
```

---

### Delete Project

Delete a project and all its associated tasks.

**Endpoint:** `DELETE /api/projects/:id`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Project not found"
}
```

---

## Tasks Endpoints

### List All Tasks

Retrieve a paginated list of tasks across all projects.

**Endpoint:** `GET /api/tasks`

**Query Parameters:**

| Parameter | Type   | Default   | Description                                                    |
| --------- | ------ | --------- | -------------------------------------------------------------- |
| page      | number | 1         | Page number                                                    |
| limit     | number | 10        | Items per page (1-100)                                         |
| search    | string | -         | Search by task title                                           |
| status    | string | -         | Filter: `TODO`, `IN_PROGRESS`, `DONE`                          |
| priority  | string | -         | Filter: `LOW`, `MEDIUM`, `HIGH`                                |
| projectId | string | -         | Filter by project ID (CUID)                                    |
| sortBy    | string | createdAt | Sort: `createdAt`, `updatedAt`, `title`, `dueDate`, `priority` |
| sortOrder | string | desc      | Direction: `asc`, `desc`                                       |

**Example Request:**

```
GET /api/tasks?status=TODO&priority=HIGH&page=1
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clyyyyyyyyyyyyyyyyyyyyyyyyy",
      "title": "Review pull request",
      "description": "Review PR #42 for the new feature",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2025-01-20T17:00:00.000Z",
      "createdAt": "2025-01-19T09:00:00.000Z",
      "updatedAt": "2025-01-19T09:00:00.000Z",
      "project": {
        "id": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
        "name": "Backend API"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### Get Single Task

Retrieve a specific task with its project info.

**Endpoint:** `GET /api/tasks/:id`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "clyyyyyyyyyyyyyyyyyyyyyyyyy",
    "title": "Implement user authentication",
    "description": "Add login and registration functionality",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2025-01-25T00:00:00.000Z",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-19T11:30:00.000Z",
    "project": {
      "id": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      "name": "Backend API",
      "status": "ACTIVE"
    }
  }
}
```

---

### Create Task (via Project)

Create a new task within a project.

**Endpoint:** `POST /api/projects/:projectId/tasks`

**Request Body:**

```json
{
  "title": "Write unit tests",
  "description": "Add tests for the auth module",
  "status": "TODO",
  "priority": "MEDIUM",
  "dueDate": "2025-01-30T00:00:00.000Z"
}
```

| Field       | Type   | Required | Description                             |
| ----------- | ------ | -------- | --------------------------------------- |
| title       | string | Yes      | Task title (1-255 chars)                |
| description | string | No       | Task description (max 1000 chars)       |
| status      | string | No       | `TODO` (default), `IN_PROGRESS`, `DONE` |
| priority    | string | No       | `LOW`, `MEDIUM` (default), `HIGH`       |
| dueDate     | string | No       | ISO 8601 datetime or null               |

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "clyyyyyyyyyyyyyyyyyyyyyyyyy",
    "title": "Write unit tests",
    "description": "Add tests for the auth module",
    "status": "TODO",
    "priority": "MEDIUM",
    "dueDate": "2025-01-30T00:00:00.000Z",
    "projectId": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    "createdAt": "2025-01-19T12:00:00.000Z",
    "updatedAt": "2025-01-19T12:00:00.000Z"
  }
}
```

---

### Update Task

Update an existing task.

**Endpoint:** `PUT /api/tasks/:id`

**Request Body:**

```json
{
  "title": "Updated task title",
  "status": "DONE",
  "priority": "LOW"
}
```

All fields are optional.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "clyyyyyyyyyyyyyyyyyyyyyyyyy",
    "title": "Updated task title",
    "description": "Add tests for the auth module",
    "status": "DONE",
    "priority": "LOW",
    "dueDate": "2025-01-30T00:00:00.000Z",
    "projectId": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    "createdAt": "2025-01-19T12:00:00.000Z",
    "updatedAt": "2025-01-19T14:00:00.000Z"
  }
}
```

---

### Delete Task

Delete a task.

**Endpoint:** `DELETE /api/tasks/:id`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## Error Responses

All endpoints return consistent error responses:

### Validation Error (400)

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "fieldName": ["Error message 1", "Error message 2"]
  }
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### Not Found (404)

```json
{
  "success": false,
  "error": "Resource not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "An unexpected error occurred"
}
```

---

## Status Codes Summary

| Code | Description                      |
| ---- | -------------------------------- |
| 200  | Success                          |
| 201  | Created                          |
| 400  | Bad Request (validation error)   |
| 401  | Unauthorized                     |
| 404  | Not Found                        |
| 409  | Conflict (e.g., duplicate email) |
| 500  | Internal Server Error            |

---

## Data Types

### Project Status

- `ACTIVE` - Project is currently active
- `ARCHIVED` - Project is archived
- `COMPLETED` - Project is completed

### Task Status

- `TODO` - Task not started
- `IN_PROGRESS` - Task is being worked on
- `DONE` - Task is completed

### Task Priority

- `LOW` - Low priority
- `MEDIUM` - Medium priority
- `HIGH` - High priority

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting at the API gateway or middleware level.

---

## CORS

The API is configured to work with the same-origin frontend. For cross-origin requests, configure CORS in `next.config.ts`.
