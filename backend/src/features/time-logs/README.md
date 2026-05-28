# Time Logs Module API Documentation

## Overview
The Time Logs module provides REST APIs for tracking time spent on tasks. Employees can log work hours against assigned tasks, with role-based access control ensuring data integrity.

Note: Project managers must be users with role `pm` and a corresponding `Employee` record. Admins create `User` accounts (optionally supplying employee fields to create minimal employee records). HR creates employee profiles (and may create employees with `pm` role via the employee creation endpoint). The backend enforces that project managers are users with role `pm`.

## Permissions Model

| Action | Admin | HR | Project Manager | Employee |
|--------|-------|----|--------------------|----------|
| Create time log | ✅ Any employee | ✅ Any employee | ✅ Projects they manage | ✅ Only self |
| List time logs | ✅ All | ✅ All | ✅ Their projects | ✅ Only theirs |
| Get time log | ✅ All | ✅ All | ✅ Their projects | ✅ Only theirs |

## Database Schema

```prisma
model TimeLog {
  id          Int
  taskId      Int
  employeeId  Int
  hours       Decimal
  description String?
  loggedAt    DateTime
  
  task        Task
  employee    Employee
}
```

## API Endpoints

### 1. Create Time Log
**Endpoint:** `POST /api/v1/time-logs`

**Authentication:** Required (JWT token)

**Allowed Roles:** admin, hr, pm, employee

**Description:** Log time spent on a task. Employees can only log time for themselves. PMs can log for their project tasks. Admin/HR can log for any employee.

**Request Body:**
```json
{
  "task_id": 1,
  "employee_id": 5,
  "hours": 4.5,
  "description": "Completed schema design and documentation",
  "logged_at": "2026-05-23T09:00:00Z"
}
```

**Request:**
```http
POST /api/v1/time-logs HTTP/1.1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "task_id": 1,
  "employee_id": 5,
  "hours": 4.5,
  "description": "Completed schema design and documentation",
  "logged_at": "2026-05-23T09:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Time log created",
  "data": {
    "id": 1,
    "taskId": 1,
    "employeeId": 5,
    "hours": 4.5,
    "description": "Completed schema design and documentation",
    "loggedAt": "2026-05-23T09:00:00.000Z"
  }
}
```

**Field Validation:**
```
task_id: integer > 0 (required)
employee_id: integer > 0 (required)
hours: number > 0 and <= 24 (required)
description: string (optional)
logged_at: ISO 8601 datetime (optional, defaults to current time)
```

**Error Response (400 Bad Request - Validation):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "hours",
      "message": "hours must be greater than 0"
    },
    {
      "field": "task_id",
      "message": "task_id is required"
    }
  ]
}
```

**Error Response (400 Bad Request - Invalid Reference):**
```json
{
  "success": false,
  "message": "Invalid task or employee selected"
}
```

**Error Response (403 Forbidden - Permission):**
```json
{
  "success": false,
  "message": "Cannot log time for other employees"
}
```

**Error Response (403 Forbidden - Not Team Member):**
```json
{
  "success": false,
  "message": "Forbidden"
}
```

---

### 2. List Time Logs
**Endpoint:** `GET /api/v1/time-logs`

**Authentication:** Required (JWT token)

**Allowed Roles:** admin, hr, pm, employee

**Query Parameters:**
- `taskId` (optional): Filter by task ID (integer)
- `employeeId` (optional): Filter by employee ID (integer)

**Description:** Retrieve time logs based on role and filters. Admin/HR see all, PM sees their projects, employees see their own.

**Request (list all for admin/hr):**
```http
GET /api/v1/time-logs HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Request (filter by task):**
```http
GET /api/v1/time-logs?taskId=1 HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Request (filter by employee):**
```http
GET /api/v1/time-logs?employeeId=5 HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "taskId": 1,
      "employeeId": 5,
      "hours": 4.5,
      "description": "Completed schema design and documentation",
      "loggedAt": "2026-05-23T09:00:00.000Z",
      "employee": {
        "id": 5,
        "firstName": "John",
        "lastName": "Doe",
        "user": {
          "id": 10,
          "email": "john@example.com"
        }
      },
      "task": {
        "id": 1,
        "projectId": 1,
        "title": "Design database schema",
        "status": "in_progress"
      }
    },
    {
      "id": 2,
      "taskId": 1,
      "employeeId": 5,
      "hours": 3.0,
      "description": "Database review meeting",
      "loggedAt": "2026-05-23T14:00:00.000Z",
      "employee": {
        "id": 5,
        "firstName": "John",
        "lastName": "Doe",
        "user": {
          "id": 10,
          "email": "john@example.com"
        }
      },
      "task": {
        "id": 1,
        "projectId": 1,
        "title": "Design database schema",
        "status": "in_progress"
      }
    }
  ]
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Forbidden"
}
```

**Error Response (404 Not Found - Task):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

## Time Calculation & Payroll Integration

Time logs can be used for:
1. **Project Billing**: Aggregate hours per task to calculate project costs
2. **Payroll**: Multiply `hours` × `employee.hourlyRate` for hourly-paid employees
3. **Capacity Planning**: Track utilization and workload distribution
4. **Timesheets**: Generate weekly/monthly reports

### Example Payroll Calculation
```
Employee: John Doe
Hourly Rate: $50/hour

