# Tasks Module API Documentation

## Overview
The Tasks module provides REST APIs for managing project tasks with role-based access control (RBAC). Tasks are associated with projects, can be assigned to employees, and track status, priority, and due dates.

## Permissions Model

| Action | Admin | HR | Project Manager | Employee |
|--------|-------|----|--------------------|----------|
| List tasks | ✅ All | ✅ All | ✅ Their projects | ✅ Assigned/project teams |
| Get task | ✅ All | ✅ All | ✅ Their projects | ✅ Assigned/project teams |
| Create task | ✅ | ✅ | ✅ For their projects | ✅ Only for themselves or project teams |
| Update task | ✅ | ✅ | ✅ For their projects | ✅ Only if assigned |
| Delete task | ✅ | ✅ | ✅ For their projects | ❌ |

## Database Schema

```prisma
model Task {
  id          Int
  projectId   Int
  employeeId  Int?
  title       String
  description String?
  priority    String        // "low", "medium", "high", "critical"
  status      String        // "pending", "in_progress", "completed", "blocked"
  dueDate     DateTime?
  createdAt   DateTime
  updatedAt   DateTime
  
  project     Project
  employee    Employee?
  timeLogs    TimeLog[]
}
```

Note: Project managers must be users with role `pm` and must have a corresponding `Employee` record. Admins create user accounts (optionally supplying employee fields to create a minimal employee record). HR creates employee profiles (and may create employees with `pm` role via the employee creation endpoint). Project creation/assignment enforces that `manager_employee_id` references an employee whose linked user has role `pm`.

## API Endpoints

### 1. List Tasks
**Endpoint:** `GET /api/v1/tasks`

**Authentication:** Required (JWT token)

**Description:** Retrieve all tasks visible to the authenticated user based on role.

**Request:**
```http
GET /api/v1/tasks HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "projectId": 1,
      "employeeId": 5,
      "title": "Design database schema",
      "description": "Create ERD and SQL schema",
      "priority": "high",
      "status": "in_progress",
      "dueDate": "2026-06-15T00:00:00.000Z",
      "createdAt": "2026-05-23T10:00:00.000Z",
      "updatedAt": "2026-05-23T10:00:00.000Z",
      "project": {
        "id": 1,
        "name": "WorkNexus Platform",
        "clientId": 1,
        "status": "active"
      },
      "employee": {
        "id": 5,
        "firstName": "John",
        "lastName": "Doe",
        "user": {
          "id": 10,
          "email": "john@example.com",
          "role": "employee"
        }
      },
      "timeLogs": []
    }
  ]
}
```

---

### 2. Get Task by ID
**Endpoint:** `GET /api/v1/tasks/:id`

**Authentication:** Required (JWT token)

**Description:** Retrieve a specific task with full details including time logs.

**Request:**
```http
GET /api/v1/tasks/1 HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "projectId": 1,
    "employeeId": 5,
    "title": "Design database schema",
    "description": "Create ERD and SQL schema",
    "priority": "high",
    "status": "in_progress",
    "dueDate": "2026-06-15T00:00:00.000Z",
    "createdAt": "2026-05-23T10:00:00.000Z",
    "updatedAt": "2026-05-23T10:00:00.000Z",
    "project": {
      "id": 1,
      "name": "WorkNexus Platform"
    },
    "employee": {
      "id": 5,
      "firstName": "John",
      "lastName": "Doe"
    },
    "timeLogs": [
      {
        "id": 1,
        "taskId": 1,
        "employeeId": 5,
        "hours": 4.5,
        "description": "Schema design",
        "loggedAt": "2026-05-23T09:00:00.000Z",
        "employee": {
          "id": 5,
          "user": {
            "id": 10,
            "email": "john@example.com"
          }
        }
      }
    ]
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Forbidden"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

### 3. Create Task
**Endpoint:** `POST /api/v1/tasks`

**Authentication:** Required (JWT token)

**Allowed Roles:** admin, hr, pm, employee

**Description:** Create a new task. Role-based restrictions enforced in controller.

**Request Body:**
```json
{
  "title": "Implement authentication API",
  "description": "Build JWT-based auth endpoints",
  "priority": "high",
  "status": "pending",
  "due_date": "2026-06-20T00:00:00Z",
  "project_id": 1,
  "employee_id": 5
}
```

**Request:**
```http
POST /api/v1/tasks HTTP/1.1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Implement authentication API",
  "description": "Build JWT-based auth endpoints",
  "priority": "high",
  "status": "pending",
  "due_date": "2026-06-20T00:00:00Z",
  "project_id": 1,
  "employee_id": 5
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created",
  "data": {
    "id": 2,
    "projectId": 1,
    "employeeId": 5,
    "title": "Implement authentication API",
    "description": "Build JWT-based auth endpoints",
    "priority": "high",
    "status": "pending",
    "dueDate": "2026-06-20T00:00:00.000Z",
    "createdAt": "2026-05-23T10:30:00.000Z",
    "updatedAt": "2026-05-23T10:30:00.000Z"
  }
}
```

**Field Validation:**
```
title: string (1-255 chars, required)
description: string (optional)
priority: enum ["low", "medium", "high", "critical"] (optional, defaults to "medium")
status: enum ["pending", "in_progress", "completed", "blocked"] (optional, defaults to "pending")
due_date: ISO 8601 datetime (optional)
project_id: integer > 0 (required)
employee_id: integer > 0 (optional)
```

**Error Response (400 Bad Request - Validation):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "title is required"
    },
    {
      "field": "project_id",
      "message": "project_id must be greater than 0"
    }
  ]
}
```

