# Payroll Module API

This document describes the Payroll feature endpoints, required request payloads, query parameters, permissions, and concrete examples.

Base path: `/api/v1/payroll`

Overview
- The backend supports both manual calculation (`POST /calculate`) and scheduled generation (weekly by default, configurable to monthly) via `backend/src/jobs/payroll.scheduler.js`.
- Payroll records are unique per employee + pay period; duplicate generation is idempotent and will not create duplicate records.
- Payrolls with calculated `amount <= 0.00` are skipped and not persisted.

Common headers
- `Authorization: Bearer <token>` (JWT)
- `Content-Type: application/json`

Response format
- Success: `{ success: true, data: <object|array>, message?: <string> }`
- Error: `{ success: false, message: <string>, errors?: [{ field, message }] }`

---

## 1) List Payrolls
- Method: `GET`
- URL: `/api/v1/payroll`
- Permissions: `admin`, `hr` (full access). `pm` and `employee` can list **only their own** payrolls.
- Query parameters:
  - `employeeId` (optional): integer — filter by employee id (ignored for non-admin/hr; non-admins see only their own records)
  - `paymentStatus` (optional): `pending|processed|paid`
  - `start`/`end` (optional): ISO datetimes for pay period range (inclusive)

Example (admin listing payrolls for May 2026):

curl -X GET "http://localhost:3000/api/v1/payroll?start=2026-05-01&end=2026-05-31" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

Example response (200):
{
  "success": true,
  "data": [
    {
      "id": "db056c45-4252-462a-a829-e94f9a8e0e0f",
      "employeeId": 2,
      "amount": 380,
      "paymentStatus": "pending",
      "payPeriodStart": "2026-05-01T00:00:00.000Z",
      "payPeriodEnd": "2026-05-31T23:59:59.999Z",
      "processedAt": null,
      "createdAt": "2026-05-24T13:30:46.431Z",
      "breakdown": {
        "completedTaskCount": 3,
        "totalHours": 19,
        "completedTasks": [ /* array of task summaries */ ],
        "hourlyRate": 20
      },
      "employee": {
        "id": 2,
        "firstName": "Jane",
        "lastName": "Doe",
        "paymentModel": "hourly",
        "baseSalary": null,
        "hourlyRate": 20,
        "revenueSharePercent": null,
        "user": { "id": 12, "email": "jane@example.com" }
      }
    }
  ]
}

---

## 2) Get Payroll by ID
- Method: `GET`
- URL: `/api/v1/payroll/:id`
- Permissions: `admin`, `hr` (full access); `pm` and `employee` can access only when the payroll belongs to them.

Example (employee viewing their own payroll):

curl -X GET "http://localhost:3000/api/v1/payroll/db056c45-4252-462a-a829-e94f9a8e0e0f" \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>"

Example response (200):
{
  "success": true,
  "data": {
    "id": "db056c45-4252-462a-a829-e94f9a8e0e0f",
    "employeeId": 2,
    "amount": 380,
    "paymentStatus": "pending",
    "payPeriodStart": "2026-05-01T00:00:00.000Z",
    "payPeriodEnd": "2026-05-31T23:59:59.999Z",
    "processedAt": null,
    "createdAt": "2026-05-24T13:30:46.431Z",
    "breakdown": { /* same as list */ },
    "employee": { /* employee object with user.email */ }
  }
}

---

## 3) Calculate Payroll (preview or create record)
- Method: `POST`
- URL: `/api/v1/payroll/calculate`
- Permissions: `admin`, `hr` only.
- Body (JSON):
  - `employee_id` (required): integer
  - `pay_period_start` (required): ISO datetime or date
  - `pay_period_end` (required): ISO datetime or date
  - `revenue_amount` (optional, required for `revenue_share` employees)
  - `create_record` (optional boolean, default false) — if true and the calculated `amount > 0` a payroll record is created (status `pending`).

Behavior notes:
- `hourly`: sums hours from `TimeLog` entries for tasks that were `completed` in the requested period, multiplied by `employee.hourlyRate`.
- `fixed`: prorates `baseSalary` across days in the pay period (handles cross-month periods by prorating per calendar days in each month).
- `revenue_share`: requires `revenue_amount` in the request.
- If `create_record` is true and `amount` is 0, the API will not create a payroll and will return a message indicating the skip.

