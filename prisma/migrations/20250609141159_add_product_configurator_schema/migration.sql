/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `group_role_mappings` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ConfigurationType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'BOOLEAN', 'TEXT', 'NUMBER');

-- CreateEnum
CREATE TYPE "ConfigurationDependencyAction" AS ENUM ('SHOW', 'HIDE', 'REQUIRE', 'DISABLE');

-- CreateEnum
CREATE TYPE "ValidationRuleType" AS ENUM ('MIN_VALUE', 'MAX_VALUE', 'REGEX', 'CUSTOM');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role";

-- DropTable
DROP TABLE "group_role_mappings";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "permissions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "assigned_by" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "group_id" TEXT,
    "tags" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuration_tabs" (
    "id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuration_tabs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "help_text" TEXT NOT NULL,
    "type" "ConfigurationType" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "ai_logic_hint" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuration_options" (
    "id" TEXT NOT NULL,
    "configuration_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "price_modifier" DECIMAL(10,2),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "availability_conditions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuration_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tab_configurations" (
    "id" TEXT NOT NULL,
    "tab_id" TEXT NOT NULL,
    "configuration_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "custom_label" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "visibility_conditions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tab_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuration_dependencies" (
    "id" TEXT NOT NULL,
    "parent_configuration_id" TEXT NOT NULL,
    "child_configuration_id" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "action" "ConfigurationDependencyAction" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuration_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_rules" (
    "id" TEXT NOT NULL,
    "configuration_id" TEXT NOT NULL,
    "rule_type" "ValidationRuleType" NOT NULL,
    "rule_value" TEXT NOT NULL,
    "error_message" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "machine_groups_name_key" ON "machine_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tab_configurations_tab_id_configuration_id_key" ON "tab_configurations"("tab_id", "configuration_id");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "machine_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration_tabs" ADD CONSTRAINT "configuration_tabs_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration_options" ADD CONSTRAINT "configuration_options_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_configurations" ADD CONSTRAINT "tab_configurations_tab_id_fkey" FOREIGN KEY ("tab_id") REFERENCES "configuration_tabs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_configurations" ADD CONSTRAINT "tab_configurations_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration_dependencies" ADD CONSTRAINT "configuration_dependencies_parent_configuration_id_fkey" FOREIGN KEY ("parent_configuration_id") REFERENCES "configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration_dependencies" ADD CONSTRAINT "configuration_dependencies_child_configuration_id_fkey" FOREIGN KEY ("child_configuration_id") REFERENCES "configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_rules" ADD CONSTRAINT "validation_rules_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
