To make your React and Node.js code run flawlessly, each table in your database acts as a **specialized ledger**. They don't just hold random text; they store specific data structures configured with strict PostgreSQL types to drive the business rules of **WorkNexus**.

Here is an explicit breakdown of exactly **what** each table stores, **why** it stores those specific fields, and **how** they work together to power your application.

---

### 1. Identity & Organization Layer

#### **User Table (The Guardhouse)**

* **What it stores:** Global security and login configuration details. It contains an `id` (auto-incrementing integer), unique `email` string, `password` (stored as an encrypted bcrypt hash), and a string `role` (mapped to an Enum: `admin`, `hr`, `pm`, or `employee`).
* **What it is for:** This handles **Authentication (AuthN) and Authorization (AuthZ)**. When someone logs into the React frontend, the Express backend checks this table. If the credentials match, it creates a JSON Web Token (JWT) containing their `role` so your frontend knows whether to display the HR Dashboard, the Owner Settings, or just the Employee Chat view.

#### **Department Table (The Organizational Bucket)**

* **What it stores:** A simple list of structural team names inside the company, storing a unique `name` string (e.g., "Engineering", "Human Resources", "Design") and an `id`.
* **What it is for:** It provides cross-filtering metrics. It allows an Admin or HR manager to group employees and automatically calculate metrics like *"What is the total monthly payroll spend specifically for the Engineering department?"*

#### **Employee Table (The HR File Cabinet)**

* **What it stores:** Operational business metrics for your workers. It stores their `first_name`, `last_name`, a unique `employee_code`, `hire_date`, their active `payment_model` choice (`fixed`, `hourly`, or `revenue_share`), and precision numeric fields for `base_salary` and `hourly_rate`.
* **What it is for:** This completely separates an individual's security login (`User`) from their company file (`Employee`). It isolates confidential salary information. When calculating payments, the server scans this table to check how much a specific worker should be compensated per month or per hour.

#### **Client Table (The Accounts Ledger)**

* **What it stores:** Records of external entities funding your projects. It keeps track of the client's `name`, unique contact `email`, and their parent `company` name.
* **What it is for:** Binds external business revenue to your internal product cycles. It answers the operational question: *"Which customer is paying for this project, and who do we email when invoices are generated?"*

---

### 2. Operations & Execution Layer (Project Management)

#### **Project Table (The Statement of Work)**

* **What it stores:** High-level project parameters. It stores a unique UUID `id`, a string `name`, a long text `description`, and a `status` indicator (e.g., `pending`, `active`, `completed`). It also contains a `client_id` pointing to the customer funding it.
* **What it is for:** It organizes deliverables. It serves as an umbrella context for tasks, timelines, and teams. In your React dashboard, when a Project Manager opens a workspace, the app queries this table to render progress tracking summaries.

#### **ProjectTeam Table (The Assignment Matrix)**

* **What it stores:** Pairs of mapped identifiers: a `project_id` and an `employee_id`, alongside an `assigned_at` timestamp.
* **What it is for:** It resolves a **Many-to-Many** relationship. Because one employee can be assigned to work on three projects simultaneously, and one project can have a team of ten employees, you cannot store this as a single field. This table creates a clean connection list. If an employee is removed from a project, only their row in this connection table is deleted—their core profile and the project itself remain completely safe.

#### **Task Table (The Actionable Kanban Board)**

* **What it stores:** Granular daily targets. It houses a `title`, text `description`, `priority` (low, medium, high, critical), a tracking `status` (`pending`, `in_progress`, `completed`, `blocked`), and a `due_date`. It links back to a parent `project_id` and can optionally store an `employee_id` if a worker is assigned to it.
* **What it is for:** This directly feeds your frontend Kanban Board or Task List. It allows employees to see exactly what they need to accomplish. It uses an `onDelete: SetNull` constraint for the employee field; if an employee is removed from the system, the task isn't lost—it stays on the project board as "Unassigned" so another team member can pick it up.

#### **TimeLog Table (The Punch Card)**

* **What it stores:** Exact proof of work hours. It captures a `task_id`, the working `employee_id`, the precise number of `hours` logged (stored as a decimal, like `4.50` or `8.00`), a brief text `description` of what was done, and a `logged_at` date stamp.
* **What it is for:** This is the bridge that powers **Hourly Payroll Calculations**. When an employee clicks "Log Hours" in your React app, a row is written here. At the end of the month, the HR processing service tells the database: *"Sum up all `hours` logged by Employee X this month, find their `hourly_rate` from the Employee table, multiply them together, and write the output into the Payroll table."*

#### **Payroll Table (The Pay Slip Ledger)**

* **What it stores:** Permanent financial transaction records. It logs an `employee_id`, the exact calculated `amount` to be paid, a `payment_status` (`pending`, `processed`, `paid`), and the calendar parameters (`pay_period_start` and `pay_period_end`).
* **What it is for:** It provides unchangeable operational history. Even if an employee gets a salary raise next year, historical logs in this table remain locked down as a permanent audit trail showing exactly what they were paid in previous months.

---

### 3. Real-Time Chat Layer (The Slack Engine)

#### **Channel Table (The Workspace Rooms)**

* **What it stores:** Chat room meta-details. It saves a unique UUID string `id`, a unique text `name` (e.g., `#general`, `#development`), and a boolean flag `is_private` to control user visibility.
* **What it is for:** It segments real-time conversations. In your React sidebar, this table dictates the list of rooms users can join. When a user clicks a channel, it establishes a Socket.io event listener scoped entirely to that channel's ID.

#### **Message Table (The Streaming Feed)**

* **What it stores:** Every single text interaction. It stores the `content` string, the `channel_id` where it belongs, the author's `user_id`, a `created_at` timestamp, and a highly critical nullable field called `parent_id`.
* **What it is for:** It manages the chat stream and **Slack-like Thread Replies**.
* * If an employee types a normal message in a channel, `parent_id` is blank (`null`).
* If they hover over a message and click "Reply in Thread", the backend saves a new message row, but sets its `parent_id` to match the `id` of the original message. This prevents sub-replies from flooding the main channel feed.





#### **Reaction Table (The Engagement Grid)**

* **What it stores:** User expressions. It stores a `message_id`, the reacting `user_id`, and an `emoji` shorthand string (like `":thumbsup:"` or `":fire:"`).
* **What it is for:** It powers real-time Slack interactions. It utilizes a compound unique constraint: `@@unique([messageId, userId, emoji])`. This database rule acts as a defensive guard; if a user spam-clicks a reaction button in your UI, the database actively rejects duplicates, keeping your data footprint clean.