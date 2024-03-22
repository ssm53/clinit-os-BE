/*
  Warnings:

  - You are about to drop the `MC` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MC" DROP CONSTRAINT "MC_appointmentID_fkey";

-- DropForeignKey
ALTER TABLE "MC" DROP CONSTRAINT "MC_patientIC_fkey";

-- DropTable
DROP TABLE "MC";
