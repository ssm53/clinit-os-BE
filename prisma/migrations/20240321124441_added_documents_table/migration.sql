/*
  Warnings:

  - You are about to drop the column `documents` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "documents";

-- CreateTable
CREATE TABLE "Documents" (
    "id" SERIAL NOT NULL,
    "appointmentID" INTEGER NOT NULL,
    "patientIC" TEXT,
    "name" TEXT,
    "caption" TEXT,
    "dateAdded" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_appointmentID_fkey" FOREIGN KEY ("appointmentID") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_patientIC_fkey" FOREIGN KEY ("patientIC") REFERENCES "Patient"("IC") ON DELETE SET NULL ON UPDATE CASCADE;
