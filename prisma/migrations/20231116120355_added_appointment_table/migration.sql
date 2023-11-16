/*
  Warnings:

  - A unique constraint covering the columns `[IC]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Made the column `IC` on table `Patient` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Patient" ALTER COLUMN "IC" SET NOT NULL;

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "patientIC" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_IC_key" ON "Patient"("IC");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientIC_fkey" FOREIGN KEY ("patientIC") REFERENCES "Patient"("IC") ON DELETE RESTRICT ON UPDATE CASCADE;
