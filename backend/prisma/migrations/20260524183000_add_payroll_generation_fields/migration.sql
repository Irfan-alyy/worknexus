-- AlterTable
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "payroll" ADD COLUMN IF NOT EXISTS "breakdown" JSONB;

-- De-duplicate existing payrolls so the unique index can be created safely
WITH ranked AS (
	SELECT
		id,
		ROW_NUMBER() OVER (
			PARTITION BY employee_id, pay_period_start, pay_period_end
			ORDER BY created_at DESC, id DESC
		) AS rn
	FROM "payroll"
)
DELETE FROM "payroll"
WHERE id IN (
	SELECT id
	FROM ranked
	WHERE rn > 1
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_employee_period_key" ON "payroll"("employee_id", "pay_period_start", "pay_period_end");
