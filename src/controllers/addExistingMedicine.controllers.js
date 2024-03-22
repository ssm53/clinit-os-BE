import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const existingMedicineAdded = await prisma.medicine.updateMany({
      where: {
        medicine: data.name,
      },
      data: {
        quantity: data.quantity,
      },
    });

    return res.status(200).json({ existingMedicineAdded });
  } catch (error) {
    console.error("Error adding medicine:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