Time Logs for May 2026:
- Task 1: 4.5 hours → $225
- Task 2: 3.0 hours → $150
- Task 3: 2.5 hours → $125

Total: 10 hours → $500
```

---

## Testing in Postman

### Setup
1. Create a new collection folder: `WorkNexus - Time Logs`
2. Add requests for all endpoints
3. Use base URL: `http://localhost:3000`
4. Set Authorization header with JWT token

### Example Test Scenarios

**Scenario 1: Employee logging time (self)**
```
1. POST /api/v1/time-logs
   - Create time log with employee_id = current user's employee ID
   - Expected: ✅ 201 Created

2. GET /api/v1/time-logs
   - List their own time logs
   - Expected: ✅ 200 OK (filtered to their logs only)

3. POST /api/v1/time-logs (different employee)
   - Try logging time for another employee
   - Expected: ❌ 403 Forbidden "Cannot log time for other employees"
```

**Scenario 2: Project Manager logging time**
```
1. POST /api/v1/time-logs
   - Create time log for task in their project
   - Expected: ✅ 201 Created

2. POST /api/v1/time-logs
   - Create time log for task NOT in their projects
   - Expected: ❌ 403 Forbidden

3. GET /api/v1/time-logs?taskId=<their_project_task>
   - Filter by task in their project
   - Expected: ✅ 200 OK
```

**Scenario 3: Admin/HR logging time (any employee)**
```
1. POST /api/v1/time-logs
   - Create time log for any employee, any task
   - Expected: ✅ 201 Created

2. GET /api/v1/time-logs
   - See all time logs
   - Expected: ✅ 200 OK (all records)

3. GET /api/v1/time-logs?employeeId=<any>
   - Filter by any employee
   - Expected: ✅ 200 OK
```

---

## Integration with Tasks

Each TimeLog references a Task. When viewing a task, you see all associated time logs:

**Example Task Detail Response:**
```json
{
  "id": 1,
  "title": "Design database schema",
  "status": "in_progress",
  "timeLogs": [
    {
      "id": 1,
      "hours": 4.5,
      "description": "Schema design",
      "loggedAt": "2026-05-23T09:00:00.000Z",
      "employee": { ... }
    },
    {
      "id": 2,
      "hours": 3.0,
      "description": "Review meeting",
      "loggedAt": "2026-05-23T14:00:00.000Z",
      "employee": { ... }
    }
  ],
  "totalHours": 7.5
}
```

---

## Notes
- Hours must be between 0 (exclusive) and 24 (inclusive)
- The `logged_at` field defaults to the current server time if not provided
- Time logs are immutable after creation (no update/delete endpoints)
- Deleting a task cascades to delete all associated time logs (if enabled)
- Time log data is retained for historical and payroll purposes