**Error Response (403 Forbidden - Permission):**
```json
{
  "success": false,
  "message": "Only project manager can create tasks for this project"
}
```

---

### 4. Update Task
**Endpoint:** `PATCH /api/v1/tasks/:id`

**Authentication:** Required (JWT token)

**Allowed Roles:** admin, hr, pm, employee

**Description:** Update task details. Only assigned employee, project manager, admin/hr can update.

**Request Body:**
```json
{
  "title": "Implement authentication API (v2)",
  "status": "in_progress",
  "priority": "critical"
}
```

**Request:**
```http
PATCH /api/v1/tasks/2 HTTP/1.1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Implement authentication API (v2)",
  "status": "in_progress",
  "priority": "critical"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated",
  "data": {
    "id": 2,
    "projectId": 1,
    "employeeId": 5,
    "title": "Implement authentication API (v2)",
    "description": "Build JWT-based auth endpoints",
    "priority": "critical",
    "status": "in_progress",
    "dueDate": "2026-06-20T00:00:00.000Z",
    "createdAt": "2026-05-23T10:30:00.000Z",
    "updatedAt": "2026-05-23T11:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Forbidden"
}
```

---

### 5. Delete Task
**Endpoint:** `DELETE /api/v1/tasks/:id`

**Authentication:** Required (JWT token)

**Allowed Roles:** admin, hr, pm

**Description:** Delete a task. Only admin, hr, or project manager can delete.

**Request:**
```http
DELETE /api/v1/tasks/2 HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted",
  "data": null
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Forbidden"
}
```

---

## Testing in Postman

### Setup
1. Create a new Postman collection: `WorkNexus - Tasks`
2. Add a folder for Tasks endpoints
3. Create requests for each endpoint above
4. Set the base URL: `http://localhost:3000` (default port)
5. Add Authorization header: `Authorization: Bearer <jwt_token>`

### Example Test Scenarios

**Scenario 1: Admin user (all endpoints)**
- Login as admin / HR user
- Get token from auth endpoint
- Test all CRUD operations

**Scenario 2: Project Manager (restricted scope)**
- Login as project manager
- Create task for project they manage → ✅ Success
- Update task for project they manage → ✅ Success
- Create task for project they don't manage → ❌ Forbidden
- Delete task → ✅ Success

**Scenario 3: Employee (restricted scope)**
- Login as employee
- Create task assigned to themselves → ✅ Success
- Create task for project they're a team member of → ✅ Success
- Update task they're assigned to → ✅ Success
- Update task they're not assigned to → ❌ Forbidden
- Delete task → ❌ Forbidden

---

## Notes
- All timestamps are in ISO 8601 format with UTC timezone.
- UUIDs are used for some references; integers for task IDs.
- The `due_date` field accepts both string (ISO 8601) and date objects.
- Task deletion cascades to related time logs if enabled in Prisma schema.
