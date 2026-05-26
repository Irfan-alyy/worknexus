-- DropIndex
DROP INDEX "channels_name_key";

-- AlterTable
ALTER TABLE "channels"
ADD COLUMN "created_by_user_id" INTEGER NOT NULL,
ADD COLUMN "description" TEXT,
ADD COLUMN "project_id" TEXT,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "channel_members" (
    "channel_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_members_pkey" PRIMARY KEY ("channel_id","user_id")
);

-- CreateIndex
CREATE INDEX "idx_channel_member_user" ON "channel_members"("user_id");

-- CreateIndex
CREATE INDEX "idx_channel_project" ON "channels"("project_id");

-- CreateIndex
CREATE INDEX "idx_channel_created_by" ON "channels"("created_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "channel_project_name_key" ON "channels"("project_id", "name");

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
