-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "manager_employee_id" INTEGER;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_manager_employee_id_fkey" FOREIGN KEY ("manager_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
