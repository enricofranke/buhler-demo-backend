/*
  Warnings:

  - A unique constraint covering the columns `[quotation_id,configuration_id,quotation_version]` on the table `quotation_configurations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "quotation_configurations_quotation_id_configuration_id_key";

-- AlterTable
ALTER TABLE "quotation_configurations" ADD COLUMN     "change_description" TEXT,
ADD COLUMN     "is_current_version" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "previous_value_hash" TEXT,
ADD COLUMN     "quotation_version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "quotation_configurations_quotation_id_configuration_id_quot_key" ON "quotation_configurations"("quotation_id", "configuration_id", "quotation_version");
