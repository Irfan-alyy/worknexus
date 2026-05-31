# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## TanStack Query (v5) integration

WorkNexus uses TanStack Query v5 for data fetching and caching. The global setup lives in:

- `src/lib/react-query.js` - `QueryClient` defaults
- `src/providers/query-provider.jsx` - `QueryClientProvider` + Devtools
- `src/config/query-keys.js` - centralized query key factory
- `src/lib/axios.js` - API client (sets `Authorization` header via `setAuthToken`)

### Module conventions

Each feature module follows the same wiring pattern:

- `src/features/<module>/services/<module>-api.js` - Axios calls
- `src/features/<module>/hooks/use-<module>-query.js` - `useQuery({ queryKey, queryFn })`
- `src/features/<module>/hooks/use-<module>-mutation.js` - `useMutation({ mutationFn, ... })`
- `src/features/<module>/index.js` - barrel exports

### Query key usage

Always use the factory in `src/config/query-keys.js` instead of inline arrays. Examples:

```js
queryKeys.auth.me()
queryKeys.chat.channels({ projectId })
queryKeys.hr.employees({ departmentId })
queryKeys.admin.managers()
queryKeys.admin.clients()
```

### Auth token handling

On login, store the token in the global store which calls `setAuthToken(token)`.
This keeps Axios in sync for all protected requests.

## Integration status

### Core Features Completed:

- **Authentication**: login/logout wired to `/api/v1/auth` with error messaging and protected routes.
- **Query Config**: QueryClient defaults, provider, and centralized query keys.
- **Admin & HR Access Control**: RoleBarrier guards routes; HR can now access Admin Departments.

### Admin Module:

- **Managers**: list/create/edit using `/api/v1/users` (filtered to `hr` and `pm`) with modal + right-aside details.
- **Employees** (shared with HR): list/create/edit using `/api/v1/employees` with modal + right-aside details.
- **Clients**: list/create/edit using `/api/v1/clients` with modal + right-aside details.
- **Departments**: list/view departments (now accessible to both Admin and HR roles).
- **Admin Activity Metrics**: metrics cards (`admin-activity-metrics.jsx`) showing:
  - Total Managers
  - Total Employees
  - Total Clients
  - Total Projects
  - All wired to metric click handlers for navigation

### HR Module:

- **Employees Management**: list/create/edit with modal + right-aside details.
- **HR Activity Metrics**: metrics cards (`hr-activity-metrics.jsx`) showing:
  - Total Employees
  - Total Departments (navigates to `/hr/departments`)
  - Total Projects
  - Weekly Payroll with pending items
  - All wired to metric click handlers for navigation
- **Departments Page**: HR users can now access and manage departments via `/hr/departments` route.
  - Sidebar link added for easy navigation
  - Renders Admin's department list with HR permissions

### Activity Tracking & Filtering:

- **Activity Metrics**: new `HRActivityMetrics` and `AdminActivityMetrics` hooks fetch aggregated data from `/hr/activities/metrics` and `/admin/activities/metrics`.
- **Activity Filters**: `ActivityFilters` component with type, date range, and status filtering.
  - Mobile responsive with wrapping support for filter chips.
  - Clear filters button for quick reset.
- **Activity Grouping & Sorting**: activities grouped by type and sorted by newest activity timestamp.
- **Activity Detail Panel**: click activities to view detailed information in a right-aside panel.

### Recent Updates:

- **Mobile Responsiveness**: filter buttons and metric cards now wrap correctly on small screens using Tailwind utilities (`flex-wrap`, `whitespace-normal`, `max-w-full`).
- **Metric Navigation**: clicking metric cards now navigates to relevant pages (employees, departments, projects, payroll).
- **Query Keys**: expanded `query-keys.js` with `hrActivities.metrics()` and `adminActivities.metrics()` keys for consistency.

### Feature Modules:

- `src/features/hr-management/components/hr-activity-metrics.jsx` - HR metrics card component
- `src/features/hr-management/hook/useHRActivities.js` - HR activity & metrics queries
- `src/features/admin/components/admin-activity-metrics.jsx` - Admin metrics card component
- `src/features/admin/hook/useAdminActivities.js` - Admin activity & metrics queries
- `src/components/shared/ActivityFilters.jsx` - shared filter UI component
- `src/components/shared/ActivitySection.jsx` - grouped activity display
- `src/components/shared/ActivityDetailPanel.jsx` - activity detail modal

### Upcoming integrations / pending work:

- Employee detail enrichment: populate managed projects, assigned projects, and recent tasks when `/api/v1/employees/:id` returns those fields.
- Projects/tasks deep links: ensure project/task routes accept `projectId` and `taskId` query params and render the correct details.
- Additional payroll and time tracking integrations.
- Replace remaining mock data in legacy modules (projects, tasks, time logs, payroll views) with API calls.
- Add standardized error/empty/loading states across remaining feature pages.
