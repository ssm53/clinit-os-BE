/*
  Warnings:

  - The `contact` column on the `Patient` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_patientIC_fkey";

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "patientIC" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CashRevenue" ALTER COLUMN "patientIC" SET DEFAULT 'null';

-- AlterTable
ALTER TABLE "Documents" ALTER COLUMN "patientIC" SET DEFAULT 'null';

-- AlterTable
ALTER TABLE "Patient" ALTER COLUMN "IC" DROP NOT NULL,
ALTER COLUMN "IC" SET DEFAULT 'null',
DROP COLUMN "contact",
ADD COLUMN     "contact" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientIC_fkey" FOREIGN KEY ("patientIC") REFERENCES "Patient"("IC") ON DELETE SET NULL ON UPDATE CASCADE;
