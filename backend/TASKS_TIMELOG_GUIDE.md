# Tasks & TimeLog Modules - Quick Start Guide

## Overview

This guide covers the newly implemented **Tasks** and **TimeLog** modules for the WorkNexus backend API.

- **Tasks Module:** Manage project tasks with priority, status, and assignment
- **TimeLog Module:** Track time spent on tasks for payroll and billing

## Quick Links

- Full Tasks API docs: [src/features/tasks/README.md](src/features/tasks/README.md)
- Full TimeLog API docs: [src/features/time-logs/README.md](src/features/time-logs/README.md)

Note about users and employees:
- `POST /api/v1/users` is an admin-only endpoint — admins create `User` accounts and may include minimal employee fields to create a corresponding `Employee` record.
- `POST /api/v1/employees` (HR endpoint) creates employee profiles and may create employees with role `pm` (HR can create employee+user with PM role).
- Project manager assignment is strict: `manager_employee_id` must reference an `Employee` whose linked `User.role` is `pm`.

---

## API Endpoints Summary

### Tasks
```
GET    /api/v1/tasks              - List tasks (scoped by role)
GET    /api/v1/tasks/:id          - Get task details with time logs
POST   /api/v1/tasks              - Create new task
PATCH  /api/v1/tasks/:id          - Update task
DELETE /api/v1/tasks/:id          - Delete task (admin/hr/pm only)
```

### Time Logs
```
POST   /api/v1/time-logs          - Log time on a task
GET    /api/v1/time-logs          - List time logs (scoped by role)
```

---

## Permission Matrix

### Task Operations

| Action | Admin | HR | PM | Employee |
|--------|-------|----|----|----------|
| List all | ✅ | ✅ | Own projects | Assigned/Team |
| View task | ✅ | ✅ | Own projects | Assigned/Team |
| Create task | ✅ | ✅ | Own projects | Self or team |
| Update task | ✅ | ✅ | Own projects | Self only |
| Delete task | ✅ | ✅ | Own projects | ❌ |

### Time Log Operations

| Action | Admin | HR | PM | Employee |
|--------|-------|----|----|----------|
| Log time | Any employee | Any employee | Projects they manage | Self only |
| List logs | All | All | Their projects | Own only |

---

## Key Concepts

### Task Status Values
- `pending` - Not started
- `in_progress` - Currently being worked on
- `completed` - Finished
- `blocked` - Cannot proceed

### Task Priority Values
- `low` - Can be deferred
- `medium` - Normal priority (default)
- `high` - Should be prioritized
- `critical` - Urgent

### Time Log Hours Constraint
- Must be > 0 and <= 24 hours per log entry
- Typically 0.5 to 8 hours per entry
- Multiple logs can be created per task per day

---

## Postman Testing Setup

### 1. Import endpoints to Postman

Create a new collection called **"WorkNexus Tasks & TimeLogs"** with these requests:

#### Tasks Requests
```
Folder: Tasks
├── List Tasks
│   GET /api/v1/tasks
├── Get Task
│   GET /api/v1/tasks/{{taskId}}
├── Create Task
│   POST /api/v1/tasks
├── Update Task
│   PATCH /api/v1/tasks/{{taskId}}
└── Delete Task
   DELETE /api/v1/tasks/{{taskId}}

Folder: Time Logs
├── Create Time Log
│   POST /api/v1/time-logs
└── List Time Logs
    GET /api/v1/time-logs
```

### 2. Set Variables

In Postman, create a collection-level variable:
```
Variable Name: baseUrl
Value: http://localhost:3000

Variable Name: token
Value: <your-jwt-token-here>
```

Use in requests: `{{baseUrl}}/api/v1/tasks`

### 3. Add Authorization

In the collection's Auth tab:
```
Type: Bearer Token
Token: {{token}}
```

Or add to each request header:
```
Key: Authorization
Value: Bearer {{token}}
```

---

## Sample Test Workflow

### Test 1: Create a Task (as Admin)

**Request:**
```json
POST {{baseUrl}}/api/v1/tasks
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "title": "Build REST API",
  "description": "Implement all endpoints for tasks module",
  "priority": "high",
  "status": "pending",
  "due_date": "2026-06-15T00:00:00Z",
  "project_id": 1,
  "employee_id": 5
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created",
  "data": {
    "id": 123,
    "projectId": 1,
    "employeeId": 5,
    "title": "Build REST API",
    "priority": "high",
    "status": "pending",
    ...
  }
}
```

