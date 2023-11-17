import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { filter } from "../utils/common.js";
import { DateTime } from "luxon"; // Import luxon library

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const malaysiaTime = DateTime.local().setZone("Asia/Kuala_Lumpur");
    console.log("Current time in Malaysia:", malaysiaTime.toISO());

    const appointment = await prisma.appointment.create({
      data: {
        reason: data.appointmentDetails.reason,
        patientIC: data.appointmentDetails.patientIC,
        doctor: data.appointmentDetails.doctor,
        status: "Waiting",
        arrivalTime: malaysiaTime.toJSDate(), // Convert to JavaScript Date object
        date: malaysiaTime.toJSDate(), // Set the date to the current date in Malaysia
      },
    });

    return res.status(200).json({ appointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
