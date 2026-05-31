# Dashboard Integration Guide

## Quick Reference: What Gets Displayed on Each Dashboard

### Admin Dashboard
**From**: `GET /api/v1/admin/activities` + `GET /api/v1/admin/activities/metrics`

**Metrics Displayed**:
- System alerts
- Managers (HR and PM users)
- Employees (active profiles)
- Clients
- Projects
- Departments

**Recent Activities**: 5 most recent activities from across platform

### HR Dashboard
**From**: `GET /api/v1/hr/activities` + `GET /api/v1/hr/activities/metrics`

**Metrics Displayed**:
- Total Employees
- Total Departments
- Active Projects
- Pending Payroll items

**Recent Activities**: 5 most recent HR-related activities (employee updates, payroll, department changes)

### PM Dashboard
**From**: `GET /api/v1/pm/activities` + `GET /api/v1/pm/activities/metrics`

**Metrics Displayed**:
- Active Projects
- Total Tasks
- Completed (this week)
- Pending (awaiting review)

**Recent Activities**: 5 most recent project/task activities

### Employee Dashboard
**From**: `GET /api/v1/employees/:id/activities` + `GET /api/v1/employees/:id/activities/metrics`

**Metrics Displayed**:
- Tasks Due
- Hours Logged
- Assigned Projects
- Completed (this month)

**Recent Activities**: 5 most recent personal activities (tasks, time logs, etc.)

---

## Implementation Details

### Frontend File Structure
```
frontend/
├── src/
│   ├── lib/
│   │   └── dashboard-transform.js          ← Transform utilities
│   ├── routes/
│   │   └── dashboard-page.jsx              ← Main dashboard component
│   └── features/
│       ├── admin/
│       │   ├── hooks/useAdminActivities.js
│       │   └── services/admin-activities-api.js
│       ├── hr-management/
│       │   ├── hooks/useHRActivities.js
│       │   └── services/hr-activities-api.js
│       ├── pm/
│       │   ├── hooks/use-pm-activities.js
│       │   └── services/pm-activities-api.js
│       └── employee/
│           ├── hooks/use-employee-activities.js
│           └── services/employee-activities-api.js
```

### Data Transformation Flow
```
Backend API Response
    ↓
React Query Hook (useAdminActivityMetrics, etc.)
    ↓
Transform Function (transformMetricsToGrid)
    ↓
Dashboard Component
    ↓
Display Metrics + Activities
```

### Error Handling
- If API request fails: Falls back to mock data
- Show loading spinner during fetch
- Show error message if available
- Activities always have some content (mock or real)

---

## Adding a New Role or Metric

To add metrics for a new role:

1. **Add backend endpoint** in `src/features/activities/activities.routes.js`
2. **Create frontend service** in `src/features/<role>/services/`
   ```javascript
   export const fetch<Role>ActivityMetrics = async () => {
     const { data } = await axios.get(`/<role>/activities/metrics`)
     return data.data || {}
   }
   ```
3. **Create frontend hook** in `src/features/<role>/hooks/`
   ```javascript
   export const use<Role>ActivityMetrics = () => {
     return useQuery({
       queryKey: queryKeys.<role>Activities.metrics(),
       queryFn: () => fetch<Role>ActivityMetrics(),
       staleTime: 5 * 60 * 1000,
     })
   }
   ```
4. **Update dashboard-transform.js** with metric mapping
   ```javascript
   const metricMap = {
     <role>: [
       { key: "metricKey", label: "Display Label", note: "Note text" },
     ]
   }
   ```
5. **Update dashboard-page.jsx** with new hook and role check

---

## Testing the Dashboard

### Test Scenarios

**Scenario 1: Load Admin Dashboard**
1. Login as admin user
2. Go to /dashboard
3. Should see: System metrics + recent admin activities
4. If API down: Falls back to mock data

**Scenario 2: Load HR Dashboard**
1. Login as HR user
2. Go to /dashboard
3. Should see: Employee, Department, Project, Payroll metrics
4. Should see: Recent HR activities

**Scenario 3: Mobile Responsiveness**
1. Open dashboard on mobile
2. Metrics cards should stack in single column
3. Activity cards should remain readable
4. No horizontal overflow

**Scenario 4: Error Handling**
1. Kill backend server
2. Load dashboard
3. Should see loading spinner then fall back to mock data
4. No red error messages

---

## API Query Parameters

All activity endpoints support filtering:

### `/api/v1/<role>/activities` Query Params:
- `limit` - Number of results (default 50)
- `type` - Filter by activity type
- `dateRange` - today, week, month
- `status` - new, all, archived

Example:
```
GET /api/v1/hr/activities?limit=10&dateRange=week&type=payroll
```

### `/api/v1/<role>/activities/metrics`
No query parameters. Returns aggregated data for the role.

---

## Troubleshooting

### Dashboard Shows Only Mock Data
- Check browser console for API errors
- Verify backend is running on correct port
- Check JWT token is valid
- Verify user role in localStorage

### Metrics Show "0" Values
- Check backend service functions are calculating correctly
- Verify data exists in database
- Check query limits aren't filtering out all records

### Activities Not Showing
- Verify activity records exist in database
- Check limit parameter isn't 0
- Verify timestamp data is valid
- Check API returns activities array

### Mobile Layout Issues
- Check dashboard-metric-grid responsive Tailwind classes
- Verify ActivityFilters wrapping classes are applied
- Test with browser DevTools mobile mode
