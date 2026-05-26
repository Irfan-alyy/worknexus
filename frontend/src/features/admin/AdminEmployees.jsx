import { Edit } from "lucide-react"

const managers = [
  { id: 1, name: "HR Manager Alice", role: "HR" },
  { id: 2, name: "Project Manager Bob", role: "PM" },
]

export default function AdminEmployees({ onEdit }) {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Employees & Managers</h2>
      </div>

      <div className="space-y-3">
        {managers.map((m) => (
          <div key={m.id} className="group relative flex items-start justify-between rounded-lg border border-border bg-background p-4 pr-12">
            <div>
              <h3 className="font-medium">{m.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Role: {m.role}</p>
            </div>
            <button
              type="button"
              onClick={() => onEdit(`Edit user: ${m.name}`, <EmployeeEditor employee={m} />)}
              className="absolute -top-4 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 shadow-sm transition-all duration-150 hover:border-primary hover:bg-primary hover:text-primary-foreground group-hover:opacity-100 group-focus-within:opacity-100"
              title="Edit"
              aria-label={`Edit ${m.name}`}
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmployeeEditor({ employee }) {
  return (
    <div>
      <p className="text-sm">Edit employee: <strong>{employee.name}</strong></p>
      <div className="mt-3">
        <input className="w-full rounded border p-2" defaultValue={employee.name} />
        <div className="mt-3 flex justify-end">
          <button className="px-3 py-2 rounded bg-primary text-white aside-save">Save</button>
        </div>
      </div>
    </div>
  )
}