Example (preview calculation):

curl -X POST "http://localhost:3000/api/v1/payroll/calculate" \
  -H "Authorization: Bearer <HR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": 2,
    "pay_period_start": "2026-05-01T00:00:00Z",
    "pay_period_end": "2026-05-31T23:59:59Z"
  }'

Preview response (200):
{
  "success": true,
  "data": {
    "employeeId": 2,
    "amount": 380,
    "paymentModel": "hourly",
    "payPeriodStart": "2026-05-01T00:00:00.000Z",
    "payPeriodEnd": "2026-05-31T23:59:59.999Z",
    "breakdown": {
      "completedTaskCount": 3,
      "totalHours": 19,
      "hourlyRate": 20,
      "completedTasks": [ /* per-task summaries */ ]
    }
  }
}

Example (create record):

curl -X POST "http://localhost:3000/api/v1/payroll/calculate" \
  -H "Authorization: Bearer <HR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": 2,
    "pay_period_start": "2026-05-01T00:00:00Z",
    "pay_period_end": "2026-05-31T23:59:59Z",
    "create_record": true
  }'

Possible create responses:
- Created (201): returns the created payroll record (same shape as GET)
- Skipped (200): `{ success: true, data: { calculation: {...}, skippedReason: 'zero_amount' }, message: 'Payroll amount is zero, record not created' }`

---

## 4) Update Payroll Status
- Method: `PATCH`
- URL: `/api/v1/payroll/:id`
- Permissions: `admin`, `hr` only.
- Body (JSON): `{ "payment_status": "processed" }` — allowed values: `pending|processed|paid`.

Behavior: If status is set to `processed` or `paid` the `processedAt` timestamp is set to the current time; setting back to `pending` will clear `processedAt`.

Example:

curl -X PATCH "http://localhost:3000/api/v1/payroll/db056c45-4252-462a-a829-e94f9a8e0e0f" \
  -H "Authorization: Bearer <HR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "payment_status": "processed" }'

Response (200): updated payroll record with `processedAt` set.

---

## 5) Scheduler (automatic generation)
- The scheduler runs weekly (UTC) by default and generates payrolls for the **previous completed period** (e.g., on Monday it generates for the previous week). The mode can be set to `monthly` via `PAYROLL_SCHEDULE_MODE=monthly`.
- Environment flags (see `backend/src/config/env.config.js`):
  - `PAYROLL_SCHEDULER_ENABLED` (default `true`)
  - `PAYROLL_SCHEDULE_MODE` (`weekly` | `monthly`)
  - `PAYROLL_SCHEDULE_HOUR`, `PAYROLL_SCHEDULE_MINUTE` (UTC time for scheduled run)

Scheduler notes:
- The scheduler performs idempotent generation and will skip employees whose calculated amount is 0 or for whom a payroll already exists for the period.
- A dry-run can be invoked by calling the service method directly (`generatePayrollsForPeriod(..., dryRun: true)`) in dev/debug scripts.

---

If you want, I can now:
- add Postman collection snippets for these flows,
- implement frontend API client helpers in `frontend/src/features/payroll/services/payroll-api.js`, or
- add a payroll-run audit table and endpoint for run history.

---

**Common response format**
- Success: `{ success: true, data: <object|array>, message?: <string> }`
- Error: `{ success: false, message: <string>, errors?: [{ field, message }] }`

---

## Endpoints

### 1) List Payrolls
- Method: `GET`
- URL: `/api/v1/payroll`
- Permissions: `admin`, `hr` (full access), `pm`, `employee` (self-only)
- Query parameters:
  - `employeeId` (optional): integer — filter by employee id
  - `paymentStatus` (optional): string — `pending|processed|paid`
  - `start` (optional): ISO datetime/string — pay period start (inclusive)
  - `end` (optional): ISO datetime/string — pay period end (inclusive)
- Response: `200 OK` with array of payroll records including `employee` relation and `breakdown`

