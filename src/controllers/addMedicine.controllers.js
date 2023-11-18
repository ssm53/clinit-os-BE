import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { filter } from "../utils/common.js";
import { DateTime } from "luxon"; // Import luxon library

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const medicineAdded = await prisma.medicine.create({
      data: {
        medicine: data.name,
        quantity: data.quantity,
        price: data.price,
      },
    });

    return res.status(200).json({ medicineAdded });
  } catch (error) {
    console.error("Error adding medicine:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
