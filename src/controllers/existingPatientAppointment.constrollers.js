import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { filter } from "../utils/common.js";
import { DateTime } from "luxon"; // Import luxon library

const router = express.Router();

router.post("/", async (req, res) => {
  const data = req.body;

  try {
    const malaysiaTime = DateTime.local().setZone("Asia/Kuala_Lumpur");
    const adjustedTime = malaysiaTime.plus({ hours: 8 });

    // make appt in appt table
    const appointment = await prisma.appointment.create({
      data: {
        reason: data.reason,
        patientIC: data.patientIC,
        doctor: data.doctor,
        status: "Waiting",
        arrivalTime: adjustedTime,
        date: adjustedTime,
      },
    });

    return res.status(200).json({ appointment: appointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
