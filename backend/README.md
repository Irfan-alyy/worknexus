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



## Feature-to-file map

- Authentication: `src/features/auth/`
- Chat: `src/features/chat/`
- Departments: `src/features/departments/`
- Employees: `src/features/hr-management/`
- Clients: `src/features/clients/`
- Users: `src/features/users/`
- Payroll: `src/features/payroll/`

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