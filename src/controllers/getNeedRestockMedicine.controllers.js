import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

// get all meds which have quantitiy less than 5
router.get("/", async (req, res) => {
  try {
    const restockMeds = await prisma.medicine.findMany({
      where: {
        // here I want to find details of the medicine where the quantity field is less or equal to 5.
        quantity: {
          lte: 5, // lte stands for "less than or equal to"
        },
      },
    });

    console.log(restockMeds);

    return res.json({ restockMeds });
  } catch (error) {
    console.error("Error finding info:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
