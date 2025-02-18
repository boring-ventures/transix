/*
  Warnings:

  - You are about to drop the column `user_id` on the `profiles` table. All the data in the column will be lost.
  - Made the column `active` on table `profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."profiles" DROP COLUMN "user_id",
ADD COLUMN     "email" TEXT,
ALTER COLUMN "role" SET DEFAULT 'superadmin',
ALTER COLUMN "active" SET NOT NULL;

-- RenameForeignKey
ALTER TABLE "public"."profiles" RENAME CONSTRAINT "profiles_branch_id_branches_id_fk" TO "profiles_branch_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."profiles" RENAME CONSTRAINT "profiles_company_id_companies_id_fk" TO "profiles_company_id_fkey";
