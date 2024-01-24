-- CreateTable
CREATE TABLE "MC" (
    "id" SERIAL NOT NULL,
    "appointmentID" INTEGER NOT NULL,
    "patientIC" TEXT,
    "name" TEXT NOT NULL,
    "mcStart" TIMESTAMP(3) NOT NULL,
    "mcEnd" TIMESTAMP(3) NOT NULL,
    "employer" TEXT,
    "reason" TEXT,

    CONSTRAINT "MC_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MC" ADD CONSTRAINT "MC_appointmentID_fkey" FOREIGN KEY ("appointmentID") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MC" ADD CONSTRAINT "MC_patientIC_fkey" FOREIGN KEY ("patientIC") REFERENCES "Patient"("IC") ON DELETE SET NULL ON UPDATE CASCADE;
