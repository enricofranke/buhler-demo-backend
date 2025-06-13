-- CreateEnum
CREATE TYPE "RuleCategory" AS ENUM ('DEPENDENCY', 'VALIDATION', 'BUSINESS_LOGIC', 'PRICING', 'UI_BEHAVIOR', 'COMPLIANCE', 'WORKFLOW');

-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('SHOW_HIDE', 'REQUIRE_OPTIONAL', 'ENABLE_DISABLE', 'SET_DEFAULT', 'PRICE_MODIFIER', 'ADD_OPTIONS', 'RESTRICT_OPTIONS', 'VALIDATION_CHECK', 'WARNING_MESSAGE', 'ERROR_MESSAGE', 'CUSTOM_ACTION');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('SIMPLE_EQUALS', 'COMPLEX_LOGIC', 'CALCULATION', 'EXTERNAL_API', 'CUSTOM_FUNCTION');

-- CreateEnum
CREATE TYPE "ConditionTargetType" AS ENUM ('CONFIGURATION', 'OPTION', 'CUSTOM_FIELD', 'CALCULATED_VALUE', 'EXTERNAL_DATA');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('MODIFY_VISIBILITY', 'MODIFY_REQUIREMENT', 'MODIFY_AVAILABILITY', 'SET_VALUE', 'MODIFY_PRICE', 'SHOW_MESSAGE', 'TRIGGER_VALIDATION', 'CUSTOM_SCRIPT');

-- CreateEnum
CREATE TYPE "ActionTargetType" AS ENUM ('CONFIGURATION', 'OPTION', 'TAB', 'PRICE', 'MESSAGE', 'VALIDATION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ConditionOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'CONTAINS', 'NOT_CONTAINS', 'IN_LIST', 'NOT_IN_LIST', 'REGEX_MATCH', 'IS_EMPTY', 'IS_NOT_EMPTY', 'CUSTOM_LOGIC');

-- CreateEnum
CREATE TYPE "LogicalOperator" AS ENUM ('AND', 'OR', 'XOR', 'NOT');

-- CreateTable
CREATE TABLE "rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "RuleCategory" NOT NULL,
    "ruleType" "RuleType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "created_by" TEXT,
    "last_modified_by" TEXT,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_conditions" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "condition_type" "ConditionType" NOT NULL,
    "target_type" "ConditionTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "operator" "ConditionOperator" NOT NULL,
    "expected_value" TEXT,
    "custom_logic" TEXT,
    "condition_group" TEXT,
    "logical_operator" "LogicalOperator" NOT NULL DEFAULT 'AND',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rule_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_actions" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "action_type" "ActionType" NOT NULL,
    "target_type" "ActionTargetType" NOT NULL,
    "target_id" TEXT,
    "action_value" TEXT,
    "action_data" JSONB,
    "message" TEXT,
    "execution_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rule_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuration_rules" (
    "id" TEXT NOT NULL,
    "configuration_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "applied_order" INTEGER NOT NULL DEFAULT 0,
    "custom_parameters" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuration_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_rules" (
    "id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "apply_to_all_configs" BOOLEAN NOT NULL DEFAULT false,
    "specific_tabs" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "RuleCategory" NOT NULL,
    "template_data" JSONB NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rule_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependency_evaluation_cache" (
    "id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "configuration_hash" TEXT NOT NULL,
    "visible_configurations" TEXT[],
    "required_configurations" TEXT[],
    "available_options" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dependency_evaluation_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuration_rules_configuration_id_rule_id_key" ON "configuration_rules"("configuration_id", "rule_id");

-- CreateIndex
CREATE UNIQUE INDEX "machine_rules_machine_id_rule_id_key" ON "machine_rules"("machine_id", "rule_id");

-- CreateIndex
CREATE UNIQUE INDEX "dependency_evaluation_cache_machine_id_configuration_hash_key" ON "dependency_evaluation_cache"("machine_id", "configuration_hash");

-- AddForeignKey
ALTER TABLE "rule_conditions" ADD CONSTRAINT "rule_conditions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_actions" ADD CONSTRAINT "rule_actions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration_rules" ADD CONSTRAINT "configuration_rules_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration_rules" ADD CONSTRAINT "configuration_rules_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_rules" ADD CONSTRAINT "machine_rules_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_rules" ADD CONSTRAINT "machine_rules_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependency_evaluation_cache" ADD CONSTRAINT "dependency_evaluation_cache_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
