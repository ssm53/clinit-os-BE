-- CreateTable
CREATE TABLE "Medicine" (
    "id" SERIAL NOT NULL,
    "medicine" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);
