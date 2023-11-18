-- CreateTable
CREATE TABLE "CashRevenue" (
    "id" SERIAL NOT NULL,
    "appointmentID" INTEGER NOT NULL,
    "patientIC" TEXT,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "CashRevenue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CashRevenue" ADD CONSTRAINT "CashRevenue_appointmentID_fkey" FOREIGN KEY ("appointmentID") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashRevenue" ADD CONSTRAINT "CashRevenue_patientIC_fkey" FOREIGN KEY ("patientIC") REFERENCES "Patient"("IC") ON DELETE SET NULL ON UPDATE CASCADE;
