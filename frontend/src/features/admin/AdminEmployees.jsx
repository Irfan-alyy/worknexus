const managers = [
  { id: 1, name: "HR Manager Alice", role: "HR" },
  { id: 2, name: "Project Manager Bob", role: "PM" },
]

export default function AdminEmployees({ onEdit }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Employees & Managers</h2>
      </div>

      <div className="space-y-3">
        {managers.map((m) => (
          <div key={m.id} className="rounded-lg border border-border bg-background p-4 flex items-start justify-between">
            <div>
              <h3 className="font-medium">{m.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Role: {m.role}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(`Edit user: ${m.name}`, <EmployeeEditor employee={m} />)} className="px-3 py-1 rounded bg-secondary text-foreground">Edit</button>
            </div>
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
          <button className="px-3 py-2 rounded bg-primary text-white">Save</button>
        </div>
      </div>
    </div>
  )
}