---

### Test 2: Log Time (as Employee)

**Request:**
```json
POST {{baseUrl}}/api/v1/time-logs
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "task_id": 123,
  "employee_id": 5,
  "hours": 3.5,
  "description": "Built CRUD endpoints",
  "logged_at": "2026-05-23T14:00:00Z"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Time log created",
  "data": {
    "id": 1,
    "taskId": 123,
    "employeeId": 5,
    "hours": 3.5,
    "description": "Built CRUD endpoints",
    "loggedAt": "2026-05-23T14:00:00.000Z"
  }
}
```

---

### Test 3: View Task with Time Logs

**Request:**
```json
GET {{baseUrl}}/api/v1/tasks/123
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Build REST API",
    "status": "in_progress",
    "timeLogs": [
      {
        "id": 1,
        "hours": 3.5,
        "description": "Built CRUD endpoints",
        "loggedAt": "2026-05-23T14:00:00.000Z",
        "employee": {
          "id": 5,
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

---

## Permission testing scenarios

### Scenario A: Employee Creates Task (Self-Assigned)
```
User Role: employee
Payload: employee_id = same as user's employee id

Expected: ✅ Success (201)
```

### Scenario B: Employee Creates Task (Different Employee)
```
User Role: employee
Payload: employee_id = different employee

Expected: ❌ Forbidden (403) - "Only for themselves or project teams"
```

### Scenario C: PM Updates Task (Own Project)
```
User Role: pm
Task's Project: Managed by user

Expected: ✅ Success (200)
```

### Scenario D: Employee Logs Time (Self)
```
User Role: employee
Payload: employee_id = same as user's employee id

Expected: ✅ Success (201)
```

### Scenario E: Employee Logs Time (Other)
```
User Role: employee
Payload: employee_id = different employee

Expected: ❌ Forbidden (403) - "Cannot log time for other employees"
```

---

## Validation Errors

### Missing Required Field
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "title is required"
    }
  ]
}
```

### Invalid Field Value
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "priority",
      "message": "priority: invalid_enum_value"
    }
  ]
}
```

### Invalid Reference (Foreign Key)
```json
{
  "success": false,
  "message": "Invalid project or employee selected"
}
```

---

## Debugging Tips

1. **Check token validity**: Ensure JWT token is not expired
   ```bash
   # Test auth endpoint first
   POST /api/v1/auth/login
   ```

2. **Verify employee association**: User must have an associated employee record
   ```bash
   # Check if user has employee record
   GET /api/v1/employees
   ```

3. **Check project membership**: For PM role, ensure managing the project
   ```bash
   # View project details
   GET /api/v1/projects/:projectId
   ```

4. **Validate request timestamps**: Use proper ISO 8601 format
   ```
   Valid: "2026-05-23T14:00:00Z"
   Also valid: "2026-05-23T14:00:00.000Z"
   ```

5. **Check response status codes**:
   - `200` - Success (GET, PATCH, etc.)
   - `201` - Created (POST)
   - `400` - Bad request (validation error)
   - `401` - Unauthorized (missing/invalid token)
   - `403` - Forbidden (insufficient permissions)
   - `404` - Not found (resource doesn't exist)
   - `500` - Server error

---

## Environment-Specific Configuration

### Development (localhost:3000)
```
Base URL: http://localhost:3000
Example: http://localhost:3000/api/v1/tasks
```

### Production
```
Base URL: https://api.worknexus.com
Example: https://api.worknexus.com/api/v1/tasks
```

---

## Next Steps

1. ✅ Start the backend server: `npm run dev`
2. ✅ Get a valid JWT token (login with a user)
3. ✅ Test endpoints in Postman using scenarios above
4. ✅ Verify role-based permissions work as expected
5. ⏳ Build frontend UI for task management and time tracking

---

## Related Documentation

- [Project Module](../projects/README.md)
- [Employee Module](../hr-management/README.md)
- [Auth Module](../auth/README.md)
- [Validation Schemas](../../utils/validation-schemas.js)
