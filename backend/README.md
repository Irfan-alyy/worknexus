# WorkNexus Backend

This backend is built with Express and Prisma and is organized by feature modules. The current foundation includes authentication, request logging, CORS, security headers, centralized validation, role-based access control, and consistent API responses.

## Quick start

```bash
cd backend
npm install
npm start
```

If the database schema changes, run Prisma migrations from the backend folder.

```bash
npx prisma migrate dev
npx prisma generate
```

## API conventions

- Base path: `/api/v1`
- Health check: `GET /health`
- Auth: JWT token via `Authorization: Bearer <token>` or `token` cookie
- Response format:
	- Success: `{ success: true, data, message? }`
	- Error: `{ success: false, message, errors? }`
- Validation: handled by Zod middleware before controller execution
- Authorization: handled by auth + RBAC middleware

## Backend structure

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
├── src/
│   ├── app.js
│   ├── socket.js
│   ├── config/
│   │   ├── app.config.js
│   │   ├── auth.config.js
│   │   ├── db.config.js
│   │   ├── env.config.js
│   │   ├── logger.config.js
│   │   ├── rate-limiter.config.js
│   │   └── socket.config.js
│   ├── features/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── clients/
│   │   ├── departments/
│   │   ├── hr-management/
│   │   ├── payroll/
│   │   └── users/
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── cors.js
│   │   ├── error.js
│   │   ├── rate-limiter.js
│   │   ├── rbac.js
│   │   ├── request-logger.js
│   │   └── validate-body.js
│   └── utils/
│       ├── app-error.js
│       ├── logger.js
│       ├── response.js
│       └── validation-schemas.js
└── logs/
```

## Middleware stack

The app loads middleware in this order:

1. `express.json()` and `express.urlencoded()`
2. `helmet()`
3. CORS middleware
4. Request logger
5. Rate limiter
6. Public routes like health and auth login
7. JWT auth middleware for protected routes
8. Feature routes
9. 404 handler
10. Global error handler

## Shared validation and response rules

- Validation schemas live in `src/utils/validation-schemas.js`
- Route validation uses `validate-body.js`
- All controllers should respond through the shared response structure
- Errors should be passed to `next(err)` so the global handler can format them consistently

## Payroll scheduler

- **File**: `backend/src/jobs/payroll.scheduler.js` — a simple `node-cron` job that runs periodically and invokes payroll generation for the completed task period.
- **Behavior**: By default the job is configured to run weekly and will generate payroll records for employees based on completed tasks during the payroll period. For testing you can run it every minute.
- **Env vars**:
  - `PAYROLL_SCHEDULER_ENABLED` (boolean, default `true`) — enable/disable the scheduler.
  - `PAYROLL_CRON_EXPRESSION` (string, optional) — a 5-field cron expression to override the schedule. Examples:
    - `5 0 * * 1` — every Monday at 00:05 UTC (default weekly schedule)
    - `*/1 * * * *` — every minute (useful for testing)
- **Timezone**: the job uses `UTC`.
- **Dependencies**: add `node-cron` to the backend dependencies and install it in the `backend` folder:

```bash
cd backend
npm install node-cron
```

- **Run (testing)**:

```bash
export PAYROLL_CRON_EXPRESSION="*/1 * * * *"
npm run dev
```

- **Run (production / weekly)**:

```bash
unset PAYROLL_CRON_EXPRESSION
npm run start
```

The scheduler delegates actual payroll calculations and record creation to the existing payroll service (`generatePayrollsForPeriod`), which already looks for completed tasks in the configured pay period.

## Chat, channels, and messages documentation

The chat feature, including channel creation, member management, and message APIs, is documented in:

- [docs/chat-channels-messages.md](docs/chat-channels-messages.md)

That document covers:

- channel create/list/details/update/delete
- bulk add/remove channel members
- message create/list
- response shapes and permission behavior

## Current route map

### Auth

#### `POST /api/v1/auth/register`
Register a new user account.

Required body:
```json
{
	"email": "employee@worknexus.com",
	"password": "password123",
	"role": "employee"
}
```

Returns the created user payload and a JWT token.

#### `POST /api/v1/auth/login`
Login with email and password.

Required body:
```json
{
	"email": "admin@worknexus.com",
	"password": "password123"
}
```

Returns a JWT token and the authenticated user payload.

#### `POST /api/v1/auth/logout`
Requires auth.
Logs out the current user.

#### `GET /api/v1/auth/me`
Requires auth.
Returns the current authenticated user profile.

---

### Departments

Base path: `/api/v1/departments`

#### `GET /`
Requires auth.
Returns all departments.

#### `GET /:id`
Requires auth.
Returns a single department by numeric id.

#### `POST /`
Requires auth and roles `admin` or `hr`.

Required body:
```json
{
	"name": "Engineering"
}
```

#### `PATCH /:id`
Requires auth and roles `admin` or `hr`.

Optional body:
```json
{
	"name": "Human Resources"
}
```

---

### Employees

Base path: `/api/v1/employees`

#### `GET /`
Requires auth and roles `admin` or `hr`.
Returns all employees.

#### `GET /:id`
Requires auth and roles `admin`, `hr`, or `employee`.
Returns a single employee by id.

#### `POST /`
Requires auth and roles `admin` or `hr`.
Creates both authentication `User` and `Employee` profile in a single transaction.

Required body:
```json
{
	"email": "john.doe@worknexus.com",
	"password": "TempPass123",
	"first_name": "John",
	"last_name": "Doe",
	"department_id": 1,
	"payment_model": "fixed",
	"base_salary": 5000
}
```

Notes:
- `first_name` / `last_name` can also be sent as `firstName` / `lastName`
- `department_id` can also be sent as `departmentId`
- `payment_model`, `base_salary`, `hourly_rate` also accept camelCase keys
- Created user role is forced to `employee` for this flow
- Duplicate email fails atomically (no partial employee is created)

Example success response:
```json
{
	"success": true,
	"message": "Employee account created",
	"data": {
		"user": {
			"id": 42,
			"email": "john.doe@worknexus.com",
			"role": "employee",
			"createdAt": "2026-05-21T12:00:00.000Z"
		},
		"employee": {
			"id": 21,
			"userId": 42,
			"firstName": "John",
			"lastName": "Doe",
			"paymentModel": "fixed"
		}
	}
}
```

#### `PATCH /:id`
Requires auth and roles `admin` or `hr`.

Optional body:
```json
{
	"first_name": "Jane",
	"payment_model": "hourly",
	"hourly_rate": 30
}
```

---

### Clients

Base path: `/api/v1/clients`

#### `GET /`
Requires auth.
Returns all clients.

#### `GET /:id`
Requires auth.
Returns a single client by id.

#### `POST /`
Requires auth and roles `admin` or `hr`.

Required body:
```json
{
	"name": "Acme Corp",
	"email": "billing@acme.com",
	"company": "Acme Corporation"
}
```

#### `PATCH /:id`
Requires auth and roles `admin` or `hr`.

Optional body:
```json
{
	"company": "Acme Holdings"
}
```

---

### Users

Base path: `/api/v1/users`

#### `GET /`
Requires auth and role `admin`.
Returns users with safe fields only.

#### `GET /:id`
Requires auth.
Admins can access any user. Non-admin access is restricted to the owner.

#### `POST /`
Requires auth and role `admin`.

Required body:
```json
{
	"email": "user@worknexus.com",
	"password": "secret123",
	"role": "employee"
}
```

#### `PATCH /:id`
Requires auth.
Admins can update any user. Non-admin access is restricted to the owner.

Optional body:
```json
{
	"password": "newSecret123",
	"role": "hr"
}
```

---

### Projects

Base path: `/api/v1/projects`

This feature implements project records, role-scoped visibility, and team management endpoints. See the full API documentation and request/response examples in:

Base path: `/api/v1/projects`

Auth: All routes require authentication (JWT in `Authorization: Bearer <token>` or `token` cookie).

Roles summary:
- `admin`, `hr`: full access (create/read/update/list, manage team)
- `pm`: can view and update projects where they are the `manager_employee_id`; can manage team for their projects
- `employee`: can view projects where they are a team member (read-only)

Endpoints

1) List projects
- Method: GET
- Path: `/api/v1/projects`
- Body: none
- Response: 200, `data` is an array of projects visible to the caller (admin/hr: all; pm: managed projects; employee: assigned projects)

2) Get project
- Method: GET
- Path: `/api/v1/projects/:id`
- Body: none
- Response: 200, project object. Returns 403 if caller not permitted, 404 if not found.

3) Create project
- Method: POST
- Path: `/api/v1/projects`
- Roles: `admin`, `hr`
- Body (JSON):
  - `name` (string, required)
  - `description` (string, optional)
  - `status` (string, optional) — one of: `pending`, `active`, `completed`, `cancelled` (default `pending`)
  - `client_id` (integer, required) — foreign key to `clients.id`
  - `manager_employee_id` (integer, optional) — `employees.id` of the PM
- Validation errors: 400 with `errors` array; 409 for unique/conflict; 400 if `manager_employee_id` references non-employee.

Example body:
```
{
  "name": "Website Redesign",
  "description": "Redesign corporate website",
  "client_id": 3,
  "manager_employee_id": 1
}
```

4) Update project
- Method: PATCH
- Path: `/api/v1/projects/:id`
- Roles: `admin`, `hr`, `pm` (pm only if they are the `manager_employee_id` for the project)
- Body (JSON): any of the create fields, all optional
- Validation: same as create; attempts to set `manager_employee_id` to a non-existent or non-employee will return 404 or 400 respectively.

5) List project team
- Method: GET
- Path: `/api/v1/projects/:id/team`
- Access: admin/hr; `pm` if manager for the project; `employee` if they are a team member
- Response: list of `project_team` memberships with employee info

6) Add team member
- Method: POST
- Path: `/api/v1/projects/:id/team`
- Roles: `admin`, `hr`, `pm` (pm must be manager)
- Body (JSON):
  - `employee_id` (integer, required) — `employees.id`
- Responses: 201 on success; 404 if employee/project missing; 409 if already assigned.

7) Remove team member
- Method: DELETE
- Path: `/api/v1/projects/:id/team/:employeeId`
- Roles: `admin`, `hr`, `pm` (pm must be manager)
- Response: 200 on success; 404 if membership not found

Notes
- Controllers validate `manager_employee_id` prior to DB updates: it must reference an existing `employees.id` and the linked `user.role` must be `employee`.
- Use `client_id` (integer) and `employee_id` (integer) fields in requests — the API normalizes snake_case/camelCase as needed.
- All responses use the standardized response util: `{ success: boolean, data?, message?, errors? }`.

If you want I can add example `curl` snippets and sample responses for each endpoint.


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



## Feature-to-file map

- Authentication: `src/features/auth/`
- Chat: `src/features/chat/`
- Departments: `src/features/departments/`
- Employees: `src/features/hr-management/`
- Clients: `src/features/clients/`
- Users: `src/features/users/`
- Payroll: `src/features/payroll/`
- Projects: `src/features/projects/`
- Tasks: `src/features/tasks/`
- Time Logs: `src/features/time-logs/`

## Frontend integration notes

- Store JWT securely after login and send it on every protected request
- Use the route map above to drive React API hooks/services
- Check `success` before reading `data`
- Display `message` and `errors` directly from error responses
- Use role from `/auth/me` or login response to decide dashboard navigation

## Next planned APIs

Future phases will add or refine:

- Projects
- Tasks
- Time logs
- Project team assignments
- Rich pagination and filtering
- More detailed ownership checks for user and employee access