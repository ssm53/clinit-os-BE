import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { filter } from "../utils/common.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const data = req.body;
    console.log(data.reason);
    console.log(data.patientIC);

    const appointment = await prisma.appointment.create({
      data: {
        reason: data.appointmentDetails.reason,
        patientIC: data.appointmentDetails.patientIC,
      },
    });

    return res.status(200).json({ appointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
