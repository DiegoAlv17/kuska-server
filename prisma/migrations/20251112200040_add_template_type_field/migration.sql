/*
  Warnings:

  - The `category` column on the `templates` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `industry` column on the `templates` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('SOFTWARE', 'MARKETING', 'DESIGN', 'OPERATIONS', 'RESEARCH', 'OTHER');

-- CreateEnum
CREATE TYPE "TemplateIndustry" AS ENUM ('TECH', 'FINANCE', 'HEALTHCARE', 'EDUCATION', 'RETAIL', 'MANUFACTURING', 'OTHER');

-- AlterTable
ALTER TABLE "templates" ADD COLUMN     "templateType" "TemplateType" DEFAULT 'SIMPLE',
DROP COLUMN "category",
ADD COLUMN     "category" "TemplateCategory",
DROP COLUMN "industry",
ADD COLUMN     "industry" "TemplateIndustry";