Example:
GET /api/v1/payroll?employeeId=5&paymentStatus=pending&start=2026-05-01&end=2026-05-31


### 2) Get Payroll by ID
- Method: `GET`
- URL: `/api/v1/payroll/:id`
- Permissions: `admin`, `hr`, `pm`, or the `employee` who owns the payroll (self-only for non-admin roles)
- Path params:
  - `id`: payroll UUID
- Response: `200 OK` single payroll record with `employee` relation and `breakdown`

Example:
GET /api/v1/payroll/2b3f4d6a-... 


### 3) Calculate Payroll (optionally create record)
- Method: `POST`
- URL: `/api/v1/payroll/calculate`
- Permissions: `admin`, `hr` (only)
- Request body (JSON):
  - `employee_id` (required): integer — employee id to calculate for
  - `pay_period_start` (required): ISO datetime or date — period start
  - `pay_period_end` (required): ISO datetime or date — period end
  - `create_record` (optional, boolean, default `false`): if `true` will create and persist a `Payroll` record

- Validation: `employee_id` must be positive int; `pay_period_start` and `pay_period_end` must be valid datetimes/dates.

- Behavior:
  - Calculates payroll according to `Employee.paymentModel`:
    - `hourly`: completed tasks in the period are used to scope logged hours, then sums `TimeLog.hours` × `employee.hourlyRate`
    - `fixed`: uses `employee.baseSalary` prorated across the full pay period, including month boundaries
    - `revenue_share`: calculates `revenue_amount × (employee.revenueSharePercent / 100)`
  - If `create_record=true`, creates a `Payroll` record with `paymentStatus` = `pending` and returns `201 Created` with the saved record.
  - If the calculated amount is `0`, the payroll is not created.
  - Otherwise returns `200 OK` with calculation breakdown and amount.

Example payloads:
- Calculate only:
{
  "employee_id": 5,
  "pay_period_start": "2026-05-01T00:00:00Z",
  "pay_period_end": "2026-05-31T23:59:59Z"
}

- Calculate and create:
{
  "employee_id": 5,
  "pay_period_start": "2026-05-01T00:00:00Z",
  "pay_period_end": "2026-05-31T23:59:59Z",
  "create_record": true
}

- Revenue share calculation:
{
  "employee_id": 9,
  "pay_period_start": "2026-05-01T00:00:00Z",
  "pay_period_end": "2026-05-31T23:59:59Z",
  "revenue_amount": 50000
}

Responses:
- `200 OK` (calculation): `{ success: true, data: { employeeId, amount, paymentModel, breakdown } }`
- `201 Created` (created): `{ success: true, message: "Payroll created", data: <payroll record> }`


### 4) Update Payroll Status
- Method: `PATCH`
- URL: `/api/v1/payroll/:id`
- Permissions: `admin`, `hr` (only)
- Path params:
  - `id`: payroll UUID
- Request body (JSON):
  - `payment_status` (required): enum `pending|processed|paid`
- Behavior:
  - Updates `paymentStatus`. If set to `processed` or `paid`, the service sets `processedAt` to current timestamp.
- Response: `200 OK` with updated payroll

Example payload:
{
  "payment_status": "processed"
}


---

## Data model notes (for reference)
- `Payroll` model fields: `id`, `employeeId`, `amount`, `paymentStatus`, `payPeriodStart`, `payPeriodEnd`, `processedAt`, `breakdown`, `createdAt`.
- `Employee` model fields relevant to payroll: `paymentModel` (`fixed|hourly|revenue_share`), `baseSalary`, `hourlyRate`, `revenueSharePercent`.
- `Task` now includes `completedAt`, which is used by payroll generation to determine when work was completed.

## Notes & recommendations
- For richer payroll reporting, consider adding `grossAmount`, `taxes`, `deductions`, and `netAmount` to `Payroll` (requires DB migration).
- Payrolls are created with `paymentStatus` = `pending`. Use `PATCH` to move to `processed`/`paid` and record `processedAt`.
- The scheduler currently uses UTC and can be switched between weekly and monthly using environment variables.

---

For examples or Postman collection snippets, tell me which scenario to include (admin create, employee view, PM report, CSV export), and I'll add them.
