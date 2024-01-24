-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "letterContent" TEXT DEFAULT 'null',
ADD COLUMN     "letterDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
