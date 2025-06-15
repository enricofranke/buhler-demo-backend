-- AlterTable
ALTER TABLE "quotations" ADD COLUMN     "is_latest_version" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "parent_quotation_id" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "version_notes" TEXT;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_parent_quotation_id_fkey" FOREIGN KEY ("parent_quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
