/*
  Warnings:

  - A unique constraint covering the columns `[medicine]` on the table `Medicine` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Medicine_medicine_key" ON "Medicine"("medicine");
