import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { filter } from "../utils/common.js";
import { DateTime } from "luxon"; // Import luxon library
import { validateExistingPatientAppt } from "../validators/existingPatientAppt.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const data = req.body;

  const validationErrors = validateExistingPatientAppt(data);
  console.log(validationErrors);

  if (Object.keys(validationErrors).length != 0)
    return res.status(400).send({
      error: validationErrors,
    });

  try {
    // make appt in appt table
    const appointment = await prisma.appointment.create({
      data: {
        date: data.date,
        reason: data.reason,
        patientIC: data.patientIC,
        status: "Booking",
      },
    });

    return res.status(200).json({ appointment: appointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
