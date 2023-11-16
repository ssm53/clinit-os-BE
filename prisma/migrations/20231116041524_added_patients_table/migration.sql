-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "IC" TEXT,
    "age" INTEGER NOT NULL,
    "gender" TEXT,
    "email" TEXT NOT NULL,
    "contact" TEXT,
    "race" TEXT,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");
