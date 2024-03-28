/*
  Warnings:

  - You are about to drop the `CashRevenue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CashRevenue" DROP CONSTRAINT "CashRevenue_appointmentID_fkey";

-- DropForeignKey
ALTER TABLE "CashRevenue" DROP CONSTRAINT "CashRevenue_patientIC_fkey";

-- DropTable
DROP TABLE "CashRevenue";
